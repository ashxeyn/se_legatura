<?php

namespace App\Models\Both;

use Illuminate\Support\Facades\DB;

class disputeClass
{
    public function createDispute($data)
    {
        $disputeId = DB::table('disputes')->insertGetId([
            'project_id' => $data['project_id'],
            'raised_by_user_id' => $data['raised_by_user_id'],
            'against_user_id' => $data['against_user_id'],
            'milestone_id' => $data['milestone_id'] ?? null,
            'dispute_type' => $data['dispute_type'],
            'dispute_desc' => $data['dispute_desc'],
            'evidence_file' => $data['evidence_file'] ?? null,
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
                'd.dispute_type',
                'd.dispute_desc',
                'd.evidence_file',
                'd.dispute_status',
                'd.admin_response',
                'd.created_at as dispute_created_at',
                'd.resolved_at',
                'p.project_title',
                'm.milestone_name',
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
            ->leftJoin('users as raised_user', 'd.raised_by_user_id', '=', 'raised_user.user_id')
            ->leftJoin('users as against_user', 'd.against_user_id', '=', 'against_user.user_id')
            ->where('d.dispute_id', $disputeId)
            ->select(
                'd.dispute_id',
                'd.project_id',
                'd.raised_by_user_id',
                'd.against_user_id',
                'd.milestone_id',
                'd.dispute_type',
                'd.dispute_desc',
                'd.evidence_file',
                'd.dispute_status',
                'd.admin_response',
                'd.created_at as dispute_created_at',
                'd.resolved_at',
                'p.project_title',
                'p.project_description',
                'm.milestone_name',
                'raised_user.username as raised_by_username',
                'against_user.username as against_username'
            )
            ->first();
    }

    public function getUserProjects($userId)
    {
        return DB::table('projects as p')
            ->leftJoin('contractors as c', 'p.selected_contractor_id', '=', 'c.contractor_id')
            ->where(function($query) use ($userId) {
                $query->where('c.user_id', $userId)
                      ->orWhere('p.owner_id', $userId);
            })
            ->select(
                'p.project_id',
                'p.project_title',
                'p.project_description',
                'c.user_id as contractor_user_id',
                'p.owner_id',
                'p.project_status',
                'p.created_at'
            )
            ->orderBy('p.created_at', 'desc')
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
            ->leftJoin('contractors as c', 'p.selected_contractor_id', '=', 'c.contractor_id')
            ->where('p.project_id', $projectId)
            ->select(
                'p.project_id',
                'p.owner_id',
                'p.project_title',
                'c.user_id as contractor_id'
            )
            ->first();
    }

    public function getProjectDetailsById($projectId)
    {
        return DB::table('projects as p')
            ->leftJoin('property_owners as owner_user', 'p.owner_id', '=', 'owner_user.user_id')
            ->leftJoin('contractors as c', 'p.selected_contractor_id', '=', 'c.contractor_id')
            ->leftJoin('users as contractor_user', 'c.user_id', '=', 'contractor_user.user_id')
            ->where('p.project_id', $projectId)
            ->select(
                'p.*',
                DB::raw("CONCAT(owner_user.first_name, ' ', owner_user.last_name) as owner_name"),
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
            ->select(
                'm.milestone_id',
                'm.milestone_name',
                'm.milestone_description',
                'm.milestone_status',
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
        return DB::table('progress_files')
            ->where('item_id', $itemId)
            ->select('*')
            ->orderBy('uploaded_at', 'desc')
            ->get();
    }

    public function getPaymentsByItem($itemId)
    {
        return DB::table('milestone_payments')
            ->where('item_id', $itemId)
            ->select('*')
            ->orderBy('transaction_date', 'desc')
            ->get();
    }
}
