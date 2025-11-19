<?php

namespace App\Http\Controllers\Both;

use App\Http\Controllers\Controller;
use App\Http\Requests\Both\disputeRequest;
use App\Models\Both\disputeClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Exception;

class disputeController extends Controller
{
    protected $disputeClass;

    public function __construct()
    {
        $this->disputeClass = new disputeClass();
    }

    private function checkAuthentication(Request $request)
    {
        $user = Session::get('user');
        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required',
                    'redirect_url' => '/accounts/login'
                ], 401);
            } else {
                return redirect('/accounts/login');
            }
        }
        return null;
    }

    public function showDisputePage(Request $request)
    {
        $authCheck = $this->checkAuthentication($request);
        if ($authCheck) {
            return $authCheck;
        }

        $user = Session::get('user');
        $userId = $user->user_id;

        $projects = $this->disputeClass->getUserProjects($userId);
        $disputes = $this->disputeClass->getDisputesWithFiles($userId);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Dispute page data',
                'data' => [
                    'projects' => $projects,
                    'disputes' => $disputes,
                    'user_id' => $userId
                ]
            ], 200);
        } else {
            return view('both.disputes', compact('projects', 'disputes'));
        }
    }

    public function fileDispute(disputeRequest $request)
    {
        try {
            $authCheck = $this->checkAuthentication($request);
            if ($authCheck) {
                return $authCheck;
            }

            $user = Session::get('user');
            $userId = $user->user_id;

            $validated = $request->validated();

            // Validate project and its users
            $validation = $this->disputeClass->validateProjectUsers($validated['project_id']);
            if (!$validation['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => $validation['message']
                ], 400);
            }

            $project = $validation['project'];

            // Check if project has a contractor assigned
            if (!$project->contractor_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot file dispute: Project does not have a contractor assigned yet'
                ], 400);
            }

            // If ung current user is contractor, ung dispute is against owner and vice versa
            $againstUserId = null;
            if ($project->contractor_id == $userId) {
                $againstUserId = $project->owner_id;
            } else if ($project->owner_id == $userId) {
                $againstUserId = $project->contractor_id;
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to file a dispute for this project. You must be either the project owner or assigned contractor.'
                ], 403);
            }

            // Validate that the against_user_id exists in the users table
            if ($againstUserId) {
                $againstUserExists = DB::table('users')->where('user_id', $againstUserId)->exists();
                if (!$againstUserExists) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot file dispute: Target user not found'
                    ], 400);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot determine dispute target user'
                ], 400);
            }

            $disputeData = [
                'project_id' => $validated['project_id'],
                'raised_by_user_id' => $userId,
                'against_user_id' => $againstUserId,
                'milestone_id' => $validated['milestone_id'],
                'milestone_item_id' => $validated['milestone_item_id'],
                'dispute_type' => $validated['dispute_type'],
                'dispute_desc' => $validated['dispute_desc']
            ];

            $disputeId = $this->disputeClass->createDispute($disputeData);

            // Handle multiple evidence files
            $uploadedFiles = [];
            if ($request->hasFile('evidence_files')) {
                $files = $request->file('evidence_files');
                if (!is_array($files)) {
                    $files = [$files]; // Handle single file case
                }

                foreach ($files as $file) {
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $storagePath = $file->storeAs('disputes/evidence', $fileName, 'public');

                    $fileId = $this->disputeClass->createDisputeFile(
                        $disputeId,
                        $storagePath,
                        $file->getClientOriginalName(),
                        $file->getMimeType(),
                        $file->getSize()
                    );

                    $uploadedFiles[] = [
                        'file_id' => $fileId,
                        'original_name' => $file->getClientOriginalName(),
                        'size' => $file->getSize()
                    ];
                }
            }

            // Keep backward compatibility with single file
            if ($request->hasFile('evidence_file')) {
                $file = $request->file('evidence_file');
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $storagePath = $file->storeAs('disputes/evidence', $fileName, 'public');

                $fileId = $this->disputeClass->createDisputeFile(
                    $disputeId,
                    $storagePath,
                    $file->getClientOriginalName(),
                    $file->getMimeType(),
                    $file->getSize()
                );

                $uploadedFiles[] = [
                    'file_id' => $fileId,
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize()
                ];
            }

            if ($disputeId) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Dispute filed successfully',
                        'data' => [
                            'dispute_id' => $disputeId,
                            'uploaded_files' => $uploadedFiles,
                            'files_count' => count($uploadedFiles)
                        ]
                    ], 201);
                } else {
                    return response()->json([
                        'success' => true,
                        'message' => 'Dispute filed successfully',
                        'dispute_id' => $disputeId
                    ], 201);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to file dispute'
                ], 500);
            }
        } catch (\Exception $e) {
            \Log::error('Dispute submission error: ' . $e->getMessage(), [
                'user_id' => $user->user_id ?? null,
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error filing dispute',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getDisputes(Request $request)
    {
        try {
            $authCheck = $this->checkAuthentication($request);
            if ($authCheck) {
                return $authCheck;
            }

            $user = Session::get('user');
            $userId = $user->user_id;

            $disputes = $this->disputeClass->getDisputesWithFiles($userId);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Disputes retrieved successfully',
                    'data' => [
                        'disputes' => $disputes,
                        'total_count' => count($disputes)
                    ]
                ], 200);
            } else {
                return response()->json([
                    'success' => true,
                    'disputes' => $disputes
                ], 200);
            }
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error retrieving disputes',
                    'error' => $e->getMessage()
                ], 500);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Error retrieving disputes: ' . $e->getMessage()
                ], 500);
            }
        }
    }

    public function getDisputeDetails(Request $request, $disputeId)
    {
        try {
            $authCheck = $this->checkAuthentication($request);
            if ($authCheck) {
                return $authCheck;
            }

            $user = Session::get('user');
            $userId = $user->user_id;

            $dispute = $this->disputeClass->getDisputeById($disputeId);
            $disputeFiles = $this->disputeClass->getDisputeFiles($disputeId);

            if (!$dispute) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dispute not found'
                ], 404);
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Dispute details retrieved successfully',
                    'data' => [
                        'dispute' => $dispute,
                        'evidence_files' => $disputeFiles
                    ]
                ], 200);
            } else {
                return response()->json([
                    'success' => true,
                    'dispute' => $dispute
                ], 200);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving dispute details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getMilestones(Request $request, $projectId)
    {
        try {
            $authCheck = $this->checkAuthentication($request);
            if ($authCheck) {
                return $authCheck;
            }

            $user = Session::get('user');
            $userId = $user->user_id;

            $milestones = $this->disputeClass->getMilestonesByProject($projectId);

            return response()->json([
                'success' => true,
                'message' => 'Milestones retrieved successfully',
                'data' => [
                    'project_id' => $projectId,
                    'milestones' => $milestones
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving milestones',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getMilestoneItems(Request $request, $milestoneId)
    {
        try {
            // Get milestone items
            $milestoneItems = $this->disputeClass->getMilestoneItemsByMilestone($milestoneId);

            return response()->json([
                'success' => true,
                'message' => 'Milestone items retrieved successfully',
                'data' => [
                    'milestone_items' => $milestoneItems
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving milestone items: ' . $e->getMessage()
            ], 500);
        }
    }

    public function showProjectsPage(Request $request)
    {
        $user = Session::get('user');
        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required',
                    'redirect_url' => '/accounts/login'
                ], 401);
            } else {
                return redirect('/accounts/login');
            }
        }
        $userId = $user->user_id;

        $projects = $this->disputeClass->getUserProjects($userId);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Projects retrieved successfully',
                'data' => [
                    'projects' => $projects,
                    'user_id' => $userId
                ]
            ], 200);
        } else {
            return view('both.projects', compact('projects', 'userId'));
        }
    }

    public function showProjectDetails(Request $request, $projectId)
    {
        $user = Session::get('user');
        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required',
                    'redirect_url' => '/accounts/login'
                ], 401);
            } else {
                return redirect('/accounts/login');
            }
        }
        $userId = $user->user_id;

        // Get project details
        $project = $this->disputeClass->getProjectDetailsById($projectId);

        if (!$project) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Project not found'
                ], 404);
            } else {
                return redirect('/both/projects')->with('error', 'Project not found');
            }
        }

        // Check if user has access to this project
        if ($project->owner_id != $userId && $project->contractor_user_id != $userId) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this project'
                ], 403);
            } else {
                return redirect('/both/projects')->with('error', 'You do not have access to this project');
            }
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

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Project details retrieved successfully',
                'data' => [
                    'project' => $project,
                    'milestones' => array_values($milestones),
                    'user_role' => [
                        'is_owner' => $isOwner,
                        'is_contractor' => $isContractor
                    ]
                ]
            ], 200);
        } else {
            // Get projects for the modal
            $projects = $this->disputeClass->getUserProjects($user->user_id);

            return view('both.projectDetails', compact('project', 'milestones', 'isOwner', 'isContractor', 'projects'));
        }
    }

    public function checkExistingDispute(Request $request)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            $projectId = $request->input('project_id');
            $milestoneId = $request->input('milestone_id');
            $userId = $user->user_id;

            $hasOpenDispute = false;
            $message = '';

            if ($milestoneId) {
                // Check for milestone item dispute
                $hasOpenDispute = $this->disputeClass->hasOpenDisputeForMilestone($userId, $milestoneId);
                if ($hasOpenDispute) {
                    $message = 'You already have an open dispute for this milestone. Please wait for it to be resolved or closed.';
                }
            } else {
                // Check for project (like whole full milestone to guys) dispute
                $hasOpenDispute = $this->disputeClass->hasOpenDisputeForProject($userId, $projectId);
                if ($hasOpenDispute) {
                    $message = 'You already have an open dispute for this project. Please wait for it to be resolved or closed.';
                }
            }

            return response()->json([
                'success' => true,
                'has_open_dispute' => $hasOpenDispute,
                'message' => $message
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking existing disputes'
            ], 500);
        }
    }

    public function updateDispute(Request $request, $disputeId)
    {
        try {
            $authCheck = $this->checkAuthentication($request);
            if ($authCheck) {
                return $authCheck;
            }

            $user = Session::get('user');
            $userId = $user->user_id;

            // Get dispute and verify user sino nagdispute
            $dispute = $this->disputeClass->getDisputeById($disputeId);

            if (!$dispute) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dispute not found'
                ], 404);
            }

            if ($dispute->raised_by_user_id != $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only edit disputes that you filed'
                ], 403);
            }

            if ($dispute->dispute_status !== 'open') {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only edit disputes with "open" status'
                ], 400);
            }

            $request->validate([
                'dispute_type' => 'sometimes|required|in:Payment,Delay,Quality,Others',
                'dispute_desc' => 'sometimes|required|string|max:2000',
                'evidence_files.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120'
            ]);

            $updateData = [];
            if ($request->has('dispute_type')) {
                $updateData['dispute_type'] = $request->input('dispute_type');
            }
            if ($request->has('dispute_desc')) {
                $updateData['dispute_desc'] = $request->input('dispute_desc');
            }

            // Update dispute
            $this->disputeClass->updateDispute($disputeId, $updateData);

            \Log::info('Checking for deleted_file_ids', [
                'has_deleted_file_ids' => $request->has('deleted_file_ids'),
                'deleted_file_ids_value' => $request->input('deleted_file_ids'),
                'all_input' => $request->all()
            ]);

            if ($request->has('deleted_file_ids') && !empty($request->input('deleted_file_ids'))) {
                $deletedFileIds = explode(',', $request->input('deleted_file_ids'));
                \Log::info('Processing deleted files', ['file_ids' => $deletedFileIds]);

                foreach ($deletedFileIds as $fileId) {
                    if (!empty($fileId) && is_numeric($fileId)) {
                        $result = $this->disputeClass->deleteDisputeFile($fileId);
                        \Log::info('Deleted file', ['file_id' => $fileId, 'result' => $result]);
                    }
                }
            }

            $uploadedFiles = [];
            if ($request->hasFile('evidence_files')) {
                $files = $request->file('evidence_files');
                if (!is_array($files)) {
                    $files = [$files];
                }

                foreach ($files as $file) {
                    $originalName = $file->getClientOriginalName();
                    $fileSize = $file->getSize();
                    $fileExtension = $file->getClientOriginalExtension();
                    $fileName = time() . '_' . uniqid() . '.' . $fileExtension;

                    $storagePath = $file->storeAs('disputes/evidence', $fileName, 'public');

                    $evidenceId = $this->disputeClass->createDisputeFile(
                        $disputeId,
                        $storagePath,
                        $originalName,
                        $file->getMimeType(),
                        $fileSize
                    );

                    $uploadedFiles[] = [
                        'evidence_id' => $evidenceId,
                        'original_name' => $originalName,
                        'storage_path' => $storagePath
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Dispute updated successfully',
                'data' => [
                    'dispute_id' => $disputeId,
                    'new_files' => $uploadedFiles
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating dispute: ' . $e->getMessage()
            ], 500);
        }
    }

    public function cancelDispute(Request $request, $disputeId)
    {
        try {
            $authCheck = $this->checkAuthentication($request);
            if ($authCheck) {
                return $authCheck;
            }

            $user = Session::get('user');
            $userId = $user->user_id;

            $dispute = $this->disputeClass->getDisputeById($disputeId);

            if (!$dispute) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dispute not found'
                ], 404);
            }

            if ($dispute->raised_by_user_id != $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only cancel disputes that you filed'
                ], 403);
            }

            // Only allow cancelling if status is 'open' or 'under_review'
            if (!in_array($dispute->dispute_status, ['open', 'under_review'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only cancel disputes with "open" or "under review" status'
                ], 400);
            }

            $this->disputeClass->cancelDispute($disputeId);

            return response()->json([
                'success' => true,
                'message' => 'Dispute cancelled successfully',
                'data' => [
                    'dispute_id' => $disputeId
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error cancelling dispute: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteEvidenceFile(Request $request, $fileId)
    {
        try {
            $authCheck = $this->checkAuthentication($request);
            if ($authCheck) {
                return $authCheck;
            }

            $user = Session::get('user');
            $userId = $user->user_id;

            // Get the evidence file and its dispute
            $evidence = $this->disputeClass->getEvidenceFile($fileId);

            if (!$evidence) {
                return response()->json([
                    'success' => false,
                    'message' => 'Evidence file not found'
                ], 404);
            }

            $dispute = $this->disputeClass->getDisputeById($evidence->dispute_id);

            if (!$dispute || $dispute->raised_by_user_id != $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only delete files from your own disputes'
                ], 403);
            }

            if ($dispute->dispute_status !== 'open') {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only delete files from disputes with "open" status'
                ], 400);
            }

            $deleted = $this->disputeClass->deleteDisputeFile($fileId);

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Evidence file deleted successfully'
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete evidence file'
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting evidence file: ' . $e->getMessage()
            ], 500);
        }
    }
}
