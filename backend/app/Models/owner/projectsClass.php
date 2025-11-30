<?php

namespace App\Models\Owner;

use Illuminate\Support\Facades\DB;

class projectsClass
{
    public function createProjectRelationship($ownerId, $biddingDeadline)
    {
        // Convert datetime to date if needed
        $biddingDue = date('Y-m-d', strtotime($biddingDeadline));

        return DB::table('project_relationships')->insertGetId([
            'owner_id' => $ownerId,
            'project_post_status' => 'under_review',
            'bidding_due' => $biddingDue,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    public function createProject($data)
    {
        return DB::table('projects')->insertGetId([
            'relationship_id' => $data['relationship_id'],
            'project_title' => $data['project_title'],
            'project_description' => $data['project_description'],
            'project_location' => $data['project_location'],
            'budget_range_min' => $data['budget_range_min'],
            'budget_range_max' => $data['budget_range_max'],
            'lot_size' => $data['lot_size'],
            'floor_area' => $data['floor_area'],
            'property_type' => $data['property_type'],
            'type_id' => $data['type_id'],
            'if_others_ctype' => $data['if_others_ctype'] ?? null,
            'to_finish' => $data['to_finish'] ?? null,
            'project_status' => 'open'
        ]);
    }

    public function createProjectFile($data)
    {
        return DB::table('project_files')->insertGetId([
            'project_id' => $data['project_id'],
            'file_type' => $data['file_type'],
            'file_path' => $data['file_path'],
            'uploaded_at' => now()
        ]);
    }

    public function getOwnerProjects($ownerId)
    {
        // Get projects with relationship_id (new schema)
        return DB::table('projects')
            ->join('project_relationships', 'projects.relationship_id', '=', 'project_relationships.rel_id')
            ->join('contractor_types', 'projects.type_id', '=', 'contractor_types.type_id')
            ->where('project_relationships.owner_id', $ownerId)
            ->where('project_relationships.project_post_status', '!=', 'deleted')
            ->select(
                'projects.project_id',
                'projects.project_title',
                'projects.project_description',
                'projects.project_location',
                'projects.budget_range_min',
                'projects.budget_range_max',
                'projects.lot_size',
                'projects.floor_area',
                'projects.property_type',
                'projects.type_id',
                'contractor_types.type_name',
                'projects.project_status',
                'project_relationships.project_post_status',
                DB::raw('project_relationships.bidding_due as bidding_deadline'),
                'project_relationships.created_at'
            )
            ->orderBy('project_relationships.created_at', 'desc')
            ->get();
    }

    public function getApprovedProjects()
    {
        return DB::table('projects')
            ->join('project_relationships', 'projects.relationship_id', '=', 'project_relationships.rel_id')
            ->join('contractor_types', 'projects.type_id', '=', 'contractor_types.type_id')
            ->join('property_owners', 'project_relationships.owner_id', '=', 'property_owners.owner_id')
            ->join('users', 'property_owners.user_id', '=', 'users.user_id')
            ->where('project_relationships.project_post_status', 'approved')
            ->where('projects.project_status', 'open')
            ->where(function($query) {
                // Show projects where bidding deadline hasn't passed, or no deadline is set
                $query->whereNull('project_relationships.bidding_due')
                      ->orWhere('project_relationships.bidding_due', '>=', date('Y-m-d'));
            })
            ->select(
                'projects.project_id',
                'projects.project_title',
                'projects.project_description',
                'projects.project_location',
                'projects.budget_range_min',
                'projects.budget_range_max',
                'projects.lot_size',
                'projects.floor_area',
                'projects.property_type',
                'projects.type_id',
                'contractor_types.type_name',
                'projects.project_status',
                'project_relationships.project_post_status',
                'project_relationships.bidding_due as bidding_deadline',
                'project_relationships.created_at',
                DB::raw("CONCAT(property_owners.first_name, ' ', COALESCE(property_owners.middle_name, ''), ' ', property_owners.last_name) as owner_name"),
                'users.profile_pic as owner_profile_pic',
                'users.user_id as owner_user_id'
            )
            ->orderBy('project_relationships.created_at', 'desc')
            ->get();
    }

    public function getProjectById($projectId)
    {
        return DB::table('projects')
            ->join('project_relationships', 'projects.relationship_id', '=', 'project_relationships.rel_id')
            ->join('contractor_types', 'projects.type_id', '=', 'contractor_types.type_id')
            ->join('property_owners', 'project_relationships.owner_id', '=', 'property_owners.owner_id')
            ->where('projects.project_id', $projectId)
            ->select(
                'projects.*',
                'contractor_types.type_name',
                'project_relationships.project_post_status',
                'project_relationships.bidding_due as bidding_deadline',
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

    public function updateProject($projectId, $data)
    {
        $update = [
            'project_title' => $data['project_title'],
            'project_description' => $data['project_description'],
            'project_location' => $data['project_location'],
            'budget_range_min' => $data['budget_range_min'],
            'budget_range_max' => $data['budget_range_max'],
            'lot_size' => $data['lot_size'],
            'floor_area' => $data['floor_area'],
            'property_type' => $data['property_type'],
            'type_id' => $data['type_id'],
            'to_finish' => $data['to_finish'] ?? null
        ];

        if (array_key_exists('if_others_ctype', $data)) {
            $update['if_others_ctype'] = $data['if_others_ctype'];
        }

        return DB::table('projects')
            ->where('project_id', $projectId)
            ->update($update);
    }

    public function updateProjectRelationship($relationshipId, $biddingDeadline)
    {
        // Convert datetime to date if needed
        $biddingDue = date('Y-m-d', strtotime($biddingDeadline));

        return DB::table('project_relationships')
            ->where('rel_id', $relationshipId)
            ->update([
                'bidding_due' => $biddingDue,
                'project_post_status' => 'under_review',
                'updated_at' => now()
            ]);
    }

    public function deleteProjectFile($fileId)
    {
        return DB::table('project_files')
            ->where('file_id', $fileId)
            ->delete();
    }

    public function deleteProject($projectId)
    {
        $project = DB::table('projects')
            ->where('project_id', $projectId)
            ->first();

        if ($project && $project->relationship_id) {
            DB::table('project_relationships')
                ->where('rel_id', $project->relationship_id)
                ->update([
                    'project_post_status' => 'deleted',
                    'updated_at' => now()
                ]);
        }

        return true;
    }

    public function getContractorTypes()
    {
        return DB::table('contractor_types')
            ->orderBy('type_name')
            ->get();
    }

    public function verifyOwnerProject($projectId, $ownerId)
    {
        // Check via project_relationships
        return DB::table('projects')
            ->join('project_relationships', 'projects.relationship_id', '=', 'project_relationships.rel_id')
            ->where('projects.project_id', $projectId)
            ->where('project_relationships.owner_id', $ownerId)
            ->exists();
    }

    public function getActiveContractors($excludeUserId = null)
    {
        $query = DB::table('contractors as c')
            ->join('users as u', 'c.user_id', '=', 'u.user_id')
            ->join('contractor_types as ct', 'c.type_id', '=', 'ct.type_id')
            ->where('u.is_active', 1)
            ->where('u.is_verified', 1)
            ->where('c.verification_status', 'approved')
            ->select(
                'c.contractor_id',
                'c.company_name',
                'c.years_of_experience',
                'c.services_offered',
                'c.business_address',
                'c.company_website',
                'c.company_social_media',
                'c.company_description',
                'c.picab_number',
                'c.picab_category',
                'c.business_permit_number',
                'c.completed_projects',
                'c.created_at',
                'ct.type_name',
                'u.user_id',
                'u.username',
                'u.profile_pic',
                'u.cover_photo'
            );

        // Exclude current user if they have a contractor account
        if ($excludeUserId) {
            $query->where('c.user_id', '!=', $excludeUserId);
        }

        return $query->orderBy('c.created_at', 'desc')->get();
    }

    public function getProjectBids($projectId)
    {
        $bids = DB::table('bids as b')
            ->join('contractors as c', 'b.contractor_id', '=', 'c.contractor_id')
            ->join('users as u', 'c.user_id', '=', 'u.user_id')
            ->leftJoin('bid_files as bf', function($join) {
                $join->on('b.bid_id', '=', 'bf.bid_id');
            })
            ->where('b.project_id', $projectId)
            ->whereNotIn('b.bid_status', ['withdrawn'])
            ->select(
                'b.bid_id',
                'b.proposed_cost',
                'b.estimated_timeline',
                'b.contractor_notes',
                'b.bid_status',
                'b.submitted_at',
                'b.decision_date',
                'c.contractor_id',
                'c.company_name',
                'c.years_of_experience',
                'c.company_email',
                'c.company_phone',
                'c.company_website',
                'c.completed_projects',
                'u.username',
                'u.profile_pic',
                DB::raw('COUNT(DISTINCT bf.file_id) as file_count')
            )
            ->groupBy('b.bid_id', 'b.proposed_cost', 'b.estimated_timeline', 'b.contractor_notes',
                     'b.bid_status', 'b.submitted_at', 'b.decision_date', 'c.contractor_id',
                     'c.company_name', 'c.years_of_experience', 'c.company_email', 'c.company_phone',
                     'c.company_website', 'c.completed_projects', 'u.username', 'u.profile_pic')
            ->orderBy('b.submitted_at', 'desc')
            ->get();

        // Get bid files for each bid
        foreach ($bids as $bid) {
            $bid->files = DB::table('bid_files')
                ->where('bid_id', $bid->bid_id)
                ->get();
        }

        return $bids;
    }

    public function acceptBid($projectId, $bidId, $ownerId)
    {
        DB::beginTransaction();
        try {
            // Get the bid
            $bid = DB::table('bids')
                ->where('bid_id', $bidId)
                ->where('project_id', $projectId)
                ->first();

            if (!$bid) {
                throw new \Exception('Bid not found.');
            }

            // Verify project belongs to owner
            $project = DB::table('projects')
                ->join('project_relationships', 'projects.relationship_id', '=', 'project_relationships.rel_id')
                ->where('projects.project_id', $projectId)
                ->where('project_relationships.owner_id', $ownerId)
                ->first();

            if (!$project) {
                throw new \Exception('Project not found or you do not have permission.');
            }

            // Update the accepted bid
            DB::table('bids')
                ->where('bid_id', $bidId)
                ->update([
                    'bid_status' => 'accepted',
                    'decision_date' => now()
                ]);

            // Reject all other bids for this project
            DB::table('bids')
                ->where('project_id', $projectId)
                ->where('bid_id', '!=', $bidId)
                ->whereNotIn('bid_status', ['withdrawn', 'accepted'])
                ->update([
                    'bid_status' => 'rejected',
                    'decision_date' => now()
                ]);

            // Update project: set selected contractor and close bidding
            DB::table('projects')
                ->where('project_id', $projectId)
                ->update([
                    'selected_contractor_id' => $bid->contractor_id,
                    'project_status' => 'bidding_closed'
                ]);

            // Update project relationship selected contractor if column exists
            if ($project->relationship_id) {
                DB::table('project_relationships')
                    ->where('rel_id', $project->relationship_id)
                    ->update([
                        'selected_contractor_id' => $bid->contractor_id
                    ]);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}

