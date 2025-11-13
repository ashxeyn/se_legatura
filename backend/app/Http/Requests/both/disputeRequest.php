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
        return [
            'project_id' => 'required|integer|exists:projects,project_id',
            'milestone_id' => 'nullable|integer|exists:milestones,milestone_id',
            'dispute_type' => 'required|string|in:Payment,Delay,Quality,Others',
            'dispute_desc' => 'required|string|max:2000',
            'evidence_file' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120'
            ]
        ];
    }

    public function messages()
    {
        return [
            'project_id.required' => 'Please select a project.',
            'project_id.integer' => 'Invalid project selected.',
            'project_id.exists' => 'The selected project does not exist.',

            'milestone_id.integer' => 'Invalid milestone selected.',
            'milestone_id.exists' => 'The selected milestone does not exist.',

            'dispute_type.required' => 'Please select a dispute type.',
            'dispute_type.in' => 'Invalid dispute type selected. Must be Payment, Delay, Quality, or Others.',

            'dispute_desc.required' => 'Please provide a detailed description of the dispute.',
            'dispute_desc.max' => 'Dispute description cannot exceed 2000 characters.',

            'evidence_file.file' => 'Evidence must be a valid file.',
            'evidence_file.mimes' => 'Evidence file must be JPG, JPEG, PNG, or PDF format.',
            'evidence_file.max' => 'Evidence file must not exceed 5MB.'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422));
    }
}
