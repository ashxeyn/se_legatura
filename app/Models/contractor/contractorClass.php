<?php

namespace App\Models\contractor;

use Illuminate\Support\Facades\DB;

class contractorClass
{
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
		return DB::table('projects as p')
			->join('bids as b', function ($join) use ($contractorId) {
				$join->on('b.project_id', '=', 'p.project_id')
					->where('b.contractor_id', '=', $contractorId)
					->where('b.bid_status', '=', 'accepted');
			})
			->where('p.project_id', $projectId)
			->where('p.selected_contractor_id', $contractorId)
			->exists();
	}

	public function getContractorProjects($contractorId)
	{
		return DB::table('projects as p')
			->select(
				'p.project_id',
				'p.project_title',
				'p.project_description',
				'p.project_status'
			)
			->join('bids as b', function ($join) use ($contractorId) {
				$join->on('b.project_id', '=', 'p.project_id')
					->where('b.contractor_id', '=', $contractorId)
					->where('b.bid_status', '=', 'accepted');
			})
			->leftJoin('milestones as m', function ($join) use ($contractorId) {
				$join->on('m.project_id', '=', 'p.project_id')
					->where('m.contractor_id', '=', $contractorId);
			})
			->where('p.selected_contractor_id', $contractorId)
			->whereNull('m.milestone_id')
			->orderBy('p.project_title')
			->distinct()
			->get();
	}

	public function contractorHasMilestoneForProject($projectId, $contractorId)
	{
		return DB::table('milestones')
			->where('project_id', $projectId)
			->where('contractor_id', $contractorId)
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
		return DB::table('milestones')->insertGetId([
			'project_id' => $data['project_id'],
			'contractor_id' => $data['contractor_id'],
			'plan_id' => $data['plan_id'],
			'milestone_name' => $data['milestone_name'],
			'milestone_description' => $data['milestone_description'],
			'start_date' => $data['start_date'],
			'end_date' => $data['end_date'],
			'created_at' => now(),
			'updated_at' => now()
		]);
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
}
