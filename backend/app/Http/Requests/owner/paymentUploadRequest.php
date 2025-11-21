<?php

namespace App\Http\Requests\owner;

use Illuminate\Foundation\Http\FormRequest;

class paymentUploadRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'item_id' => 'required|integer',
            'project_id' => 'required|integer',
            'amount' => 'required|numeric',
            'payment_type' => 'required|string',
            'transaction_number' => 'nullable|string|max:100',
            'receipt_photo' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'transaction_date' => 'nullable|date'
        ];
    }
}
