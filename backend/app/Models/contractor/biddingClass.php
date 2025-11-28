<?php

namespace App\Models\contractor;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class biddingClass
{
    public function getProjectForBidding($projectId)
    {
        return DB::table('projects')
            ->join('project_relationships', 'projects.relationship_id', '=', 'project_relationships.rel_id')
            ->join('contractor_types', 'projects.type_id', '=', 'contractor_types.type_id')
            ->join('property_owners', 'project_relationships.owner_id', '=', 'property_owners.owner_id')
            ->where('projects.project_id', $projectId)
            ->where('projects.project_status', 'open')
            ->where('project_relationships.project_post_status', 'approved')
            ->select(
                'projects.*',
                'contractor_types.type_name',
                'project_relationships.project_post_status',
                'project_relationships.bidding_due as bidding_deadline',
                'project_relationships.created_at',
                    DB::raw("CONCAT(property_owners.first_name, ' ', COALESCE(property_owners.middle_name, ''), ' ', property_owners.last_name) as owner_name")
                )
                ->first();
    }

    public function getProjectFiles($projectId)
    {
        return DB::table('project_files')
            ->where('project_id', $projectId)
            ->get();
    }

    public function getContractorBid($projectId, $contractorId)
    {
        return DB::table('bids')
            ->where('project_id', $projectId)
            ->where('contractor_id', $contractorId)
            ->first();
    }

    public function getBidFiles($bidId)
    {
        return DB::table('bid_files')
            ->where('bid_id', $bidId)
            ->get();
    }

    public function createBid($data)
    {
        return DB::table('bids')->insertGetId([
            'project_id' => $data['project_id'],
            'contractor_id' => $data['contractor_id'],
            'proposed_cost' => $data['proposed_cost'],
            'estimated_timeline' => $data['estimated_timeline'],
            'contractor_notes' => $data['contractor_notes'] ?? null,
            'bid_status' => 'submitted',
            'submitted_at' => now()
        ]);
    }

    public function createBidFile($data)
    {
        return DB::table('bid_files')->insertGetId([
            'bid_id' => $data['bid_id'],
            'file_name' => $data['file_name'],
            'file_path' => $data['file_path'],
            'description' => $data['description'] ?? null,
            'uploaded_at' => now()
        ]);
    }

    public function updateBid($bidId, $data)
    {
        return DB::table('bids')
            ->where('bid_id', $bidId)
            ->update([
                'proposed_cost' => $data['proposed_cost'],
                'estimated_timeline' => $data['estimated_timeline'],
                'contractor_notes' => $data['contractor_notes'] ?? null,
                'submitted_at' => now()
            ]);
    }

    public function deleteBidFiles($bidId)
    {
        $files = DB::table('bid_files')
            ->where('bid_id', $bidId)
            ->get();

        foreach ($files as $file) {
            if (Storage::disk('public')->exists($file->file_path)) {
                Storage::disk('public')->delete($file->file_path);
            }
        }

        return DB::table('bid_files')
            ->where('bid_id', $bidId)
            ->delete();
    }

    public function cancelBid($bidId)
    {
        // Update bid status to 'withdrawn' instead of deleting
        return DB::table('bids')
            ->where('bid_id', $bidId)
            ->update([
                'bid_status' => 'withdrawn'
            ]);
    }

    public function deleteBidFile($fileId)
    {
        $file = DB::table('bid_files')
            ->where('file_id', $fileId)
            ->first();

        if ($file && Storage::disk('public')->exists($file->file_path)) {
            Storage::disk('public')->delete($file->file_path);
        }

        return DB::table('bid_files')
            ->where('file_id', $fileId)
            ->delete();
    }
}

