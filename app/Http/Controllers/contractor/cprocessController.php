<?php

namespace App\Http\Controllers\contractor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use App\Models\contractor\contractorClass;

class cprocessController extends Controller
{
	protected $contractorClass;

	public function __construct()
	{
		$this->contractorClass = new contractorClass();
	}

	public function showMilestoneSetupForm(Request $request)
	{
		if (!Session::has('user')) {
			return redirect('/accounts/login')->with('error', 'Please login first');
		}

		$user = Session::get('user');
		$contractor = $this->contractorClass->getContractorByUserId($user->user_id);

		if (!$contractor) {
			return redirect('/dashboard')->with('error', 'Contractor profile not found.');
		}

		$projectId = $request->query('project_id');
		$projects = $this->contractorClass->getContractorProjects($contractor->contractor_id);

		return view('contractor.milestoneSetup', [
			'projectId' => $projectId,
			'projects' => $projects,
			'contractor' => $contractor
		]);
	}

	public function milestoneStepOne(Request $request)
	{
		if (!Session::has('user')) {
			return response()->json([
				'success' => false,
				'errors' => ['Please login first']
			], 401);
		}

		$user = Session::get('user');
		$contractor = $this->contractorClass->getContractorByUserId($user->user_id);

		if (!$contractor) {
			return response()->json([
				'success' => false,
				'errors' => ['Contractor profile not found']
			], 404);
		}

		$validated = $request->validate([
			'project_id' => 'required|integer',
			'milestone_name' => 'required|string|max:200',
			'payment_mode' => 'required|in:downpayment,full_payment'
		]);

		if (!$this->contractorClass->projectBelongsToContractor($validated['project_id'], $contractor->contractor_id)) {
			return response()->json([
				'success' => false,
				'errors' => ['Selected project is not assigned to your company']
			], 403);
		}

		if ($this->contractorClass->contractorHasMilestoneForProject($validated['project_id'], $contractor->contractor_id)) {
			return response()->json([
				'success' => false,
				'errors' => ['This project already has a milestone plan.']
			], 409);
		}

		Session::put('milestone_setup_step1', [
			'project_id' => (int) $validated['project_id'],
			'contractor_id' => (int) $contractor->contractor_id,
			'milestone_name' => $validated['milestone_name'],
			'milestone_description' => $request->input('milestone_description', $validated['milestone_name']),
			'payment_mode' => $validated['payment_mode']
		]);

		Session::forget('milestone_setup_step2');
		Session::forget('milestone_setup_items');

		return response()->json([
			'success' => true,
			'step' => 2,
			'payment_mode' => $validated['payment_mode']
		]);
	}

	public function milestoneStepTwo(Request $request)
	{
		$step1 = Session::get('milestone_setup_step1');

		if (!$step1) {
			return response()->json([
				'success' => false,
				'errors' => ['Please complete the previous step first']
			], 400);
		}

		$rules = [
			'start_date' => 'required|date',
			'end_date' => 'required|date',
			'total_project_cost' => 'required|numeric|min:0.01'
		];

		if ($step1['payment_mode'] === 'downpayment') {
			$rules['downpayment_amount'] = 'required|numeric|min:0';
		}

		$validated = $request->validate($rules);

		$startDate = strtotime($validated['start_date']);
		$endDate = strtotime($validated['end_date']);

		if ($startDate === false || $endDate === false || $startDate > $endDate) {
			return response()->json([
				'success' => false,
				'errors' => ['Start date must be before end date']
			], 422);
		}

		$totalCost = (float) $validated['total_project_cost'];
		$downpayment = 0.00;

		if ($step1['payment_mode'] === 'downpayment') {
			$downpayment = (float) $validated['downpayment_amount'];
			if ($downpayment < 0 || $downpayment >= $totalCost) {
				return response()->json([
					'success' => false,
					'errors' => ['Downpayment must be less than the total project cost']
				], 422);
			}
		}

		Session::put('milestone_setup_step2', [
			'start_date' => date('Y-m-d 00:00:00', $startDate),
			'end_date' => date('Y-m-d 23:59:59', $endDate),
			'total_project_cost' => $totalCost,
			'downpayment_amount' => $downpayment
		]);

		return response()->json([
			'success' => true,
			'step' => 3,
			'start_date' => date('Y-m-d', $startDate),
			'end_date' => date('Y-m-d', $endDate),
			'payment_mode' => $step1['payment_mode']
		]);
	}

