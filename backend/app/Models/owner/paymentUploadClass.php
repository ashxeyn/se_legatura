<?php

namespace App\Models\owner;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class paymentUploadClass
{
    public function createPayment($data)
    {
        // Insert only the columns that exist on the table (no timestamps column)
        $insert = [
            'item_id' => $data['item_id'],
            'project_id' => $data['project_id'],
            'owner_id' => $data['owner_id'],
            'contractor_user_id' => $data['contractor_user_id'] ?? null,
            'amount' => $data['amount'],
            'payment_type' => $data['payment_type'],
            'transaction_number' => $data['transaction_number'] ?? null,
            'receipt_photo' => $data['receipt_photo'] ?? null,
            'transaction_date' => $data['transaction_date'] ?? null,
            'payment_status' => $data['payment_status'] ?? 'submitted',
            'updated_at' => $data['updated_at'] ?? null,
        ];

        return DB::table('milestone_payments')->insertGetId($insert);
    }

    public function updatePayment($paymentId, $data)
    {
        // Ensure updated_at is set if provided, otherwise let DB default
        if (isset($data['updated_at']) && $data['updated_at'] === null) {
            unset($data['updated_at']);
        }
        return DB::table('milestone_payments')
            ->where('payment_id', $paymentId)
            ->update($data);
    }

    public function deletePayment($paymentId, $deletionReason = null)
    {
        // Soft-delete: mark payment_status as 'deleted' and keep the record
        $update = [
            'payment_status' => 'deleted',
            'updated_at' => date('Y-m-d H:i:s')
        ];

        if (!is_null($deletionReason)) {
            $update['deletion_reason'] = $deletionReason;
        }

        return DB::table('milestone_payments')->where('payment_id', $paymentId)->update($update);
    }

    public function getPaymentsByItem($itemId)
    {
        return DB::table('milestone_payments')
            ->where('item_id', $itemId)
            ->orderBy('transaction_date', 'desc')
            ->get();
    }

    public function getPaymentById($paymentId)
    {
        return DB::table('milestone_payments')->where('payment_id', $paymentId)->first();
    }
}
