<?php

namespace App\Models\Both;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class disputeClass
{
    public function createDispute($data)
    {
        $disputeId = DB::table('disputes')->insertGetId([
            'project_id' => $data['project_id'],
            'raised_by_user_id' => $data['raised_by_user_id'],
            'against_user_id' => $data['against_user_id'],
            'milestone_id' => $data['milestone_id'],
            'milestone_item_id' => $data['milestone_item_id'],
            'dispute_type' => $data['dispute_type'],
            'dispute_desc' => $data['dispute_desc'],
            'dispute_status' => 'open',
            'admin_response' => null,
            'created_at' => now(),
            'resolved_at' => null
        ]);

        return $disputeId;
    }

    public function getDisputesByUser($userId)
    {
        return DB::table('disputes as d')
            ->join('projects as p', 'd.project_id', '=', 'p.project_id')
            ->leftJoin('milestones as m', 'd.milestone_id', '=', 'm.milestone_id')
            ->leftJoin('milestone_items as mi', 'd.milestone_item_id', '=', 'mi.item_id')
            ->leftJoin('users as raised_user', 'd.raised_by_user_id', '=', 'raised_user.user_id')
            ->leftJoin('users as against_user', 'd.against_user_id', '=', 'against_user.user_id')
            ->where(function($query) use ($userId) {
                $query->where('d.raised_by_user_id', $userId)
                      ->orWhere('d.against_user_id', $userId);
            })
            ->select(
                'd.dispute_id',
                'd.project_id',
                'd.raised_by_user_id',
                'd.against_user_id',
                'd.milestone_id',
                'd.milestone_item_id',
                'd.dispute_type',
                'd.dispute_desc',
                'd.dispute_status',
                'd.admin_response',
                'd.created_at as dispute_created_at',
                'd.resolved_at',
                'p.project_title',
                'm.milestone_name',
                'mi.milestone_item_title',
                'raised_user.username as raised_by_username',
                'against_user.username as against_username'
            )
            ->orderBy('d.created_at', 'desc')
            ->get();
    }

    public function getDisputeById($disputeId)
    {
        return DB::table('disputes as d')
            ->join('projects as p', 'd.project_id', '=', 'p.project_id')
            ->leftJoin('milestones as m', 'd.milestone_id', '=', 'm.milestone_id')
            ->leftJoin('milestone_items as mi', 'd.milestone_item_id', '=', 'mi.item_id')
            ->leftJoin('users as raised_user', 'd.raised_by_user_id', '=', 'raised_user.user_id')
            ->leftJoin('users as against_user', 'd.against_user_id', '=', 'against_user.user_id')
            ->where('d.dispute_id', $disputeId)
            ->select(
                'd.dispute_id',
                'd.project_id',
                'd.raised_by_user_id',
                'd.against_user_id',
                'd.milestone_id',
                'd.milestone_item_id',
                'd.dispute_type',
                'd.dispute_desc',
                'd.dispute_status',
                'd.admin_response',
                'd.created_at as dispute_created_at',
                'd.resolved_at',
                'p.project_title',
                'p.project_description',
                'm.milestone_name',
                'mi.milestone_item_title',
                'raised_user.username as raised_by_username',
                'against_user.username as against_username'
            )
            ->first();
    }

    public function getUserProjects($userId)
    {
        $currentRole = session('current_role');
        // Get owner_id from property_owners table
        $owner = DB::table('property_owners')->where('user_id', $userId)->first();
        $ownerId = $owner ? $owner->owner_id : null;

        $query = DB::table('projects as p')
            ->leftJoin('project_relationships as pr', 'p.relationship_id', '=', 'pr.rel_id')
            ->leftJoin('contractors as c', 'p.selected_contractor_id', '=', 'c.contractor_id');

        if ($currentRole === 'owner' && $ownerId) {
            $query->where('pr.owner_id', $ownerId);
        } else if ($currentRole === 'contractor') {
            $query->where('c.user_id', $userId);
        } else {
            $query->where(function($q) use ($userId, $ownerId) {
                $q->where('c.user_id', $userId);
                if ($ownerId) {
                    $q->orWhere('pr.owner_id', $ownerId);
                }
            });
        }

        return $query->select(
                'p.project_id',
                'p.project_title',
                'p.project_description',
                'c.user_id as contractor_user_id',
                'p.selected_contractor_id',
            'pr.owner_id',
                'p.project_status',
            'pr.created_at'
            )
        ->orderBy('pr.created_at', 'desc')
            ->get();
    }

    public function getMilestonesByProject($projectId)
    {
        return DB::table('milestones')
            ->where('project_id', $projectId)
            ->select(
                'milestone_id',
                'milestone_name',
                'milestone_description',
                'milestone_status',
                'start_date',
                'end_date'
            )
            ->orderBy('start_date')
            ->get();
    }

    public function getMilestoneItemsByMilestone($milestoneId)
    {
        return DB::table('milestone_items')
            ->where('milestone_id', $milestoneId)
            ->select('item_id as milestone_item_id', 'milestone_item_title', 'milestone_item_description')
            ->get();
    }