	public function submitMilestone(Request $request)
	{
		$step1 = Session::get('milestone_setup_step1');
		$step2 = Session::get('milestone_setup_step2');

		if (!$step1 || !$step2) {
			return response()->json([
				'success' => false,
				'errors' => ['Session expired. Please start again.']
			], 400);
		}

		$itemsRaw = $request->input('items');
		if (!$itemsRaw) {
			return response()->json([
				'success' => false,
				'errors' => ['Please provide at least one milestone item']
			], 422);
		}

		$items = json_decode($itemsRaw, true);
		if (!is_array($items) || empty($items)) {
			return response()->json([
				'success' => false,
				'errors' => ['Invalid milestone items data']
			], 422);
		}

		$totalPercentage = 0;
		$startDate = strtotime($step2['start_date']);
		$endDate = strtotime($step2['end_date']);

		foreach ($items as $item) {
			if (!isset($item['percentage'], $item['title'], $item['description'], $item['date_to_finish'])) {
				return response()->json([
					'success' => false,
					'errors' => ['Each milestone item must have percentage, title, description, and date']
				], 422);
			}

			$percentage = (float) $item['percentage'];
			if ($percentage <= 0) {
				return response()->json([
					'success' => false,
					'errors' => ['Milestone item percentages must be greater than zero']
				], 422);
			}

			$itemDate = strtotime($item['date_to_finish']);
			if ($itemDate === false || $itemDate < $startDate || $itemDate > $endDate) {
				return response()->json([
					'success' => false,
					'errors' => ['Milestone item dates must be within the project schedule']
				], 422);
			}

			$totalPercentage += $percentage;
		}

		if (round($totalPercentage, 2) !== 100.00) {
			return response()->json([
				'success' => false,
				'errors' => ['Milestone percentages must add up to exactly 100%']
			], 422);
		}

		$lastItem = end($items);
		$lastDate = strtotime($lastItem['date_to_finish']);
		if (date('Y-m-d', $lastDate) !== date('Y-m-d', $endDate)) {
			return response()->json([
				'success' => false,
				'errors' => ['The last milestone item must finish on the project end date']
			], 422);
		}

		try {
			DB::beginTransaction();

			$planId = $this->contractorClass->createPaymentPlan([
				'project_id' => $step1['project_id'],
				'contractor_id' => $step1['contractor_id'],
				'payment_mode' => $step1['payment_mode'],
				'total_project_cost' => $step2['total_project_cost'],
				'downpayment_amount' => $step2['downpayment_amount']
			]);

			$milestoneId = $this->contractorClass->createMilestone([
				'project_id' => $step1['project_id'],
				'contractor_id' => $step1['contractor_id'],
				'plan_id' => $planId,
				'milestone_name' => $step1['milestone_name'],
				'milestone_description' => $step1['milestone_description'],
				'start_date' => $step2['start_date'],
				'end_date' => $step2['end_date']
			]);

			$remainingAmount = $step2['total_project_cost'];
			if ($step1['payment_mode'] === 'downpayment') {
				$remainingAmount -= $step2['downpayment_amount'];
			}

			foreach ($items as $index => $item) {
				$percentage = (float) $item['percentage'];
				$itemCostBase = $step1['payment_mode'] === 'downpayment'
					? $remainingAmount
					: $step2['total_project_cost'];
				$calculatedCost = $itemCostBase * ($percentage / 100);

				$this->contractorClass->createMilestoneItem([
					'milestone_id' => $milestoneId,
					'sequence_order' => $index + 1,
					'percentage_progress' => $percentage,
					'milestone_item_title' => $item['title'],
					'milestone_item_description' => $item['description'],
					'milestone_item_cost' => round($calculatedCost, 2),
					'date_to_finish' => date('Y-m-d 23:59:59', strtotime($item['date_to_finish']))
				]);
			}

			DB::commit();
		} catch (\Exception $e) {
			DB::rollBack();
			return response()->json([
				'success' => false,
				'errors' => ['An error occurred while saving the milestone. Please try again.']
			], 500);
		}

		Session::forget('milestone_setup_step1');
		Session::forget('milestone_setup_step2');
		Session::forget('milestone_setup_items');

		return response()->json([
			'success' => true,
			'message' => 'Milestone plan created successfully!',
			'redirect' => '/dashboard'
		]);
	}
}
