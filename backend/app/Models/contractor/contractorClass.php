<?php

namespace App\Models\contractor;

use Illuminate\Support\Facades\DB;

class contractorClass
{

    // MILESTONE SETUP FUNCTIONS

	public function getContractorByUserId($userId)
	{
		return DB::table('contractors')
			->where('user_id', $userId)
			->first();
	}

	public function getContractorUserByUserId($userId)
	{
		return DB::table('contractor_users')
			->where('user_id', $userId)
			->first();
	}

	public function projectBelongsToContractor($projectId, $contractorId)
	{
		$project = DB::table('projects')
			->where('project_id', $projectId)
			->where('selected_contractor_id', $contractorId)
			->first();

		if ($project) {
			return true;
		}

		return DB::table('bids')
			->where('project_id', $projectId)
			->where('contractor_id', $contractorId)
			->where('bid_status', 'accepted')
			->exists();
	}

	public function getContractorProjects($contractorId, $excludeMilestoneId = null)
	{
		$query = DB::table('projects as p')
			->select(
				'p.project_id',
				'p.project_title',
				'p.project_description',
				'p.project_status'
			)
			->where('p.selected_contractor_id', $contractorId);
		
		// If editing a milestone, include projects with that milestone
		// Otherwise, exclude projects that already have milestones
		if ($excludeMilestoneId) {
			$query->where(function($q) use ($contractorId, $excludeMilestoneId) {
				$q->whereNotExists(function ($subQuery) use ($contractorId) {
					$subQuery->select(DB::raw(1))
						->from('milestones')
						->whereColumn('milestones.project_id', 'p.project_id')
						->where('milestones.contractor_id', $contractorId)
						->where(function($mQuery) {
							$mQuery->where('milestones.is_deleted', 0)
								   ->orWhereNull('milestones.is_deleted');
						});
				})
				->orWhereExists(function ($subQuery) use ($excludeMilestoneId) {
					$subQuery->select(DB::raw(1))
						->from('milestones')
						->whereColumn('milestones.project_id', 'p.project_id')
						->where('milestones.milestone_id', $excludeMilestoneId);
				});
			});
		} else {
			$query->whereNotExists(function ($subQuery) use ($contractorId) {
				$subQuery->select(DB::raw(1))
					->from('milestones')
					->whereColumn('milestones.project_id', 'p.project_id')
					->where('milestones.contractor_id', $contractorId)
					->where(function($mQuery) {
						$mQuery->where('milestones.is_deleted', 0)
							   ->orWhereNull('milestones.is_deleted');
					});
			});
		}
		
		return $query->orderBy('p.project_title')->get();
	}

	public function contractorHasMilestoneForProject($projectId, $contractorId)
	{
		return DB::table('milestones')
			->where('project_id', $projectId)
			->where('contractor_id', $contractorId)
			->where(function($query) {
				$query->where('is_deleted', 0)
					  ->orWhereNull('is_deleted');
			})
			->where(function($query) {
				// Exclude rejected milestones (contractor can resubmit after rejection)
				$query->whereNull('setup_status')
					  ->orWhere('setup_status', '!=', 'rejected');
			})
			->exists();
	}



	public function createPaymentPlan($data)
	{
		return DB::table('payment_plans')->insertGetId([
			'project_id' => $data['project_id'],
			'contractor_id' => $data['contractor_id'],
			'payment_mode' => $data['payment_mode'],
			'total_project_cost' => $data['total_project_cost'],
			'downpayment_amount' => $data['downpayment_amount'],
			'is_confirmed' => 0,
			'created_at' => now(),
			'updated_at' => now()
		]);
	}

	public function createMilestone($data)
	{
		$insertData = [
			'project_id' => $data['project_id'],
			'contractor_id' => $data['contractor_id'],
			'plan_id' => $data['plan_id'],
			'milestone_name' => $data['milestone_name'],
			'milestone_description' => $data['milestone_description'],
			'start_date' => $data['start_date'],
			'end_date' => $data['end_date'],
			'created_at' => now(),
			'updated_at' => now()
		];
		
		// Add setup_status if provided
		if (isset($data['setup_status'])) {
			$insertData['setup_status'] = $data['setup_status'];
		}
		
		return DB::table('milestones')->insertGetId($insertData);
	}

	public function createMilestoneItem($data)
	{
		return DB::table('milestone_items')->insertGetId([
			'milestone_id' => $data['milestone_id'],
			'sequence_order' => $data['sequence_order'],
			'percentage_progress' => $data['percentage_progress'],
			'milestone_item_title' => $data['milestone_item_title'],
			'milestone_item_description' => $data['milestone_item_description'],
			'milestone_item_cost' => $data['milestone_item_cost'],
			'date_to_finish' => $data['date_to_finish']
		]);
	}

	public function getMilestoneById($milestoneId, $contractorId)
	{
		return DB::table('milestones as m')
			->join('payment_plans as pp', 'm.plan_id', '=', 'pp.plan_id')
			->where('m.milestone_id', $milestoneId)
			->where('m.contractor_id', $contractorId)
			->select(
				'm.milestone_id',
				'm.project_id',
				'm.contractor_id',
				'm.plan_id',
				'm.milestone_name',
				'm.milestone_description',
				'm.milestone_status',
				'm.start_date',
				'm.end_date',
				'pp.payment_mode',
				'pp.total_project_cost',
				'pp.downpayment_amount'
			)
			->first();
	}

	public function getMilestoneItems($milestoneId)
	{
		return DB::table('milestone_items')
			->where('milestone_id', $milestoneId)
			->orderBy('sequence_order')
			->get();
	}

	public function updateMilestone($milestoneId, $data)
	{
		return DB::table('milestones')
			->where('milestone_id', $milestoneId)
			->update($data);
	}

	public function deleteMilestoneItems($milestoneId)
	{
		return DB::table('milestone_items')
			->where('milestone_id', $milestoneId)
			->delete();
	}

	public function updatePaymentPlan($planId, $data)
	{
		return DB::table('payment_plans')
			->where('plan_id', $planId)
			->update($data);
	}

}