    public function updateDisputeStatus($disputeId, $status)
    {
        return DB::table('disputes')
            ->where('dispute_id', $disputeId)
            ->update([
                'dispute_status' => $status,
                'resolved_at' => ($status === 'resolved' || $status === 'closed') ? now() : null
            ]);
    }

    public function getProjectById($projectId)
    {
        return DB::table('projects as p')
            ->leftJoin('project_relationships as pr', 'p.relationship_id', '=', 'pr.rel_id')
            ->leftJoin('contractors as c', 'p.selected_contractor_id', '=', 'c.contractor_id')
            ->where('p.project_id', $projectId)
            ->select(
                'p.project_id',
                'pr.owner_id',
                'p.project_title',
                'c.user_id as contractor_id'
            )
            ->first();
    }

    public function getProjectDetailsById($projectId)
    {
        return DB::table('projects as p')
            ->leftJoin('project_relationships as pr', 'p.relationship_id', '=', 'pr.rel_id')
            ->leftJoin('property_owners as owner_user', 'pr.owner_id', '=', 'owner_user.owner_id')
            ->leftJoin('contractors as c', 'p.selected_contractor_id', '=', 'c.contractor_id')
            ->leftJoin('users as contractor_user', 'c.user_id', '=', 'contractor_user.user_id')
            ->where('p.project_id', $projectId)
            ->select(
                'p.*',
                'pr.owner_id',
                DB::raw("CONCAT(owner_user.first_name, ' ', COALESCE(owner_user.middle_name, ''), ' ', owner_user.last_name) as owner_name"),
                'c.company_name as contractor_username',
                'c.user_id as contractor_user_id',
                'c.company_name as contractor_company_name'
            )
            ->first();
    }

    public function getProjectMilestonesWithItems($projectId)
    {
        return DB::table('milestones as m')
            ->leftJoin('milestone_items as mi', 'm.milestone_id', '=', 'mi.milestone_id')
            ->where('m.project_id', $projectId)
            ->where(function($query) {
                $query->where('m.is_deleted', 0)
                      ->orWhereNull('m.is_deleted'); // Exclude deleted milestones
            })
            ->select(
                'm.milestone_id',
                'm.milestone_name',
                'm.milestone_description',
                'm.milestone_status',
                'm.setup_status',
                'm.setup_rej_reason',
                'm.start_date',
                'm.end_date',
                'mi.item_id',
                'mi.milestone_item_title',
                'mi.milestone_item_description',
                'mi.percentage_progress',
                'mi.milestone_item_cost',
                'mi.date_to_finish',
                'mi.sequence_order'
            )
            ->orderBy('m.milestone_id')
            ->orderBy('mi.sequence_order')
            ->get();
    }

    public function getProgressFilesByItem($itemId)
    {
        $progressList = DB::table('progress')
            ->where('milestone_item_id', $itemId)
            ->where('progress_status', '!=', 'deleted')
            ->select(
                'progress_id',
                'milestone_item_id as item_id',
                'purpose',
                'progress_status',
                'submitted_at'
            )
            ->orderBy('submitted_at', 'desc')
            ->get();

        $result = [];
        foreach ($progressList as $progress) {
            $files = DB::table('progress_files')
                ->where('progress_id', $progress->progress_id)
                ->select(
                    'file_id',
                    'progress_id',
                    'file_path',
                    'original_name',
                    // 'uploaded_at',
                    // 'updated_at'
                )
                // ->orderBy('uploaded_at', 'desc')
                ->get();

            $progress->files = $files;
            $result[] = $progress;
        }

        return $result;
    }

    public function getPaymentsByItem($itemId)
    {
        return DB::table('milestone_payments')
            ->where('item_id', $itemId)
            ->where('payment_status', '!=', 'deleted')
            ->select('*')
            ->orderBy('transaction_date', 'desc')
            ->get();
    }

    public function createDisputeFile($disputeId, $filePath, $originalName, $mimeType, $size)
    {
        return DB::table('dispute_files')->insertGetId([
            'dispute_id' => $disputeId,
            'storage_path' => $filePath,
            'original_name' => $originalName,
            'mime_type' => $mimeType,
            'size' => $size,
            'uploaded_at' => now()
        ]);
    }

    public function getDisputeFiles($disputeId)
    {
        return DB::table('dispute_files')
            ->where('dispute_id', $disputeId)
            ->select(
                'file_id',
                'dispute_id',
                'storage_path',
                'original_name',
                'mime_type',
                'size',
                'uploaded_at'
            )
            ->orderBy('uploaded_at', 'desc')
            ->get();
    }

