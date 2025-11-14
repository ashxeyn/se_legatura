<?php

namespace App\Http\Requests\Contractor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Session;

class cProcessRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $action = $this->route()->getActionMethod();

        switch ($action) {
            case 'milestoneStepOne':
                return $this->milestoneStep1Rules();
            case 'milestoneStepTwo':
                return $this->milestoneStep2Rules();
            case 'submitMilestone':
                return $this->submitMilestoneRules();
            default:
                return [];
        }
    }

    protected function milestoneStep1Rules()
    {
        return [
            'project_id' => 'required|integer',
            'milestone_name' => 'required|string|max:200',
            'milestone_description' => 'nullable|string|max:500',
            'payment_mode' => 'required|in:downpayment,full_payment'
        ];
    }

    protected function milestoneStep2Rules()
    {
        $step1 = Session::get('milestone_setup_step1');
        $rules = [
            'start_date' => [
                'required',
                'date'
            ],
            'end_date' => [
                'required',
                'date',
                'after:start_date'
            ],
            'total_project_cost' => 'required|numeric|min:0.01'
        ];

        if ($step1 && $step1['payment_mode'] === 'downpayment') {
            $rules['downpayment_amount'] = [
                'required',
                'numeric',
                'min:0',
                'lt:total_project_cost'
            ];
        }

        return $rules;
    }

    protected function submitMilestoneRules()
    {
        return [
            'items' => 'required|json'
        ];
    }

    public function withValidator($validator)
    {
        $action = $this->route()->getActionMethod();

        if ($action === 'submitMilestone') {
            $validator->after(function ($validator) {
                $this->validateMilestoneItems($validator);
            });
        }
    }

    protected function validateMilestoneItems($validator)
    {
        $step1 = Session::get('milestone_setup_step1');
        $step2 = Session::get('milestone_setup_step2');

        if (!$step1 || !$step2) {
            $validator->errors()->add('session', 'Session expired. Please start again.');
            return;
        }

        $itemsRaw = $this->input('items');
        $items = json_decode($itemsRaw, true);

        if (!is_array($items) || empty($items)) {
            $validator->errors()->add('items', 'Please add at least one milestone item');
            return;
        }

        $totalPercentage = 0;
        $startDate = strtotime($step2['start_date']);
        $endDate = strtotime($step2['end_date']);

        foreach ($items as $index => $item) {
            if (!isset($item['percentage'], $item['title'], $item['description'], $item['date_to_finish'])) {
                $validator->errors()->add('items', 'Each milestone item must have percentage, title, description, and date');
                return;
            }

            $percentage = (float) $item['percentage'];
            if ($percentage <= 0) {
                $validator->errors()->add('items', 'Percentage must be greater than zero');
                return;
            }

            $itemDate = strtotime($item['date_to_finish']);
            if ($itemDate === false) {
                $validator->errors()->add('items', 'Invalid date format for milestone item');
                return;
            }

            if ($itemDate < $startDate) {
                $validator->errors()->add('items', 'Milestone item date cannot be before the project start date');
                return;
            }

            if ($itemDate > $endDate) {
                $validator->errors()->add('items', 'Milestone item date cannot be after the project end date');
                return;
            }

            $totalPercentage += $percentage;
        }

        if (round($totalPercentage, 2) !== 100.00) {
            $validator->errors()->add('items', 'Milestone percentages must add up to exactly 100%');
            return;
        }

        $lastItem = end($items);
        $lastDate = strtotime($lastItem['date_to_finish']);
        if (date('Y-m-d', $lastDate) !== date('Y-m-d', $endDate)) {
            $validator->errors()->add('items', 'The last milestone item must finish on the project end date');
            return;
        }
    }

    public function messages()
    {
        return [
            'project_id.required' => 'Please select a project',
            'project_id.integer' => 'Invalid project selected',
            'milestone_name.required' => 'Milestone name is required',
            'milestone_name.max' => 'Milestone name must not exceed 200 characters',
            'payment_mode.required' => 'Please select a payment mode',
            'payment_mode.in' => 'Invalid payment mode selected',
            'start_date.required' => 'Start date is required',
            'start_date.date' => 'Invalid start date format',
            'end_date.required' => 'End date is required',
            'end_date.date' => 'Invalid end date format',
            'end_date.after' => 'End date must be after start date',
            'total_project_cost.required' => 'Total project cost is required',
            'total_project_cost.numeric' => 'Total project cost must be a number',
            'total_project_cost.min' => 'Total project cost must be greater than zero',
            'downpayment_amount.required' => 'Downpayment amount is required for downpayment plan',
            'downpayment_amount.numeric' => 'Downpayment amount must be a number',
            'downpayment_amount.min' => 'Downpayment amount must be greater than or equal to zero',
            'downpayment_amount.lt' => 'Downpayment must be less than the total project cost',
            'items.required' => 'Please provide at least one milestone item',
            'items.json' => 'Invalid milestone items data'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'errors' => $validator->errors()->all()
            ], 422)
        );
    }
}
