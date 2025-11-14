<?php

namespace App\Http\Controllers\Both;

use App\Http\Controllers\Controller;
use App\Http\Requests\Both\disputeRequest;
use App\Models\Both\disputeClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;

class disputeController extends Controller
{
    protected $disputeClass;

    public function __construct()
    {
        $this->disputeClass = new disputeClass();
    }

    public function showDisputePage()
    {
        $user = Session::get('user');
        if (!$user) {
            return redirect('/accounts/login');
        }
        $userId = $user->user_id;

        $projects = $this->disputeClass->getUserProjects($userId);
        $disputes = $this->disputeClass->getDisputesByUser($userId);

        return view('both.disputes', compact('projects', 'disputes'));
    }

    public function fileDispute(disputeRequest $request)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            $userId = $user->user_id;

            $validated = $request->validated();

            // Get project info to determine against_user_id
            $project = $this->disputeClass->getProjectById($validated['project_id']);

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Project not found'
                ], 404);
            }

            // Determine who the dispute is against
            // If current user is contractor, dispute is against owner and vice versa
            $againstUserId = null;
            if ($project->contractor_id == $userId) {
                $againstUserId = $project->owner_id;
            } else if ($project->owner_id == $userId) {
                $againstUserId = $project->contractor_id;
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to file a dispute for this project'
                ], 403);
            }

            $evidenceFilePath = null;
            if ($request->hasFile('evidence_file')) {
                $file = $request->file('evidence_file');
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $evidenceFilePath = $file->storeAs('disputes/evidence', $fileName, 'public');
            }

            $disputeData = [
                'project_id' => $validated['project_id'],
                'raised_by_user_id' => $userId,
                'against_user_id' => $againstUserId,
                'milestone_id' => $validated['milestone_id'] ?? null,
                'dispute_type' => $validated['dispute_type'],
                'dispute_desc' => $validated['dispute_desc'],
                'evidence_file' => $evidenceFilePath
            ];

            $disputeId = $this->disputeClass->createDispute($disputeData);

            if ($disputeId) {
                return response()->json([
                    'success' => true,
                    'message' => 'Dispute filed successfully',
                    'dispute_id' => $disputeId
                ], 201);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to file dispute'
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error filing dispute: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getDisputes(Request $request)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            $userId = $user->user_id;

            $disputes = $this->disputeClass->getDisputesByUser($userId);

            return response()->json([
                'success' => true,
                'disputes' => $disputes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving disputes: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getDisputeDetails(Request $request, $disputeId)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            $userId = $user->user_id;

            $dispute = $this->disputeClass->getDisputeById($disputeId);

            if (!$dispute) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dispute not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'dispute' => $dispute
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving dispute details: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getMilestones(Request $request, $projectId)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            $userId = $user->user_id;

            $milestones = $this->disputeClass->getMilestonesByProject($projectId);

            return response()->json([
                'success' => true,
                'milestones' => $milestones
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving milestones: ' . $e->getMessage()
            ], 500);
        }
    }

    public function showProjectsPage()
    {
        $user = Session::get('user');
        if (!$user) {
            return redirect('/accounts/login');
        }
        $userId = $user->user_id;

        $projects = $this->disputeClass->getUserProjects($userId);

        return view('both.projects', compact('projects', 'userId'));
    }

    public function showProjectDetails(Request $request, $projectId)
    {
        $user = Session::get('user');
        if (!$user) {
            return redirect('/accounts/login');
        }
        $userId = $user->user_id;

        // Get project details
        $project = $this->disputeClass->getProjectDetailsById($projectId);

        if (!$project) {
            return redirect('/both/projects')->with('error', 'Project not found');
        }

        // Check if user has access to this project
        if ($project->owner_id != $userId && $project->contractor_user_id != $userId) {
            return redirect('/both/projects')->with('error', 'You do not have access to this project');
        }

        // Get milestones and items
        $milestonesData = $this->disputeClass->getProjectMilestonesWithItems($projectId);

        // Group milestones and items
        $milestones = [];
        foreach ($milestonesData as $data) {
            if (!isset($milestones[$data->milestone_id])) {
                $milestones[$data->milestone_id] = [
                    'milestone_id' => $data->milestone_id,
                    'milestone_name' => $data->milestone_name,
                    'milestone_description' => $data->milestone_description,
                    'milestone_status' => $data->milestone_status,
                    'start_date' => $data->start_date,
                    'end_date' => $data->end_date,
                    'items' => []
                ];
            }

            if ($data->item_id) {
                $milestones[$data->milestone_id]['items'][] = [
                    'item_id' => $data->item_id,
                    'milestone_item_title' => $data->milestone_item_title,
                    'milestone_item_description' => $data->milestone_item_description,
                    'percentage_progress' => $data->percentage_progress,
                    'milestone_item_cost' => $data->milestone_item_cost,
                    'date_to_finish' => $data->date_to_finish,
                    'sequence_order' => $data->sequence_order,
                    'progress_files' => $this->disputeClass->getProgressFilesByItem($data->item_id),
                    'payments' => $this->disputeClass->getPaymentsByItem($data->item_id)
                ];
            }
        }

        // Determine user role in project
        $isOwner = $project->owner_id == $userId;
        $isContractor = $project->contractor_user_id == $userId;

        return view('both.projectDetails', compact('project', 'milestones', 'isOwner', 'isContractor'));
    }
}
