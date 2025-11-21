<?php

namespace App\Http\Controllers\contractor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contractor\progressUploadRequest;
use App\Models\contractor\progressUploadClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class progressUploadController extends Controller
{
    protected $progressUploadClass;

    public function __construct()
    {
        $this->progressUploadClass = new progressUploadClass();
    }

    public function showUploadPage(Request $request)
    {
        $authCheck = $this->checkContractorAccess($request);
        if ($authCheck) {
            return $authCheck;
        }

        $user = Session::get('user');

        // Get c id
        $contractor = DB::table('contractors')
            ->where('user_id', $user->user_id)
            ->first();

        if (!$contractor) {
            return redirect('/dashboard')->with('error', 'Contractor profile not found');
        }

        $itemId = $request->query('item_id');
        $projectId = $request->query('project_id');

        if (!$itemId || !$projectId) {
            return redirect('/both/projects')->with('error', 'Invalid request parameters');
        }

        // Get milestone item details and verify contractor access
        $item = DB::table('milestone_items as mi')
            ->join('milestones as m', 'mi.milestone_id', '=', 'm.milestone_id')
            ->join('projects as p', 'm.project_id', '=', 'p.project_id')
            ->where('mi.item_id', $itemId)
            ->where('p.project_id', $projectId)
            ->where('p.selected_contractor_id', $contractor->contractor_id)
            ->select('mi.*', 'm.milestone_id', 'p.project_id', 'p.project_title')
            ->first();

        if (!$item) {
            return redirect('/both/projects')->with('error', 'Milestone item not found or access denied');
        }

        $itemArray = (array) $item;
        $project = (object) ['project_id' => $item->project_id, 'project_title' => $item->project_title];

        return view('contractor.progressUpload', [
            'item' => $itemArray,
            'project' => $project
        ]);
    }

    private function checkContractorAccess(Request $request)
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

        // Check if yung user is c
        if (!in_array($user->user_type, ['contractor', 'both'])) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Only contractors can upload progress.',
                    'redirect_url' => '/dashboard'
                ], 403);
            } else {
                return redirect('/dashboard')->with('error', 'Access denied. Only contractors can upload progress.');
            }
        }

        if ($user->user_type === 'both') {
            $currentRole = Session::get('current_role', 'contractor');
            if ($currentRole !== 'contractor') {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Access denied. Please switch to contractor role to upload progress.',
                        'redirect_url' => '/dashboard',
                        'suggested_action' => 'switch_to_contractor'
                    ], 403);
                } else {
                    return redirect('/dashboard')->with('error', 'Please switch to contractor role to upload progress.');
                }
            }
        }

        return null;
    }

    public function uploadProgress(progressUploadRequest $request)
    {
        try {
            $authCheck = $this->checkContractorAccess($request);
            if ($authCheck) {
                return $authCheck;
            }

            $user = Session::get('user');

            $contractor = DB::table('contractors')
                ->where('user_id', $user->user_id)
                ->first();

            if (!$contractor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Contractor profile not found'
                ], 404);
            }

            $validated = $request->validated();

            // Check for existing progress for this item
            $existingProgress = $this->progressUploadClass->getProgressByItem(
                $validated['item_id'],
                $contractor->contractor_id
            );

            foreach ($existingProgress as $existing) {
                if (!in_array($existing->progress_status, ['needs_revision', 'deleted'])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You already have a progress report for this milestone item. You can only upload a new report if the previous one needs revision.'
                    ], 400);
                }
            }

            // Verify that the milestone item belongs to a project assigned to a specific contractor
            $milestoneItem = DB::table('milestone_items as mi')
                ->join('milestones as m', 'mi.milestone_id', '=', 'm.milestone_id')
                ->join('projects as p', 'm.project_id', '=', 'p.project_id')
                ->where('mi.item_id', $validated['item_id'])
                ->where('p.selected_contractor_id', $contractor->contractor_id)
                ->select('mi.item_id', 'm.milestone_id', 'p.project_id', 'p.project_title', 'mi.milestone_item_title')
                ->first();

            if (!$milestoneItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Milestone item not found or you do not have access to it'
                ], 403);
            }

            // Validate that files are present
            if (!$request->hasFile('progress_files')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please upload at least one progress file'
                ], 400);
            }

                $files = $request->file('progress_files');
                if (!is_array($files)) {
                    $files = [$files];
                }

            if (count($files) === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please upload at least one progress file'
                ], 400);
            }

            // Create progress entry first
            $progressId = $this->progressUploadClass->createProgress([
                'item_id' => $validated['item_id'],
                'purpose' => $validated['purpose'],
                'progress_status' => 'submitted'
            ]);

            // Ensure the progress_uploads directory exists
            if (!Storage::disk('public')->exists('progress_uploads')) {
                Storage::disk('public')->makeDirectory('progress_uploads', 0755, true);
            }

            // Handle multiple progress files
            $uploadedFiles = [];
            $uploadedFilePaths = [];

            try {
                foreach ($files as $file) {
                    if (!$file->isValid()) {
                        throw new \Exception('Invalid file uploaded: ' . $file->getClientOriginalName());
                    }

                    $fileExtension = $file->getClientOriginalExtension();
                    $fileName = time() . '_' . uniqid() . '.' . $fileExtension;
                    $storagePath = $file->storeAs('progress_uploads', $fileName, 'public');

                    if (!$storagePath) {
                        throw new \Exception('Failed to store file: ' . $file->getClientOriginalName());
                    }

                    // Use original file name for display
                    $originalFileName = $file->getClientOriginalName();

                    $fileId = $this->progressUploadClass->createProgressFile([
                        'progress_id' => $progressId,
                        'file_path' => $storagePath,
                        'original_name' => $originalFileName
                    ]);

                    if (!$fileId) {
                        // If database insert fails, delete the uploaded file
                        if (Storage::disk('public')->exists($storagePath)) {
                            Storage::disk('public')->delete($storagePath);
                        }
                        throw new \Exception('Failed to save file record to database: ' . $originalFileName);
                    }

                    $uploadedFiles[] = [
                        'file_id' => $fileId,
                        'file_name' => $originalFileName,
                        'file_path' => $storagePath
                    ];

                    $uploadedFilePaths[] = $storagePath;
                }
            } catch (\Exception $fileException) {
                // If file upload fails, delete the progress entry and uploaded files
                if ($progressId) {
                    $this->progressUploadClass->updateProgressStatus($progressId, 'deleted');
                }

                // Delete any uploaded files
                foreach ($uploadedFilePaths as $path) {
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }

                throw $fileException;
            }

                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Progress files uploaded successfully',
                        'data' => [
                        'progress_id' => $progressId,
                            'uploaded_files' => $uploadedFiles,
                            'files_count' => count($uploadedFiles),
                            'milestone_item' => [
                                'item_id' => $milestoneItem->item_id,
                                'title' => $milestoneItem->milestone_item_title,
                                'project_title' => $milestoneItem->project_title
                            ]
                        ]
                    ], 201);
                } else {
                    return response()->json([
                        'success' => true,
                        'message' => 'Progress files uploaded successfully',
                        'files_count' => count($uploadedFiles)
                    ], 201);
            }
        } catch (\Exception $e) {
            \Log::error('Progress upload error: ' . $e->getMessage(), [
                'user_id' => $user->user_id ?? null,
                'contractor_id' => $contractor->contractor_id ?? null,
                'item_id' => $validated['item_id'] ?? null,
                'request_data' => $request->all(),
                'file_count' => $request->hasFile('progress_files') ? count($request->file('progress_files')) : 0,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error uploading progress files: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'error_type' => get_class($e)
            ], 500);
        }
    }

    private function mapMimeTypeToEnum($mimeType, $extension)
    {
        $mapping = [
            'application/pdf' => 'pdf',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            'application/zip' => 'zip',
            'application/x-zip-compressed' => 'zip',
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png'
        ];

        if (isset($mapping[$mimeType])) {
            return $mapping[$mimeType];
        }

        $extension = strtolower($extension);
        if (in_array($extension, ['pdf', 'doc', 'docx', 'zip', 'jpg', 'jpeg', 'png'])) {
            return $extension === 'jpeg' ? 'jpg' : $extension;
        }

        return 'pdf';
    }

    public function getProgressFiles(Request $request, $itemId)
    {
        try {
            $authCheck = $this->checkContractorAccess($request);
            if ($authCheck) {
                return $authCheck;
            }

            $user = Session::get('user');

            $contractor = DB::table('contractors')
                ->where('user_id', $user->user_id)
                ->first();

            if (!$contractor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Contractor profile not found'
                ], 404);
            }

            // Check if this is a request for a single progress entry
            if ($request->has('progress_id')) {
                $progressId = $request->input('progress_id');

                if (!$progressId || !is_numeric($progressId)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid progress ID provided'
                    ], 400);
                }

                $progress = $this->progressUploadClass->getProgressWithFiles($progressId);

                if (!$progress) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Progress not found'
                    ], 404);
                }

                // Verify ownership through project
                $milestoneItem = DB::table('milestone_items as mi')
                    ->join('milestones as m', 'mi.milestone_id', '=', 'm.milestone_id')
                    ->join('projects as p', 'm.project_id', '=', 'p.project_id')
                    ->where('mi.item_id', $progress->item_id)
                    ->where('p.selected_contractor_id', $contractor->contractor_id)
                    ->select('p.project_id', 'p.project_title', 'mi.milestone_item_title as item_title')
                    ->first();

                if (!$milestoneItem) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Progress not found or access denied'
                    ], 403);
                }

                // Ensure files is an array (convert collection to array if needed)
                $files = $progress->files ?? [];
                if (is_object($files) && method_exists($files, 'toArray')) {
                    $files = $files->toArray();
                } elseif (is_object($files)) {
                    $files = (array) $files;
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Progress retrieved successfully',
                    'data' => [
                        'progress_id' => $progress->progress_id,
                        'item_id' => $progress->item_id,
                        'project_id' => $milestoneItem->project_id,
                        'item_title' => $milestoneItem->item_title,
                        'purpose' => $progress->purpose,
                        'progress_status' => $progress->progress_status,
                        'submitted_at' => $progress->submitted_at,
                        'files' => $files
                    ]
                ], 200);
            }

            // Otherwise get all progress entries with files for the item
            $progressList = $this->progressUploadClass->getProgressFilesByItem($itemId, $contractor->contractor_id);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Progress files retrieved successfully',
                    'data' => [
                        'progress_list' => $progressList,
                        'total_count' => count($progressList)
                    ]
                ], 200);
            } else {
                return response()->json([
                    'success' => true,
                    'progress_list' => $progressList
                ], 200);
            }
        } catch (\Exception $e) {
            \Log::error('getProgressFiles error: ' . $e->getMessage(), [
                'item_id' => $itemId,
                'progress_id' => $request->input('progress_id'),
                'user_id' => $user->user_id ?? null,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error retrieving progress files: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProgress(Request $request, $progressId)
    {
        try {
            $authCheck = $this->checkContractorAccess($request);
            if ($authCheck) {
                return $authCheck;
            }

            $user = Session::get('user');

            $contractor = DB::table('contractors')
                ->where('user_id', $user->user_id)
                ->first();

            if (!$contractor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Contractor profile not found'
                ], 404);
            }

            // Get the progress and verify ownership
            $progress = $this->progressUploadClass->getProgressById($progressId);

            if (!$progress) {
                return response()->json([
                    'success' => false,
                    'message' => 'Progress not found'
                ], 404);
            }

            // Verify ownership through project
            $milestoneItem = DB::table('milestone_items as mi')
                ->join('milestones as m', 'mi.milestone_id', '=', 'm.milestone_id')
                ->join('projects as p', 'm.project_id', '=', 'p.project_id')
                ->where('mi.item_id', $progress->item_id)
                ->where('p.selected_contractor_id', $contractor->contractor_id)
                ->first();

            if (!$milestoneItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Progress not found or access denied'
                ], 403);
            }

            if (!in_array($progress->progress_status, ['needs_revision', 'submitted'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'This progress report cannot be edited. Only reports with status "needs_revision" or "submitted" can be modified.'
                ], 403);
            }

            if ($request->has('purpose')) {
                $request->validate([
                    'purpose' => 'required|string|max:1000'
                ]);
            }

            $updateData = [];
            if ($request->has('purpose')) {
                $updateData['purpose'] = $request->purpose;
            }
            if (!empty($updateData)) {
                $this->progressUploadClass->updateProgress($progressId, $updateData);
            }

            // Handle deleted files
            if ($request->has('deleted_file_ids') && $request->deleted_file_ids) {
                $deletedIds = explode(',', $request->deleted_file_ids);
                foreach ($deletedIds as $deleteId) {
                    $deleteId = trim($deleteId);
                    if ($deleteId) {
                        $fileToDelete = $this->progressUploadClass->getProgressFileById($deleteId);
                        if ($fileToDelete && $fileToDelete->progress_id == $progressId) {
                            $this->progressUploadClass->deleteProgressFile($deleteId);
                        }
                    }
                }
            }

            // Handle new file uploads
            $uploadedFiles = [];
            if ($request->hasFile('progress_files')) {
                $files = $request->file('progress_files');
                if (!is_array($files)) {
                    $files = [$files];
                }

                foreach ($files as $file) {
                    $fileExtension = $file->getClientOriginalExtension();
                    $fileName = time() . '_' . uniqid() . '.' . $fileExtension;
                    $storagePath = $file->storeAs('progress_uploads', $fileName, 'public');

                    $originalFileName = $file->getClientOriginalName();

                    $newFileId = $this->progressUploadClass->createProgressFile([
                        'progress_id' => $progressId,
                        'file_path' => $storagePath,
                        'original_name' => $originalFileName
                    ]);

                    $uploadedFiles[] = [
                        'file_id' => $newFileId,
                        'file_path' => $storagePath,
                        'original_name' => $originalFileName
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Progress updated successfully',
                'data' => [
                    'updated_progress_id' => $progressId,
                    'new_files' => $uploadedFiles
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Progress update error: ' . $e->getMessage(), [
                'progress_id' => $progressId,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error updating progress',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteProgress(Request $request, $progressId)
    {
        try {
            $authCheck = $this->checkContractorAccess($request);
            if ($authCheck) {
                return $authCheck;
            }

            $user = Session::get('user');

            $contractor = DB::table('contractors')
                ->where('user_id', $user->user_id)
                ->first();

            if (!$contractor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Contractor profile not found'
                ], 404);
            }

            // Get the progress and verify ownership
            $progress = $this->progressUploadClass->getProgressById($progressId);

            if (!$progress) {
                return response()->json([
                    'success' => false,
                    'message' => 'Progress not found'
                ], 404);
            }

            // Verify ownership through project
            $milestoneItem = DB::table('milestone_items as mi')
                ->join('milestones as m', 'mi.milestone_id', '=', 'm.milestone_id')
                ->join('projects as p', 'm.project_id', '=', 'p.project_id')
                ->where('mi.item_id', $progress->item_id)
                ->where('p.selected_contractor_id', $contractor->contractor_id)
                ->first();

            if (!$milestoneItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Progress not found or access denied'
                ], 403);
            }

            // Only allow deletion if status is needs_revision or submitted
            if (!in_array($progress->progress_status, ['needs_revision', 'submitted'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'This progress report cannot be deleted. Only reports with status "needs_revision" or "submitted" can be removed.'
                ], 403);
            }

            $this->progressUploadClass->updateProgressStatus($progressId, 'deleted');

            return response()->json([
                'success' => true,
                'message' => 'Progress report deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Progress delete error: ' . $e->getMessage(), [
                'progress_id' => $progressId,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error deleting progress report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function approveProgress(Request $request, $progressId)
    {
        $user = Session::get('user');
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required',
                'redirect_url' => '/accounts/login'
            ], 401);
        }

        // Only owner can approve
        if (!in_array($user->user_type, ['property_owner', 'both'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only owners can approve progress.'
            ], 403);
        }
        if ($user->user_type === 'both') {
            $currentRole = Session::get('current_role', 'owner');
            if ($currentRole !== 'owner') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Please switch to owner role to approve progress.'
                ], 403);
            }
        }

        // Find progress and verify owner
        $progress = DB::table('progress')
            ->join('milestone_items as mi', 'progress.milestone_item_id', '=', 'mi.item_id')
            ->join('milestones as m', 'mi.milestone_id', '=', 'm.milestone_id')
            ->join('projects as p', 'm.project_id', '=', 'p.project_id')
            ->leftJoin('project_relationships as pr', 'p.relationship_id', '=', 'pr.rel_id')
            ->where('progress.progress_id', $progressId)
            ->select('progress.*', 'pr.owner_id')
            ->first();

        if (!$progress) {
            return response()->json([
                'success' => false,
                'message' => 'Progress report not found.'
            ], 404);
        }

        // Get owner_id from property_owners table
        $owner = DB::table('property_owners')->where('user_id', $user->user_id)->first();
        $ownerId = $owner ? $owner->owner_id : null;

        $hasPermission = false;
        if ($ownerId && $progress->owner_id) {
            // Compare owner_id from property_owners table
            $hasPermission = ($progress->owner_id == $ownerId);
        } else {
            // Legacy: compare user_id directly
            $hasPermission = ($progress->owner_id == $user->user_id);
        }

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to approve this progress.'
            ], 403);
        }

        // Update status
        DB::table('progress')
            ->where('progress_id', $progressId)
            ->update(['progress_status' => 'approved']);

        return response()->json([
            'success' => true,
            'message' => 'Progress report approved successfully.'
        ]);
    }
}
