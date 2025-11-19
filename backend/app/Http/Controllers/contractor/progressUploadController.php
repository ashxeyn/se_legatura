<?php

namespace App\Http\Controllers\contractor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contractor\progressUploadRequest;
use App\Models\contractor\progressUploadClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;

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

        // Get contractor_id
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

        // Convert to array for view
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

        // For 'both' users, check current active role
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

            // Verify that the milestone item belongs to a project assigned to this contractor
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

            // Handle multiple progress files
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

                    // Map mime type to enum values
                    $mimeType = $file->getMimeType();
                    $fileType = $this->mapMimeTypeToEnum($mimeType, $fileExtension);

                    // Use original file name for display
                    $originalFileName = $file->getClientOriginalName();

                    $fileId = $this->progressUploadClass->createProgressFile([
                        'item_id' => $validated['item_id'],
                        'purpose' => $validated['purpose'],
                        'contractor_id' => $contractor->contractor_id,
                        'file_path' => $storagePath,
                        'file_type' => $fileType,
                        'file_status' => 'submitted'
                    ]);

                    $uploadedFiles[] = [
                        'file_id' => $fileId,
                        'file_name' => $originalFileName,
                        'file_path' => $storagePath,
                        'file_type' => $fileType
                    ];
                }
            }

            if (count($uploadedFiles) > 0) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Progress files uploaded successfully',
                        'data' => [
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
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No files were uploaded'
                ], 400);
            }
        } catch (\Exception $e) {
            \Log::error('Progress upload error: ' . $e->getMessage(), [
                'user_id' => $user->user_id ?? null,
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error uploading progress files',
                'error' => $e->getMessage()
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

            $progressFiles = $this->progressUploadClass->getProgressFilesByItem($itemId, $contractor->contractor_id);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Progress files retrieved successfully',
                    'data' => [
                        'progress_files' => $progressFiles,
                        'total_count' => count($progressFiles)
                    ]
                ], 200);
            } else {
                return response()->json([
                    'success' => true,
                    'progress_files' => $progressFiles
                ], 200);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving progress files',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
