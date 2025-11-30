<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\projectsRequest;
use App\Models\Owner\projectsClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class projectsController extends Controller
{
    protected $projectsClass;

    public function __construct(projectsClass $projectsClass)
    {
        $this->projectsClass = $projectsClass;
    }

    public function showDashboard(Request $request)
    {
        $user = Session::get('user');
        if (!$user) {
            return redirect('/accounts/login');
        }

        $currentRole = session('current_role', $user->user_type);
        $userType = $user->user_type;

        // Determine if user is owner
        $isOwner = ($userType === 'property_owner' || $userType === 'both') &&
                   ($currentRole === 'owner' || $currentRole === 'property_owner');

        // Get owner_id if user is owner
        $ownerId = null;
        if ($isOwner) {
            $owner = DB::table('property_owners')
                ->where('user_id', $user->user_id)
                ->first();
            $ownerId = $owner ? $owner->owner_id : null;
        }

        // Get feed data based on role
        $feedItems = [];
        $feedType = 'projects'; // 'projects' or 'contractors'
        $contractorProjectsForMilestone = [];

        if ($isOwner && $ownerId) {
            // Owner view: Show all active contractor profiles (except themselves if both)
            $excludeUserId = ($userType === 'both') ? $user->user_id : null;
            $feedItems = $this->projectsClass->getActiveContractors($excludeUserId);
            $feedType = 'contractors';
        } else {
            // Contractor view: Show all approved projects
            $feedItems = $this->projectsClass->getApprovedProjects();
            $feedType = 'projects';

            // Get contractor projects for milestone setup (projects where contractor is selected and no milestone exists)
            $contractor = DB::table('contractors')->where('user_id', $user->user_id)->first();
            if ($contractor) {
                $contractorClass = new \App\Models\contractor\contractorClass();
                $contractorProjectsForMilestone = $contractorClass->getContractorProjects($contractor->contractor_id);
            }
        }

        // Get contractor types for dropdown
        $contractorTypes = $this->projectsClass->getContractorTypes();

        return view('both.dashboard', compact('feedItems', 'isOwner', 'contractorTypes', 'currentRole', 'userType', 'feedType', 'contractorProjectsForMilestone'));
    }

    public function showCreatePostPage(Request $request)
    {
        $user = Session::get('user');
        if (!$user) {
            return redirect('/accounts/login');
        }

        $currentRole = session('current_role', $user->user_type);
        $userType = $user->user_type;

        // Only owners can create posts
        $isOwner = ($userType === 'property_owner' || $userType === 'both') &&
                   ($currentRole === 'owner' || $currentRole === 'property_owner');

        if (!$isOwner) {
            return redirect('/dashboard')->with('error', 'Only property owners can create project posts.');
        }

        $contractorTypes = $this->projectsClass->getContractorTypes();

        return view('owner.createPost', compact('contractorTypes'));
    }

    public function store(projectsRequest $request)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            $currentRole = session('current_role', $user->user_type);
            $userType = $user->user_type;

            // Verify user is owner
            $isOwner = ($userType === 'property_owner' || $userType === 'both') &&
                       ($currentRole === 'owner' || $currentRole === 'property_owner');

            if (!$isOwner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only property owners can create project posts'
                ], 403);
            }

            // Get owner_id
            $owner = DB::table('property_owners')
                ->where('user_id', $user->user_id)
                ->first();

            if (!$owner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Property owner record not found'
                ], 404);
            }

            $validated = $request->validated();

            // Create project relationship first
            $relationshipId = $this->projectsClass->createProjectRelationship(
                $owner->owner_id,
                $validated['bidding_deadline']
            );

            // Create project (include if_others_ctype when provided)
            $projectData = [
                'relationship_id' => $relationshipId,
                'project_title' => $validated['project_title'],
                'project_description' => $validated['project_description'],
                'project_location' => $validated['project_location'],
                'budget_range_min' => $validated['budget_range_min'],
                'budget_range_max' => $validated['budget_range_max'],
                'lot_size' => $validated['lot_size'],
                'floor_area' => $validated['floor_area'],
                'property_type' => $validated['property_type'],
                'type_id' => $validated['type_id']
            ];

            if (!empty($validated['if_others_ctype'])) {
                $projectData['if_others_ctype'] = $validated['if_others_ctype'];
            }

            // Create project
            $projectId = $this->projectsClass->createProject($projectData);

            // Ensure projects directory exists
            if (!Storage::disk('public')->exists('projects')) {
                Storage::disk('public')->makeDirectory('projects');
            }

            // Upload required files
            $fileTypes = [
                'building_permit' => 'building permit',
                'title_of_land' => 'title'
            ];

            foreach ($fileTypes as $inputName => $fileType) {
                if ($request->hasFile($inputName)) {
                    $file = $request->file($inputName);
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $storagePath = $file->storeAs('projects', $fileName, 'public');

                    $this->projectsClass->createProjectFile([
                        'project_id' => $projectId,
                        'file_type' => $fileType,
                        'file_path' => $storagePath
                    ]);
                }
            }

            // Upload optional files (can be multiple)
            if ($request->hasFile('blueprint')) {
                $blueprintFiles = $request->file('blueprint');
                // Handle both single file and array of files
                $files = is_array($blueprintFiles) ? $blueprintFiles : [$blueprintFiles];

                foreach ($files as $file) {
                    if ($file && $file->isValid()) {
                        $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                        $storagePath = $file->storeAs('projects', $fileName, 'public');

                        $this->projectsClass->createProjectFile([
                            'project_id' => $projectId,
                            'file_type' => 'blueprint',
                            'file_path' => $storagePath
                        ]);
                    }
                }
            }

            if ($request->hasFile('desired_design')) {
                $designFiles = $request->file('desired_design');
                // Handle both single file and array of files
                $files = is_array($designFiles) ? $designFiles : [$designFiles];

                foreach ($files as $file) {
                    if ($file && $file->isValid()) {
                        $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                        $storagePath = $file->storeAs('projects', $fileName, 'public');

                        $this->projectsClass->createProjectFile([
                            'project_id' => $projectId,
                            'file_type' => 'desired design',
                            'file_path' => $storagePath
                        ]);
                    }
                }
            }

            // Upload other files (multiple)
            if ($request->hasFile('others')) {
                foreach ($request->file('others') as $file) {
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $storagePath = $file->storeAs('projects', $fileName, 'public');

                    $this->projectsClass->createProjectFile([
                        'project_id' => $projectId,
                        'file_type' => 'others',
                        'file_path' => $storagePath
                    ]);
                }
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Project posted successfully. It is now under review.',
                    'project_id' => $projectId
                ], 201);
            } else {
                return redirect('/dashboard')->with('success', 'Project posted successfully. It is now under review.');
            }
        } catch (\Exception $e) {
            \Log::error('Project creation error: ' . $e->getMessage(), [
                'user_id' => $user->user_id ?? null,
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error creating project: ' . $e->getMessage()
                ], 500);
            } else {
                return back()->with('error', 'Error creating project: ' . $e->getMessage())->withInput();
            }
        }
    }

    public function showEditPostPage(Request $request, $projectId)
    {
        $user = Session::get('user');
        if (!$user) {
            return redirect('/accounts/login');
        }

        $currentRole = session('current_role', $user->user_type);
        $userType = $user->user_type;

        $isOwner = ($userType === 'property_owner' || $userType === 'both') &&
                   ($currentRole === 'owner' || $currentRole === 'property_owner');

        if (!$isOwner) {
            return redirect('/dashboard')->with('error', 'Only property owners can edit project posts.');
        }

        $owner = DB::table('property_owners')
            ->where('user_id', $user->user_id)
            ->first();

        if (!$owner) {
            return redirect('/dashboard')->with('error', 'Property owner record not found.');
        }

        // Verify ownership
        if (!$this->projectsClass->verifyOwnerProject($projectId, $owner->owner_id)) {
            return redirect('/dashboard')->with('error', 'You do not have permission to edit this project.');
        }

        $project = $this->projectsClass->getProjectById($projectId);
        $projectFiles = $this->projectsClass->getProjectFiles($projectId);
        $contractorTypes = $this->projectsClass->getContractorTypes();

        return view('owner.editPost', compact('project', 'projectFiles', 'contractorTypes'));
    }

    public function update(projectsRequest $request, $projectId)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            $currentRole = session('current_role', $user->user_type);
            $userType = $user->user_type;

            $isOwner = ($userType === 'property_owner' || $userType === 'both') &&
                       ($currentRole === 'owner' || $currentRole === 'property_owner');

            if (!$isOwner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only property owners can update project posts'
                ], 403);
            }

            $owner = DB::table('property_owners')
                ->where('user_id', $user->user_id)
                ->first();

            if (!$owner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Property owner record not found'
                ], 404);
            }

            // Verify ownership
            if (!$this->projectsClass->verifyOwnerProject($projectId, $owner->owner_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to update this project'
                ], 403);
            }

            $project = $this->projectsClass->getProjectById($projectId);
            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Project not found'
                ], 404);
            }

            $validated = $request->validated();

            // Update project (include if_others_ctype when provided)
            $updateData = [
                'project_title' => $validated['project_title'],
                'project_description' => $validated['project_description'],
                'project_location' => $validated['project_location'],
                'budget_range_min' => $validated['budget_range_min'],
                'budget_range_max' => $validated['budget_range_max'],
                'lot_size' => $validated['lot_size'],
                'floor_area' => $validated['floor_area'],
                'property_type' => $validated['property_type'],
                'type_id' => $validated['type_id']
            ];

            if (array_key_exists('if_others_ctype', $validated)) {
                $updateData['if_others_ctype'] = $validated['if_others_ctype'];
            }

            $this->projectsClass->updateProject($projectId, $updateData);

            // Update relationship bidding deadline
            if ($project->relationship_id) {
                $this->projectsClass->updateProjectRelationship(
                    $project->relationship_id,
                    $validated['bidding_deadline']
                );
            }

            // Handle file updates (delete old and upload new)
            // This is simplified - you may want to add logic to preserve existing files
            // and only update specific ones

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Project updated successfully. It is now under review again.'
                ], 200);
            } else {
                return redirect('/dashboard')->with('success', 'Project updated successfully. It is now under review again.');
            }
        } catch (\Exception $e) {
            \Log::error('Project update error: ' . $e->getMessage(), [
                'user_id' => $user->user_id ?? null,
                'project_id' => $projectId,
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error updating project: ' . $e->getMessage()
                ], 500);
            } else {
                return back()->with('error', 'Error updating project: ' . $e->getMessage())->withInput();
            }
        }
    }

    public function delete(Request $request, $projectId)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            $currentRole = session('current_role', $user->user_type);
            $userType = $user->user_type;

            $isOwner = ($userType === 'property_owner' || $userType === 'both') &&
                       ($currentRole === 'owner' || $currentRole === 'property_owner');

            if (!$isOwner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only property owners can delete project posts'
                ], 403);
            }

            $owner = DB::table('property_owners')
                ->where('user_id', $user->user_id)
                ->first();

            if (!$owner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Property owner record not found'
                ], 404);
            }

            // Verify ownership
            if (!$this->projectsClass->verifyOwnerProject($projectId, $owner->owner_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to delete this project'
                ], 403);
            }

            // Soft delete by updating project_post_status to 'deleted'
            $this->projectsClass->deleteProject($projectId);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Project deleted successfully'
                ], 200);
            } else {
                return redirect('/dashboard')->with('success', 'Project deleted successfully');
            }
        } catch (\Exception $e) {
            \Log::error('Project delete error: ' . $e->getMessage(), [
                'user_id' => $user->user_id ?? null,
                'project_id' => $projectId,
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error deleting project: ' . $e->getMessage()
                ], 500);
            } else {
                return back()->with('error', 'Error deleting project: ' . $e->getMessage());
            }
        }
    }

    public function acceptBid(Request $request, $projectId, $bidId)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            $currentRole = session('current_role', $user->user_type);
            $userType = $user->user_type;

            // Verify user is owner
            $isOwner = ($userType === 'property_owner' || $userType === 'both') &&
                       ($currentRole === 'owner' || $currentRole === 'property_owner');

            if (!$isOwner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only property owners can accept bids'
                ], 403);
            }

            // Get owner_id
            $owner = DB::table('property_owners')
                ->where('user_id', $user->user_id)
                ->first();

            if (!$owner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Property owner record not found'
                ], 404);
            }

            // Accept the bid
            $this->projectsClass->acceptBid($projectId, $bidId, $owner->owner_id);

            return response()->json([
                'success' => true,
                'message' => 'Bid accepted successfully! Bidding is now closed.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API endpoint to get active contractors for mobile app
     * Used in property owner's feed/homepage
     */
    public function apiGetContractors(Request $request)
    {
        try {
            // Get active contractors (no authentication required for browsing)
            $contractors = $this->projectsClass->getActiveContractors();

            return response()->json([
                'success' => true,
                'message' => 'Contractors retrieved successfully',
                'data' => $contractors
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving contractors: ' . $e->getMessage()
            ], 500);
        }
    }
}