    public function getDisputesWithFiles($userId)
    {
        // Get disputes for the user
        $disputes = DB::table('disputes as d')
            ->join('projects as p', 'd.project_id', '=', 'p.project_id')
            ->leftJoin('milestones as m', 'd.milestone_id', '=', 'm.milestone_id')
            ->leftJoin('milestone_items as mi', 'd.milestone_item_id', '=', 'mi.item_id')
            ->leftJoin('users as raised_user', 'd.raised_by_user_id', '=', 'raised_user.user_id')
            ->leftJoin('users as against_user', 'd.against_user_id', '=', 'against_user.user_id')
            ->where(function($query) use ($userId) {
                $query->where('d.raised_by_user_id', $userId)
                      ->orWhere('d.against_user_id', $userId);
            })
            ->select(
                'd.dispute_id',
                'd.project_id',
                'd.raised_by_user_id',
                'd.against_user_id',
                'd.milestone_id',
                'd.milestone_item_id',
                'd.dispute_type',
                'd.dispute_desc',
                'd.dispute_status',
                'd.admin_response',
                'd.created_at as dispute_created_at',
                'd.resolved_at',
                'p.project_title',
                'm.milestone_name',
                'mi.milestone_item_title',
                'raised_user.username as raised_by_username',
                'against_user.username as against_username'
            )
            ->orderBy('d.created_at', 'desc')
            ->get();

        // Get files for each dispute
        foreach ($disputes as $dispute) {
            $dispute->files = $this->getDisputeFiles($dispute->dispute_id);
        }

        return $disputes;
    }

    public function validateProjectUsers($projectId)
    {
        $project = DB::table('projects as p')
            ->leftJoin('project_relationships as pr', 'p.relationship_id', '=', 'pr.rel_id')
            ->leftJoin('contractors as c', 'p.selected_contractor_id', '=', 'c.contractor_id')
            ->where('p.project_id', $projectId)
            ->select(
                'p.project_id',
                'pr.owner_id',
                'p.project_title',
                'c.user_id as contractor_id',
                'p.selected_contractor_id'
            )
            ->first();

        if (!$project || !$project->owner_id) {
            return ['valid' => false, 'message' => 'Project not found'];
        }

        $ownerExists = DB::table('property_owners')->where('owner_id', $project->owner_id)->exists();
        if (!$ownerExists) {
            return [
                'valid' => false,
                'message' => "Project owner (user_id: {$project->owner_id}) not found in users table"
            ];
        }

        // If project has contractor, check if contractor user exists
        if ($project->contractor_id) {
            $contractorExists = DB::table('users')->where('user_id', $project->contractor_id)->exists();
            if (!$contractorExists) {
                return [
                    'valid' => false,
                    'message' => "Project contractor (user_id: {$project->contractor_id}) not found in users table"
                ];
            }
        }

        return ['valid' => true, 'project' => $project];
    }

    public function getUserInfo($userId)
    {
        return DB::table('users')
            ->where('user_id', $userId)
            ->select('user_id', 'username', 'email', 'user_type')
            ->first();
    }

    public function hasOpenDisputeForMilestone($userId, $milestoneId)
    {
        return DB::table('disputes')
            ->where('milestone_id', $milestoneId)
            ->where('raised_by_user_id', $userId)
            ->whereIn('dispute_status', ['open', 'under_review'])
            ->exists();
    }

    public function hasOpenDisputeForProject($userId, $projectId)
    {
        return DB::table('disputes')
            ->where('project_id', $projectId)
            ->where('raised_by_user_id', $userId)
            ->whereNull('milestone_id')
            ->whereIn('dispute_status', ['open', 'under_review'])
            ->exists();
    }

    public function updateDispute($disputeId, $data)
    {
        $updateData = [];

        if (isset($data['dispute_type'])) {
            $updateData['dispute_type'] = $data['dispute_type'];
        }

        if (isset($data['dispute_desc'])) {
            $updateData['dispute_desc'] = $data['dispute_desc'];
        }

        if (isset($data['dispute_status'])) {
            $updateData['dispute_status'] = $data['dispute_status'];
        }

        if (!empty($updateData)) {
            return DB::table('disputes')
                ->where('dispute_id', $disputeId)
                ->update($updateData);
        }

        return false;
    }

    public function cancelDispute($disputeId)
    {
        return DB::table('disputes')
            ->where('dispute_id', $disputeId)
            ->update([
                'dispute_status' => 'cancelled',
                'resolved_at' => now()
            ]);
    }

    public function deleteDisputeFiles($disputeId)
    {
        $files = DB::table('dispute_files')
            ->where('dispute_id', $disputeId)
            ->get();

        foreach ($files as $file) {
            // Delete file from storage
            if (Storage::disk('public')->exists($file->storage_path)) {
                Storage::disk('public')->delete($file->storage_path);
            }
        }

        return DB::table('dispute_files')
            ->where('dispute_id', $disputeId)
            ->delete();
    }

    public function deleteDisputeFile($fileId)
    {
        $file = DB::table('dispute_files')
            ->where('file_id', $fileId)
            ->first();

        if ($file) {
            // Delete file from storage
            if (Storage::disk('public')->exists($file->storage_path)) {
                Storage::disk('public')->delete($file->storage_path);
            }

            return DB::table('dispute_files')
                ->where('file_id', $fileId)
                ->delete();
        }

        return false;
    }

    public function getDisputeFileById($fileId)
    {
        return DB::table('dispute_files')
            ->where('file_id', $fileId)
            ->first();
    }

    public function getEvidenceFile($fileId)
    {
        return DB::table('dispute_files')
            ->where('file_id', $fileId)
            ->first();
    }
}
