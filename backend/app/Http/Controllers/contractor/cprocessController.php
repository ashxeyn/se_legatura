<?php

namespace App\Http\Controllers\contractor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contractor\cProcessRequest;
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
	private function checkContractorAccess(Request $request)
	{
		if (!Session::has('user')) {
			if ($request->expectsJson()) {
				return response()->json([
					'success' => false,
					'message' => 'Authentication required',
					'redirect_url' => '/accounts/login'
				], 401);
			} else {
				return redirect('/accounts/login')->with('error', 'Please login first');
			}
		}

		$user = Session::get('user');

		// Check if user has contractor role
		if (!in_array($user->user_type, ['contractor', 'both'])) {
			if ($request->expectsJson()) {
				return response()->json([
					'success' => false,
					'message' => 'Access denied. Only contractors can access milestone setup.',
					'redirect_url' => '/dashboard'
				], 403);
			} else {
				return redirect('/dashboard')->with('error', 'Access denied. Only contractors can access milestone setup.');
			}
		}

		// For 'both' users, check current active role
		if ($user->user_type === 'both') {
			$currentRole = Session::get('current_role', 'contractor');
			if ($currentRole !== 'contractor') {
				if ($request->expectsJson()) {
					return response()->json([
						'success' => false,
						'message' => 'Access denied. Please switch to contractor role to access milestone setup.',
						'redirect_url' => '/dashboard',
						'suggested_action' => 'switch_to_contractor'
					], 403);
				} else {
					return redirect('/dashboard')->with('error', 'Please switch to contractor role to access milestone setup.');
				}
			}
		}

		return null;
	}

	public function switchRole(Request $request)
	{
		if (!Session::has('user')) {
			if ($request->expectsJson()) {
				return response()->json([
					'success' => false,
					'message' => 'Authentication required',
					'redirect_url' => '/accounts/login'
				], 401);
			} else {
				return redirect('/accounts/login')->with('error', 'Please login first');
			}
		}

		$user = Session::get('user');

		if ($user->user_type !== 'both') {
			if ($request->expectsJson()) {
				return response()->json([
					'success' => false,
					'message' => 'Role switching not available for your account type.'
				], 403);
			} else {
				return redirect('/dashboard')->with('error', 'Role switching not available for your account type.');
			}
		}

		$targetRole = $request->input('role');

		if (!in_array($targetRole, ['contractor', 'owner'])) {
			if ($request->expectsJson()) {
				return response()->json([
					'success' => false,
					'message' => 'Invalid role specified. Must be "contractor" or "owner".'
				], 400);
			} else {
				return redirect('/dashboard')->with('error', 'Invalid role specified.');
			}
		}

		Session::put('current_role', $targetRole);

		if ($request->expectsJson()) {

			return response()->json([
				'success' => true,
				'message' => "Successfully switched to {$targetRole} role",
				'current_role' => $targetRole,
				'redirect_url' => '/dashboard'
			]);
		} else {

			return redirect('/dashboard')->with('success', "Successfully switched to {$targetRole} role");
		}
	}

	public function getCurrentRole(Request $request)
	{
		if (!Session::has('user')) {
			if ($request->expectsJson()) {
				return response()->json([
					'success' => false,
					'message' => 'Authentication required',
					'redirect_url' => '/accounts/login'
				], 401);
			} else {
				return redirect('/accounts/login')->with('error', 'Please login first');
			}
		}

		$user = Session::get('user');
		$currentRole = Session::get('current_role', $user->user_type === 'both' ? 'contractor' : $user->user_type);

		if ($request->expectsJson()) {
			return response()->json([
				'success' => true,
				'data' => [
					'user_type' => $user->user_type,
					'current_role' => $currentRole,
					'can_switch_roles' => $user->user_type === 'both'
				]
			]);
		} else {
			return response()->json([
				'user_type' => $user->user_type,
				'current_role' => $currentRole,
				'can_switch_roles' => $user->user_type === 'both'
			]);
		}
	}

	public function showMilestoneSetupForm(Request $request)
	{

		$accessCheck = $this->checkContractorAccess($request);
		if ($accessCheck) {
			return $accessCheck; // Return error response
		}

		$user = Session::get('user');
		$contractor = $this->contractorClass->getContractorByUserId($user->user_id);

		if (!$contractor) {
			if ($request->expectsJson()) {
				return response()->json([
					'success' => false,
					'message' => 'Contractor profile not found.',
					'redirect_url' => '/dashboard'
				], 404);
			} else {
				return redirect('/dashboard')->with('error', 'Contractor profile not found.');
			}
		}

		$projectId = $request->query('project_id');
		$projects = $this->contractorClass->getContractorProjects($contractor->contractor_id);

		if ($request->expectsJson()) {
			return response()->json([
				'success' => true,
				'message' => 'Milestone setup form data',
				'data' => [
					'project_id' => $projectId,
					'projects' => $projects,
					'contractor' => $contractor,
					'current_role' => Session::get('current_role', 'contractor')
				]
			], 200);
		} else {

			return view('contractor.milestoneSetup', [
				'projectId' => $projectId,
				'projects' => $projects,
				'contractor' => $contractor
			]);
		}
	}

	public function milestoneStepOne(cProcessRequest $request)
	{
		$accessCheck = $this->checkContractorAccess($request);
		if ($accessCheck) {
			return $accessCheck; // Return error response
		}

		$user = Session::get('user');
		$contractor = $this->contractorClass->getContractorByUserId($user->user_id);

		if (!$contractor) {
			return response()->json([
				'success' => false,
				'errors' => ['Contractor profile not found']
			], 404);
		}

		$validated = $request->validated();

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

	public function milestoneStepTwo(cProcessRequest $request)
	{
		
		$accessCheck = $this->checkContractorAccess($request);
		if ($accessCheck) {
			return $accessCheck; // Return error response
		}

		$step1 = Session::get('milestone_setup_step1');

		if (!$step1) {
			return response()->json([
				'success' => false,
				'errors' => ['Please complete the previous step first']
			], 400);
		}

		$validated = $request->validated();

		$startDate = strtotime($validated['start_date']);
		$endDate = strtotime($validated['end_date']);

		$totalCost = (float) $validated['total_project_cost'];
		$downpayment = 0.00;

		if ($step1['payment_mode'] === 'downpayment') {
			$downpayment = (float) $validated['downpayment_amount'];
		}

		Session::put('milestone_setup_step2', [
			'start_date' => date('Y-m-d 00:00:00', $startDate),
			'end_date' => date('Y-m-d 23:59:59', $endDate),
			'total_project_cost' => $totalCost,
			'downpayment_amount' => $downpayment
		]);

		if ($request->expectsJson()) {

			return response()->json([
				'success' => true,
				'message' => 'Milestone step 2 completed',
				'step' => 3,
				'start_date' => date('Y-m-d', $startDate),
				'end_date' => date('Y-m-d', $endDate),
				'payment_mode' => $step1['payment_mode'],
				'next_step' => 'submit_milestone'
			]);
		} else {

			return response()->json([
				'success' => true,
				'step' => 3,
				'start_date' => date('Y-m-d', $startDate),
				'end_date' => date('Y-m-d', $endDate),
				'payment_mode' => $step1['payment_mode']
			]);
		}
	}

	public function submitMilestone(cProcessRequest $request)
	{

		$accessCheck = $this->checkContractorAccess($request);
		if ($accessCheck) {
			return $accessCheck; // Return error response
		}

		$step1 = Session::get('milestone_setup_step1');
		$step2 = Session::get('milestone_setup_step2');

		if (!$step1 || !$step2) {
			return response()->json([
				'success' => false,
				'errors' => ['Session expired. Please start again.']
			], 400);
		}

		$itemsRaw = $request->input('items');
		$items = json_decode($itemsRaw, true);

		$startDate = strtotime($step2['start_date']);
		$endDate = strtotime($step2['end_date']);

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

		if ($request->expectsJson()) {

			return response()->json([
				'success' => true,
				'message' => 'Milestone plan created successfully!',
				'milestone_id' => $milestoneId,
				'plan_id' => $planId,
				'redirect_url' => '/dashboard'
			], 201);
		} else {

			return response()->json([
				'success' => true,
				'message' => 'Milestone plan created successfully!',
				'redirect' => '/dashboard'
			]);
		}
	}
}
