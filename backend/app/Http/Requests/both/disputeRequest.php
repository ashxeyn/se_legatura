<?php

namespace App\Http\Requests\Both;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class disputeRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $action = $this->route()->getActionMethod();

        switch ($action) {
            case 'fileDispute':
                return $this->fileDisputeRules();
            default:
                return [];
        }
    }

    protected function fileDisputeRules()
    {
        $rules = [
            'project_id' => [
                'required',
                'integer',
                'exists:projects,project_id',
                function ($attribute, $value, $fail) {
                    // Custom validation to ensure project has valid contractor and owner
                    $project = \DB::table('projects as p')
                        ->leftJoin('project_relationships as pr', 'p.relationship_id', '=', 'pr.rel_id')
                        ->leftJoin('contractors as c', 'p.selected_contractor_id', '=', 'c.contractor_id')
                        ->where('p.project_id', $value)
                        ->select('pr.owner_id', 'c.user_id as contractor_user_id')
                        ->first();

                    if (!$project) {
                        $fail('The selected project does not exist.');
                        return;
                    }

                    // Check if owner exists (via property_owners table for new schema, or users table for legacy)
                    if (!$project->owner_id) {
                        $fail('Project owner not found.');
                        return;
                    }
                    
                    // For new schema, check property_owners table; for legacy, check users table
                    $ownerExists = \DB::table('property_owners')->where('owner_id', $project->owner_id)->exists() ||
                                   \DB::table('users')->where('user_id', $project->owner_id)->exists();
                    
                    if (!$ownerExists) {
                        $fail('Project owner not found.');
                        return;
                    }

                    // Check if contractor exists in users table (only if project has a contractor)
                    if ($project->contractor_user_id && !\DB::table('users')->where('user_id', $project->contractor_user_id)->exists()) {
                        $fail('Project contractor user not found.');
                        return;
                    }
                }
            ],
            'milestone_id' => [
                'required',
                'integer',
                'exists:milestones,milestone_id'
            ],
            'milestone_item_id' => [
                'required',
                'integer',
                'exists:milestone_items,item_id',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $user = \Session::get('user');
                        if ($user) {
                            // Check for existing open disputes for this milestone item by the same user
                            $existingDispute = \DB::table('disputes')
                                ->where('milestone_item_id', $value)
                                ->where('raised_by_user_id', $user->user_id)
                                ->whereIn('dispute_status', ['open', 'under_review'])
                                ->first();

                            if ($existingDispute) {
                                $fail('You already have an open dispute for this milestone item. Please wait for it to be resolved or closed before filing another dispute.');
                            }
                        }
                    }
                }
            ],
            'dispute_type' => 'required|string|in:Payment,Delay,Quality,Others',
            'dispute_desc' => 'required|string|max:2000',
            // Legacy single file support
            'evidence_file' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf,doc,docx',
                'max:5120'
            ],
            // Multiple files support
            'evidence_files' => 'nullable|array|max:10',
            'evidence_files.*' => [
                'file',
                'mimes:jpg,jpeg,png,pdf,doc,docx',
                'max:5120'
            ]
        ];

        return $rules;
    }

    public function messages()
    {
        return [
            'project_id.required' => 'Please select a project.',
            'project_id.integer' => 'Invalid project selected.',
            'project_id.exists' => 'The selected project does not exist.',

            'milestone_id.integer' => 'Invalid milestone selected.',
            'milestone_id.exists' => 'The selected milestone does not exist.',

            'milestone_item_id.required' => 'Please select a milestone item.',
            'milestone_item_id.integer' => 'Invalid milestone item selected.',
            'milestone_item_id.exists' => 'The selected milestone item does not exist.',

            'dispute_type.required' => 'Please select a dispute type.',
            'dispute_type.in' => 'Invalid dispute type selected. Must be Payment, Delay, Quality, or Others.',

            'dispute_desc.required' => 'Please provide a detailed description of the dispute.',
            'dispute_desc.max' => 'Dispute description cannot exceed 2000 characters.',

            'evidence_file.file' => 'Evidence must be a valid file.',
            'evidence_file.mimes' => 'Evidence file must be JPG, JPEG, PNG, PDF, DOC, or DOCX format.',
            'evidence_file.max' => 'Evidence file must not exceed 5MB.',

            'evidence_files.array' => 'Evidence files must be an array.',
            'evidence_files.max' => 'You can upload a maximum of 10 evidence files.',
            'evidence_files.*.file' => 'Each evidence file must be a valid file.',
            'evidence_files.*.mimes' => 'Each evidence file must be JPG, JPEG, PNG, PDF, DOC, or DOCX format.',
            'evidence_files.*.max' => 'Each evidence file must not exceed 5MB.'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        $isMobileRequest = $this->expectsJson();

        $response = [
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ];

        if ($isMobileRequest) {
            $response['validation_errors'] = $validator->errors()->toArray();
            $response['message'] = 'Please check your input and try again';
        }

        throw new HttpResponseException(response()->json($response, 422));
    }
}
