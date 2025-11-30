<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;

class projectsRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'project_title' => 'required|string|max:200',
            'project_description' => 'required|string',
            'project_location' => 'required|string',
            'budget_range_min' => 'required|numeric|min:0',
            'budget_range_max' => 'required|numeric|min:0|gte:budget_range_min',
            'lot_size' => 'required|integer|min:1',
            'floor_area' => 'required|integer|min:1',
            'property_type' => 'required|in:Residential,Commercial,Industrial,Agricultural',
            'type_id' => 'required|integer|exists:contractor_types,type_id',
            'bidding_deadline' => 'required|date|after:now',
            'building_permit' => 'required|file|mimes:jpg,jpeg,png|max:10240',
            'title_of_land' => 'required|file|mimes:jpg,jpeg,png|max:10240',
            'blueprint' => 'nullable|array',
            'blueprint.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'desired_design' => 'nullable|array',
            'desired_design.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'others' => 'nullable|array',
            'others.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240'
        ];

        // If selected contractor type is 'Others', require the free-text field
        try {
            $othersType = DB::table('contractor_types')
                ->whereRaw("LOWER(TRIM(type_name)) = 'others'")
                ->first();
            if ($othersType && intval($this->input('type_id')) === intval($othersType->type_id)) {
                $rules['if_others_ctype'] = 'required|string|max:200';
            }
        } catch (\Exception $e) {
            // ignore DB errors and don't apply conditional rule
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'project_title.required' => 'Project title is required.',
            'project_title.max' => 'Project title cannot exceed 200 characters.',
            'project_description.required' => 'Project description is required.',
            'project_location.required' => 'Project location is required.',
            'budget_range_min.required' => 'Minimum budget is required.',
            'budget_range_min.numeric' => 'Minimum budget must be a number.',
            'budget_range_max.required' => 'Maximum budget is required.',
            'budget_range_max.numeric' => 'Maximum budget must be a number.',
            'budget_range_max.gte' => 'Maximum budget must be greater than or equal to minimum budget.',
            'lot_size.required' => 'Lot size is required.',
            'lot_size.integer' => 'Lot size must be an integer.',
            'floor_area.required' => 'Floor area is required.',
            'floor_area.integer' => 'Floor area must be an integer.',
            'property_type.required' => 'Property type is required.',
            'property_type.in' => 'Invalid property type selected.',
            'type_id.required' => 'Contractor type is required.',
            'type_id.exists' => 'Invalid contractor type selected.',
            'if_others_ctype.required' => 'Please specify the contractor type when selecting Others.',
            'if_others_ctype.string' => 'Invalid value for specified contractor type.',
            'if_others_ctype.max' => 'Specified contractor type cannot exceed 200 characters.',
            'bidding_deadline.required' => 'Bidding deadline is required.',
            'bidding_deadline.date' => 'Bidding deadline must be a valid date.',
            'bidding_deadline.after' => 'Bidding deadline must be in the future.',
            'building_permit.required' => 'Building permit file is required.',
            'building_permit.file' => 'Building permit must be a valid file.',
            'building_permit.mimes' => 'Building permit must be a photo (JPG, JPEG, or PNG format).',
            'title_of_land.required' => 'Title of land file is required.',
            'title_of_land.file' => 'Title of land must be a valid file.',
            'title_of_land.mimes' => 'Title of land must be a photo (JPG, JPEG, or PNG format).',
            'blueprint.array' => 'Blueprint must be an array.',
            'blueprint.*.file' => 'Each blueprint file must be a valid file.',
            'blueprint.*.mimes' => 'Each blueprint file must be PDF, DOC, DOCX, JPG, JPEG, or PNG format.',
            'desired_design.array' => 'Desired design must be an array.',
            'desired_design.*.file' => 'Each desired design file must be a valid file.',
            'desired_design.*.mimes' => 'Each desired design file must be PDF, DOC, DOCX, JPG, JPEG, or PNG format.',
            'others.array' => 'Other files must be an array.',
            'others.*.file' => 'Each other file must be a valid file.',
            'others.*.mimes' => 'Each other file must be PDF, DOC, DOCX, JPG, JPEG, or PNG format.',
            'others.*.max' => 'Each file must not exceed 10MB.'
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

