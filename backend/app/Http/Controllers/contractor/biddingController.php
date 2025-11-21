<?php

namespace App\Http\Controllers\contractor;

use App\Http\Controllers\Controller;
use App\Http\Requests\contractor\biddingRequest;
use App\Models\contractor\biddingClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class biddingController extends Controller
{
    protected $biddingClass;

    public function __construct(biddingClass $biddingClass)
    {
        $this->biddingClass = $biddingClass;
    }

    public function showProjectOverview($projectId)
    {
        $user = Session::get('user');
        if (!$user) {
            return redirect('/accounts/login');
        }

        // Get contractor info
        $contractor = DB::table('contractors')
            ->where('user_id', $user->user_id)
            ->first();

        if (!$contractor) {
            return redirect('/dashboard')->with('error', 'Contractor profile not found.');
        }

        // Get project details
        $project = $this->biddingClass->getProjectForBidding($projectId);
        
        if (!$project) {
            return redirect('/dashboard')->with('error', 'Project not found or not available for bidding.');
        }

        // Check if bidding deadline has passed
        $biddingDeadline = $project->bidding_deadline;
        $canBid = true;
        if ($biddingDeadline) {
            $canBid = strtotime($biddingDeadline) >= time();
        }

        // Get project files
        $projectFiles = $this->biddingClass->getProjectFiles($projectId);

        // Get existing bid if any
        $existingBid = $this->biddingClass->getContractorBid($projectId, $contractor->contractor_id);
        $bidFiles = [];
        if ($existingBid) {
            $bidFiles = $this->biddingClass->getBidFiles($existingBid->bid_id);
        }

        return view('contractor.projectOverview', compact('project', 'projectFiles', 'contractor', 'existingBid', 'bidFiles', 'canBid'));
    }

    public function store(biddingRequest $request)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not authenticated.'], 401);
            }

            // Get contractor info
            $contractor = DB::table('contractors')
                ->where('user_id', $user->user_id)
                ->first();

            if (!$contractor) {
                return response()->json(['success' => false, 'message' => 'Contractor profile not found.'], 404);
            }

            // Check if bid already exists
            $existingBid = $this->biddingClass->getContractorBid($request->project_id, $contractor->contractor_id);
            if ($existingBid) {
                return response()->json(['success' => false, 'message' => 'You have already submitted a bid for this project.'], 400);
            }

            // Create bid
            $bidId = $this->biddingClass->createBid([
                'project_id' => $request->project_id,
                'contractor_id' => $contractor->contractor_id,
                'proposed_cost' => $request->proposed_cost,
                'estimated_timeline' => $request->estimated_timeline,
                'contractor_notes' => $request->contractor_notes
            ]);

            // Handle file uploads
            if ($request->hasFile('bid_files')) {
                foreach ($request->file('bid_files') as $file) {
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $filePath = $file->storeAs('bid_files', $fileName, 'public');

                    $this->biddingClass->createBidFile([
                        'bid_id' => $bidId,
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $filePath,
                        'description' => null
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Bid submitted successfully!',
                'bid_id' => $bidId
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(biddingRequest $request)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not authenticated.'], 401);
            }

            // Get contractor info
            $contractor = DB::table('contractors')
                ->where('user_id', $user->user_id)
                ->first();

            if (!$contractor) {
                return response()->json(['success' => false, 'message' => 'Contractor profile not found.'], 404);
            }

            // Verify bid belongs to contractor
            $bid = DB::table('bids')
                ->where('bid_id', $request->bid_id)
                ->where('contractor_id', $contractor->contractor_id)
                ->first();

            if (!$bid) {
                return response()->json(['success' => false, 'message' => 'Bid not found or you do not have permission to edit it.'], 404);
            }

            // Check if bid can be edited (only submitted or under_review status)
            if (!in_array($bid->bid_status, ['submitted', 'under_review'])) {
                return response()->json(['success' => false, 'message' => 'This bid cannot be edited in its current status.'], 400);
            }

            // Update bid
            $this->biddingClass->updateBid($request->bid_id, [
                'proposed_cost' => $request->proposed_cost,
                'estimated_timeline' => $request->estimated_timeline,
                'contractor_notes' => $request->contractor_notes
            ]);

            // Handle new file uploads
            if ($request->hasFile('bid_files')) {
                foreach ($request->file('bid_files') as $file) {
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $filePath = $file->storeAs('bid_files', $fileName, 'public');

                    $this->biddingClass->createBidFile([
                        'bid_id' => $request->bid_id,
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $filePath,
                        'description' => null
                    ]);
                }
            }

            // Handle file deletions
            if ($request->has('delete_files')) {
                foreach ($request->delete_files as $fileId) {
                    $this->biddingClass->deleteBidFile($fileId);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Bid updated successfully!'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    public function cancel(Request $request, $bidId)
    {
        try {
            $user = Session::get('user');
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not authenticated.'], 401);
            }

            // Get contractor info
            $contractor = DB::table('contractors')
                ->where('user_id', $user->user_id)
                ->first();

            if (!$contractor) {
                return response()->json(['success' => false, 'message' => 'Contractor profile not found.'], 404);
            }

            // Verify bid belongs to contractor
            $bid = DB::table('bids')
                ->where('bid_id', $bidId)
                ->where('contractor_id', $contractor->contractor_id)
                ->first();

            if (!$bid) {
                return response()->json(['success' => false, 'message' => 'Bid not found or you do not have permission to cancel it.'], 404);
            }

            // Check if bid can be cancelled (only submitted or under_review status, not already withdrawn)
            if (!in_array($bid->bid_status, ['submitted', 'under_review'])) {
                return response()->json(['success' => false, 'message' => 'This bid cannot be cancelled in its current status.'], 400);
            }
            
            if ($bid->bid_status === 'withdrawn') {
                return response()->json(['success' => false, 'message' => 'This bid has already been cancelled.'], 400);
            }

            // Cancel bid (delete it)
            $this->biddingClass->cancelBid($bidId);

            return response()->json([
                'success' => true,
                'message' => 'Bid cancelled successfully!'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }
}

