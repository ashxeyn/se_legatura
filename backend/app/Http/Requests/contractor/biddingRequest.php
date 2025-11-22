<?php

namespace App\Http\Requests\contractor;

use Illuminate\Foundation\Http\FormRequest;

class biddingRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'proposed_cost' => 'required|numeric|min:0',
            'estimated_timeline' => 'required|integer|min:1',
            'contractor_notes' => 'nullable|string|max:5000',
            'bid_files.*' => 'nullable|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,zip,rar'
        ];

        // For update, bid_id is required
        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['bid_id'] = 'required|integer|exists:bids,bid_id';
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'proposed_cost.required' => 'Proposed cost is required.',
            'proposed_cost.numeric' => 'Proposed cost must be a valid number.',
            'proposed_cost.min' => 'Proposed cost must be at least 0.',
            'estimated_timeline.required' => 'Estimated timeline is required.',
            'estimated_timeline.integer' => 'Estimated timeline must be a whole number.',
            'estimated_timeline.min' => 'Estimated timeline must be at least 1 month.',
            'contractor_notes.max' => 'Contractor notes cannot exceed 5000 characters.',
            'bid_files.*.file' => 'Each file must be a valid file.',
            'bid_files.*.max' => 'Each file cannot exceed 10MB.',
            'bid_files.*.mimes' => 'Files must be PDF, DOC, DOCX, JPG, JPEG, PNG, ZIP, or RAR format.',
            'bid_id.required' => 'Bid ID is required for update.',
            'bid_id.exists' => 'The specified bid does not exist.'
        ];
    }
}


