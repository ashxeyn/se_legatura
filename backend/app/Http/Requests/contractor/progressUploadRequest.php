<?php

namespace App\Http\Requests\Contractor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class progressUploadRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'item_id' => [
                'required',
                'integer',
                'exists:milestone_items,item_id'
            ],
            'purpose' => 'required|string|max:1000',
            'progress_files' => 'required|array|min:1|max:10',
            'progress_files.*' => [
                'required',
                'file',
                'mimes:pdf,doc,docx,zip,jpg,jpeg,png',
                'max:10240' // 10MB
            ]
        ];
    }

    public function messages()
    {
        return [
            'item_id.required' => 'Milestone item is required.',
            'item_id.integer' => 'Invalid milestone item selected.',
            'item_id.exists' => 'The selected milestone item does not exist.',

            'purpose.required' => 'Please provide a purpose for this upload.',
            'purpose.max' => 'Purpose cannot exceed 1000 characters.',

            'progress_files.required' => 'Please upload at least one file.',
            'progress_files.array' => 'Progress files must be an array.',
            'progress_files.min' => 'Please upload at least one file.',
            'progress_files.max' => 'You can upload a maximum of 10 files.',

            'progress_files.*.required' => 'Each progress file is required.',
            'progress_files.*.file' => 'Each progress file must be a valid file.',
            'progress_files.*.mimes' => 'Each file must be PDF, DOC, DOCX, ZIP, JPG, JPEG, or PNG format.',
            'progress_files.*.max' => 'Each file must not exceed 10MB.'
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
