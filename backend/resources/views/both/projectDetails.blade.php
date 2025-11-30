<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $project->project_title }} - Project Details</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('css/common.css') }}">
    <style>

        .project-header {
            padding: 30px 20px;
            border-bottom: 2px solid #e9ecef;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .project-header h1 {
            font-size: 2.2em;
            margin-bottom: 15px;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
        }

        .project-status {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.6em;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .status-pending { background: #fff3cd; color: #856404; }
        .status-in_progress { background: #d1ecf1; color: #0c5460; }
        .status-completed { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }

        .project-header p {
            margin: 8px 0;
            font-size: 1.1em;
        }

        .project-header strong {
            color: #495057;
            font-weight: 600;
        }

        h2 {
            padding: 25px 20px 15px;
            font-size: 1.8em;
            color: #2c3e50;
            border-bottom: 3px solid #007bff;
            margin-bottom: 20px;
            background: white;
        }

        .milestone-container {
            margin: 20px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }

        .milestone-header {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            padding: 20px;
            border-bottom: 1px solid #90caf9;
        }

        .milestone-header h3 {
            color: #1565c0;
            font-size: 1.4em;
            margin-bottom: 8px;
        }

        .milestone-header p {
            color: #424242;
            margin-bottom: 8px;
        }

        .milestone-header small {
            color: #666;
            font-weight: 500;
        }

        .milestone-item {
            padding: 20px;
            border-bottom: 1px solid #f1f3f4;
            transition: background-color 0.2s;
        }

        .milestone-item:hover {
            background-color: #f8f9fa;
        }

        .milestone-item:last-child {
            border-bottom: none;
        }

        .milestone-item h4 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 1.2em;
        }

        .milestone-item p {
            margin-bottom: 8px;
        }

        .btn {
            display: inline-block;
            padding: 10px 20px;
            margin: 5px;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }

        .btn-primary {
            background: #007bff;
            color: white;
        }

        .btn-primary:hover {
            background: #0056b3;
            transform: translateY(-2px);
        }

        .btn-success {
            background: #28a745;
            color: white;
        }

        .btn-success:hover {
            background: #1e7e34;
            transform: translateY(-2px);
        }

        .btn-warning {
            background: #ffc107;
            color: #212529;
        }

        .btn-warning:hover {
            background: #e0a800;
            transform: translateY(-2px);
        }

        .progress-files, .evidence-files {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-top: 10px;
        }

        .progress-files h5, .evidence-files h5 {
            margin-bottom: 10px;
            color: #495057;
        }

        .file-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .file-list a {
            background: #e3f2fd;
            color: #1976d2;
            padding: 8px 12px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 14px;
            transition: background-color 0.2s;
        }

        .file-list a:hover {
            background: #bbdefb;
        }

        .alert {
            padding: 15px;
            margin: 20px;
            border-radius: 6px;
            font-weight: 500;
        }

        .alert-info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }

        @media (max-width: 768px) {
            body {
                padding: 10px;
            }

            .project-header h1 {
                font-size: 1.8em;
                flex-direction: column;
                align-items: flex-start;
            }

            .milestone-container {
                margin: 10px;
            }

            .btn {
                display: block;
                width: 100%;
                margin: 5px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $project->project_title }}</h1>
        <div class="nav-links">
                <a href="/both/projects">My Projects</a>
                <a href="/both/disputes">Disputes</a>
            <a href="/dashboard">Dashboard</a>
            </div>
        </div>

        <div class="card">
            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 24px; margin-bottom: 15px; color: #1c1e21;">{{ $project->project_title }}</h2>
                <p style="margin-bottom: 10px; color: #65676b;"><strong>Description:</strong> {{ $project->project_description }}</p>
                <p style="margin-bottom: 10px; color: #65676b;"><strong>Location:</strong> {{ $project->project_location }}</p>
                <p style="margin-bottom: 10px; color: #65676b;"><strong>Property Type:</strong> {{ $project->property_type }}</p>
                <p style="margin-bottom: 10px; color: #65676b;"><strong>Owner:</strong> {{ $project->owner_name }}</p>
            </div>
        </div>

        @if($isOwner && $project->project_status === 'open')
            <div class="card">
                <h2 style="font-size: 20px; margin-bottom: 15px; color: #1c1e21; border-bottom: 2px solid #e4e6eb; padding-bottom: 10px;">Project Bids</h2>
                @if(isset($bids) && count($bids) > 0)
                    <p style="margin-bottom: 20px; color: #65676b;">Review and select a contractor for this project.</p>
                
                <div style="display: grid; gap: 15px;">
                    @foreach($bids as $bid)
                        <div class="bid-item" style="border: 1px solid #e4e6eb; border-radius: 8px; padding: 20px; background: #f8f9fa;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                                <div>
                                    <h3 style="font-size: 18px; margin-bottom: 5px; color: #1c1e21;">{{ $bid->company_name }}</h3>
                                    <p style="color: #65676b; font-size: 14px; margin-bottom: 5px;">
                                        {{ $bid->years_of_experience }} years experience | {{ $bid->completed_projects }} completed projects
                                    </p>
                                    <p style="color: #8a8d91; font-size: 12px;">
                                        Submitted: {{ date('M d, Y h:i A', strtotime($bid->submitted_at)) }}
                                    </p>
                                </div>
                                <span class="status-badge status-{{ $bid->bid_status }}">
                                    {{ ucfirst(str_replace('_', ' ', $bid->bid_status)) }}
                                </span>
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px;">
                                <div>
                                    <strong style="color: #65676b; display: block; margin-bottom: 5px;">Proposed Cost:</strong>
                                    <span style="font-size: 18px; color: #1c1e21; font-weight: 600;">₱{{ number_format($bid->proposed_cost, 2) }}</span>
                                </div>
                                <div>
                                    <strong style="color: #65676b; display: block; margin-bottom: 5px;">Estimated Timeline:</strong>
                                    <span style="font-size: 18px; color: #1c1e21; font-weight: 600;">{{ $bid->estimated_timeline }} months</span>
                                </div>
                                @if($bid->contractor_notes)
                                    <div style="grid-column: 1 / -1;">
                                        <strong style="color: #65676b; display: block; margin-bottom: 5px;">Notes:</strong>
                                        <p style="color: #1c1e21;">{{ $bid->contractor_notes }}</p>
                                    </div>
                                @endif
                            </div>

                            @if(isset($bid->files) && count($bid->files) > 0)
                                <div style="margin-bottom: 15px;">
                                    <strong style="color: #65676b; display: block; margin-bottom: 10px;">Bid Files:</strong>
                                    <div style="display: flex; flex-direction: column; gap: 8px;">
                                        @foreach($bid->files as $file)
                                            <div style="padding: 8px; background: white; border-radius: 6px; border: 1px solid #e4e6eb;">
                                                <a href="{{ asset('storage/' . $file->file_path) }}" target="_blank" style="color: #1877f2; text-decoration: none; font-size: 14px;">
                                                    📎 {{ $file->file_name }}
                                                </a>
                                            </div>
                                        @endforeach
                                    </div>
                                </div>
                            @elseif($bid->file_count > 0)
                                <div style="margin-bottom: 15px;">
                                    <strong style="color: #65676b; display: block; margin-bottom: 5px;">Bid Files:</strong>
                                    <p style="color: #1c1e21; font-size: 14px;">{{ $bid->file_count }} file(s) attached</p>
                                </div>
                            @endif

                            @if($bid->bid_status === 'submitted' || $bid->bid_status === 'under_review')
                                <div style="display: flex; gap: 10px; margin-top: 15px;">
                                    <button onclick="AcceptBidModal.open({{ $bid->bid_id }}, '{{ addslashes($bid->company_name) }}', {{ $bid->proposed_cost }}, {{ $project->project_id }})" 
                                            class="btn btn-primary">Select This Contractor</button>
                                </div>
                            @elseif($bid->bid_status === 'accepted')
                                <div style="margin-top: 15px; padding: 10px; background: #d4edda; border-radius: 6px; color: #155724;">
                                    <strong>✓ Selected Contractor</strong>
                                    @if($bid->decision_date)
                                        <p style="margin: 5px 0 0 0; font-size: 12px;">Accepted on: {{ date('M d, Y h:i A', strtotime($bid->decision_date)) }}</p>
                                    @endif
                                </div>
                            @elseif($bid->bid_status === 'rejected')
                                <div style="margin-top: 15px; padding: 10px; background: #f8d7da; border-radius: 6px; color: #721c24;">
                                    <strong>Rejected</strong>
                                    @if($bid->decision_date)
                                        <p style="margin: 5px 0 0 0; font-size: 12px;">Rejected on: {{ date('M d, Y h:i A', strtotime($bid->decision_date)) }}</p>
                                    @endif
                                </div>
                            @endif
                        </div>
                        @endforeach
                    </div>
                @else
                    <div class="empty-state">
                        <h3>No Bids Yet</h3>
                        <p>No contractors have submitted bids for this project yet. Check back later.</p>
                    </div>
                @endif
            </div>
        @elseif($isOwner && $project->project_status === 'bidding_closed' && $project->selected_contractor_id)
            <div class="card">
                <h2 style="font-size: 20px; margin-bottom: 15px; color: #1c1e21; border-bottom: 2px solid #e4e6eb; padding-bottom: 10px;">Selected Contractor</h2>
                <div style="padding: 15px; background: #d4edda; border-radius: 6px; color: #155724;">
                    <p style="margin-bottom: 10px;"><strong>Bidding Closed</strong></p>
                    <p style="margin: 0;">A contractor has been selected for this project. Bidding is now closed.</p>
                </div>
            </div>
        @endif

        @if($isContractor && isset($canSetupMilestone) && $canSetupMilestone)
            <div class="card">
                <h2 style="font-size: 20px; margin-bottom: 15px; color: #1c1e21; border-bottom: 2px solid #e4e6eb; padding-bottom: 10px;">Milestone Setup</h2>
                <div style="padding: 15px; background: #fff3cd; border-radius: 6px; color: #856404; margin-bottom: 15px;">
                    <p style="margin-bottom: 10px;"><strong>No milestone has been set up for this project yet.</strong></p>
                    <p style="margin: 0 0 15px 0;">Set up the milestones to define the project timeline and payment schedule.</p>
                    <a href="/contractor/milestone/setup?project_id={{ $project->project_id }}" class="btn btn-primary">Setup Milestone</a>
                </div>
            </div>
        @endif

        @if(!$isOwner || ($isOwner && $project->project_status === 'bidding_closed' && $project->selected_contractor_id))
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid #e4e6eb; padding-bottom: 10px;">
                    <h2 style="font-size: 20px; margin: 0; color: #1c1e21;">Project Milestones</h2>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        @if($isContractor)
                            @if(count($milestones) > 0)
                                @php
                                    $firstMilestone = reset($milestones);
                                    $firstMilestoneId = $firstMilestone['milestone_id'] ?? null;
                                @endphp
                                @if($firstMilestoneId)
                                    <a href="/contractor/milestone/setup?project_id={{ $project->project_id }}&milestone_id={{ $firstMilestoneId }}" class="btn btn-primary" style="padding: 6px 12px; font-size: 14px; text-decoration: none;">Edit Milestone</a>
                                    <button type="button" onclick="openDeleteMilestoneModal({{ $firstMilestoneId }})" class="btn btn-danger" style="padding: 6px 12px; font-size: 14px;">Delete Milestone</button>
                                @endif
                            @elseif(isset($canSetupMilestone) && $canSetupMilestone)
                                <span class="status-badge status-milestone-not-setup">Milestone Not Set Up Yet</span>
                            @endif
                        @endif
                    </div>
                </div>

        @if(count($milestones) > 0)
            @foreach($milestones as $milestone)
                <div class="milestone-container">
                    <div class="milestone-header">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div style="flex: 1;">
                        <h3 style="margin: 0;">{{ $milestone['milestone_name'] }}</h3>
                        <p style="margin: 5px 0 0 0;">{{ $milestone['milestone_description'] }}</p>
                        <small>Status: {{ ucfirst(str_replace('_', ' ', $milestone['milestone_status'])) }} | {{ date('M d, Y', strtotime($milestone['start_date'])) }} - {{ date('M d, Y', strtotime($milestone['end_date'])) }}</small>
                                @if(isset($milestone['setup_status']))
                                    @if($milestone['setup_status'] === 'submitted')
                                        <div style="margin-top: 10px;">
                                            <span class="status-badge" style="background-color: #fff3cd; color: #856404;">Pending Approval</span>
                                        </div>
                                    @elseif($milestone['setup_status'] === 'approved')
                                        <div style="margin-top: 10px;">
                                            <span class="status-badge" style="background-color: #d4edda; color: #155724;">Approved</span>
                                        </div>
                                    @elseif($milestone['setup_status'] === 'rejected')
                                        <div style="margin-top: 10px;">
                                            <span class="status-badge" style="background-color: #f8d7da; color: #721c24;">Rejected</span>
                                            @if(isset($milestone['setup_rej_reason']) && !empty($milestone['setup_rej_reason']))
                                                <p style="margin-top: 5px; color: #721c24; font-size: 13px;"><strong>Reason:</strong> {{ $milestone['setup_rej_reason'] }}</p>
                                            @endif
                                        </div>
                                    @endif
                                @endif
                            </div>
                            @if($isOwner && isset($milestone['setup_status']) && $milestone['setup_status'] === 'submitted')
                                <div style="display: flex; gap: 10px; margin-left: 15px;">
                                    <button type="button" onclick="openApproveMilestoneModal({{ $milestone['milestone_id'] }})" class="btn btn-primary" style="padding: 6px 12px; font-size: 14px;">Approve</button>
                                    <button type="button" onclick="openRejectMilestoneModal({{ $milestone['milestone_id'] }})" class="btn btn-danger" style="padding: 6px 12px; font-size: 14px;">Reject</button>
                                </div>
                            @endif
                        </div>
                    </div>

                    @if(count($milestone['items']) > 0)
                        @foreach($milestone['items'] as $item)
                            <div class="milestone-item">
                                <h4>{{ $item['milestone_item_title'] }}</h4>
                                <p>{{ $item['milestone_item_description'] }}</p>
                                <p><strong>Progress:</strong> {{ $item['percentage_progress'] }}% | <strong>Cost:</strong> ₱{{ number_format($item['milestone_item_cost'], 2) }}</p>
                                <p><small>Due: {{ date('M d, Y', strtotime($item['date_to_finish'])) }}</small></p>

                                @if($isOwner)
                                    @if(isset($milestone['setup_status']) && $milestone['setup_status'] === 'approved')
                                    <h5>Progress Reports:</h5>
                                    @if(count($item['progress_files']) > 0)
                                            @foreach($item['progress_files'] as $progress)
                                            <div class="file-item">
                                                    <strong>Purpose: {{ $progress->purpose }}</strong>
                                                    <span class="file-status status-{{ $progress->progress_status }}">
                                                        {{ ucfirst(str_replace('_', ' ', $progress->progress_status)) }}
                                                </span>
                                                    <p><small>Submitted: {{ date('M d, Y h:i A', strtotime($progress->submitted_at)) }}</small></p>

                                                    @if(isset($progress->files) && count($progress->files) > 0)
                                                        <p><strong>Files:</strong></p>
                                                        <ul>
                                                            @foreach($progress->files as $file)
                                                                <li>
                                                                    <a href="{{ asset('storage/' . $file->file_path) }}" target="_blank">
                                                                        {{ $file->original_name ?? basename($file->file_path) }}
                                                                    </a>
                                                                </li>
                                                            @endforeach
                                                        </ul>
                                                @endif

                                                    @if($progress->progress_status == 'submitted' || $progress->progress_status == 'under_review')
                                                        <button class="btn btn-success" onclick="ProgressApprove.open({{ $progress->progress_id }})">Approve</button>
                                                        <button class="btn btn-danger" onclick="rejectProgress({{ $progress->progress_id }}, {{ $item['item_id'] }}, {{ $project->project_id }}, {{ $milestone['milestone_id'] }})">Reject / File Dispute</button>
                                                @endif
                                            </div>
                                        @endforeach
                                    @else
                                        <div class="empty-state">No progress reports uploaded yet.</div>
                                        @endif

                                        <h5 style="margin-top:12px;">Payment Validations:</h5>
                                        @php
                                            // Require that at least one contractor progress report
                                            // for this milestone item exists and has been approved
                                            $hasApprovedProgress = false;
                                            if (isset($item['progress_files']) && count($item['progress_files']) > 0) {
                                                foreach ($item['progress_files'] as $progress) {
                                                    if (isset($progress->progress_status) && $progress->progress_status === 'approved') {
                                                        $hasApprovedProgress = true;
                                                        break;
                                                    }
                                                }
                                            }

                                            // Only allow upload when there's an approved progress
                                            // and there are no existing active (non-rejected/non-deleted) payments
                                            $canUploadPayment = false;
                                            if ($hasApprovedProgress) {
                                                $canUploadPayment = true;
                                                if (isset($item['payments']) && count($item['payments']) > 0) {
                                                    foreach ($item['payments'] as $p) {
                                                        if (!in_array($p->payment_status ?? 'submitted', ['rejected', 'deleted'])) {
                                                            $canUploadPayment = false;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        @endphp
                                        <div style="margin-bottom:10px;">
                                            @if($canUploadPayment)
                                                <button class="btn btn-primary" onclick="PaymentModal.open('add', { item_id: {{ $item['item_id'] }}, project_id: {{ $project->project_id }}, item_title: '{{ addslashes($item['milestone_item_title']) }}' })">Upload Payment Validation</button>
                                            @else
                                                <button class="btn btn-primary" disabled style="opacity:0.6;cursor:not-allowed;">Upload Payment Validation</button>
                                                @php
                                                    // Provide a clear inline reason why the button is disabled
                                                    $disabledReason = '';
                                                    if (!($hasApprovedProgress ?? false)) {
                                                        $disabledReason = 'No approved progress report yet. The contractor must submit a progress report and you must approve it before uploading payment validations.';
                                                    } else {
                                                        $disabledReason = 'You already have an active payment validation for this milestone. Only rejected or deleted payments may be re-submitted.';
                                                    }
                                                @endphp
                                                <p style="color:#856404;font-size:14px;margin-top:6px;margin-bottom:0;">{{ $disabledReason }}</p>
                                            @endif
                                        </div>

                                        @if(isset($item['payments']) && count($item['payments']) > 0)
                                            @foreach($item['payments'] as $payment)
                                                @if($payment->payment_status !== 'deleted')
                                                    <div class="file-item {{ $payment->payment_status === 'approved' ? 'payment-approved' : '' }}">
                                                        <strong>Payment: ₱{{ number_format($payment->amount, 2) }}</strong>
                                                        @if($payment->payment_status === 'approved')
                                                            <span class="file-status status-approved">Approved</span>
                                                        @else
                                                            <span class="file-status status-{{ $payment->payment_status }}">{{ ucfirst(str_replace('_', ' ', $payment->payment_status)) }}</span>
                                                        @endif
                                                        <p><strong>Type:</strong> {{ ucfirst(str_replace('_', ' ', $payment->payment_type)) }}</p>
                                                        @if($payment->transaction_number)
                                                            <p><strong>Transaction #:</strong> {{ $payment->transaction_number }}</p>
                                                        @endif
                                                        <p><small>Date: {{ $payment->transaction_date ? date('M d, Y', strtotime($payment->transaction_date)) : 'N/A' }}</small></p>
                                                        @if($payment->receipt_photo)
                                                            <p><a href="{{ asset('storage/' . $payment->receipt_photo) }}" target="_blank">View Receipt</a></p>
                                                        @endif
                                                        <div style="margin-top:8px;">
                                                            <button class="btn btn-secondary" onclick='PaymentModal.open("edit", @json(array_merge((array)$payment, ["item_title" => $item["milestone_item_title"]])))'>Edit</button>
                                                            <button class="btn btn-danger" onclick="PaymentDelete.open({{ $payment->payment_id }})">Delete</button>
                                                        </div>
                                                    </div>
                                                @endif
                                            @endforeach
                                        @else
                                            <div class="empty-state">No payment validations uploaded yet.</div>
                                        @endif
                                    @endif
                                @else
                                    @if(isset($milestone['setup_status']) && $milestone['setup_status'] === 'approved')
                                    @php
                                        $canUpload = true;
                                        $hasNeedsRevision = false;
                                        if (count($item['progress_files']) > 0) {
                                                foreach ($item['progress_files'] as $progress) {
                                                // Allow upload if status is needs_revision or deleted
                                                    if (!in_array($progress->progress_status, ['needs_revision', 'deleted'])) {
                                                    $canUpload = false;
                                                }
                                                    if ($progress->progress_status === 'needs_revision') {
                                                    $hasNeedsRevision = true;
                                                }
                                            }
                                        }
                                    @endphp

                                    <div style="margin: 15px 0;">
                                        @if($canUpload)
                                            <button class="btn btn-success" onclick="openProgressUploadModal({{ $item['item_id'] }}, {{ $project->project_id }}, '{{ addslashes($item['milestone_item_title']) }}')">
                                                {{ $hasNeedsRevision ? 'Upload Revised Progress' : 'Upload Progress' }}
                                            </button>
                                        @else
                                            <button class="btn btn-success" disabled style="opacity: 0.5; cursor: not-allowed;" title="You already have a progress report submitted. Wait for review before uploading a new one.">
                                                Upload Progress
                                            </button>
                                            <p style="color: #856404; font-size: 14px; margin-top: 5px;">
                                                <em>You already have a progress report for this milestone. You can upload a new report once the current one is reviewed.</em>
                                            </p>
                                        @endif
                                    </div>

                                    @if(count($item['progress_files']) > 0)
                                        <div class="progress-files">
                                                <h5>Uploaded Progress Reports:</h5>
                                            <div class="file-list">
                                                    @foreach($item['progress_files'] as $progress)
                                                    <div class="file-item">
                                                            <strong>Purpose: {{ $progress->purpose }}</strong>
                                                            <span class="file-status status-{{ $progress->progress_status }}">
                                                                {{ ucfirst(str_replace('_', ' ', $progress->progress_status)) }}
                                                            </span>
                                                            <p><small>Submitted: {{ date('M d, Y h:i A', strtotime($progress->submitted_at)) }}</small></p>
                                                            @if(isset($progress->files) && count($progress->files) > 0)
                                                                <p><strong>Files:</strong></p>
                                                                <ul>
                                                                    @foreach($progress->files as $file)
                                                                        <li>
                                                        <a href="{{ asset('storage/' . $file->file_path) }}" target="_blank">
                                                                                {{ $file->original_name ?? basename($file->file_path) }}
                                                        </a>
                                                                        </li>
                                                                    @endforeach
                                                                </ul>
                                                            @endif
                                                            @if($progress->progress_status === 'needs_revision' || $progress->progress_status === 'submitted')
                                                                <button class="btn btn-warning" onclick="editProgress({{ $progress->progress_id }})">Edit</button>
                                                                <button class="btn btn-danger" onclick="deleteProgress({{ $progress->progress_id }})">Delete</button>
                                                        @endif
                                                    </div>
                                                @endforeach
                                            </div>
                                        </div>
                                    @endif

                                    <h5>Payment Validations:</h5>
                                    @if(isset($item['payments']) && count($item['payments']) > 0)
                                        @foreach($item['payments'] as $payment)
                                                @if($payment->payment_status !== 'deleted')
                                                    <div class="file-item {{ $payment->payment_status === 'approved' ? 'payment-approved' : '' }}">
                                                <strong>Payment: ₱{{ number_format($payment->amount, 2) }}</strong>
                                                        @if($payment->payment_status === 'approved')
                                                    <span class="file-status status-approved">Approved</span>
                                                @else
                                                            <span class="file-status status-{{ $payment->payment_status }}">{{ ucfirst(str_replace('_', ' ', $payment->payment_status)) }}</span>
                                                @endif
                                                <p><strong>Type:</strong> {{ ucfirst(str_replace('_', ' ', $payment->payment_type)) }}</p>
                                                @if($payment->transaction_number)
                                                    <p><strong>Transaction #:</strong> {{ $payment->transaction_number }}</p>
                                                @endif
                                                        <p><small>Date: {{ date('M d, Y', strtotime($payment->transaction_date)) }}</small></p>
                                                <a href="{{ asset('storage/' . $payment->receipt_photo) }}" target="_blank" class="btn btn-primary">View Receipt</a>

                                                        @if($payment->payment_status !== 'approved' && $payment->payment_status !== 'deleted')
                                                            @if($payment->payment_status === 'submitted')
                                                                <button class="btn btn-success" onclick="openApprovePaymentModal({{ $payment->payment_id }})">Approve</button>
                                                            @endif
                                                    <button class="btn btn-danger" onclick="disputePayment({{ $payment->payment_id }}, {{ $item['item_id'] }}, {{ $project->project_id }}, {{ $milestone['milestone_id'] }})">Dispute Payment</button>
                                                        @endif
                                                </div>
                                                @endif
                                        @endforeach
                                    @else
                                        <div class="empty-state">
                                            <p>No payment validations uploaded yet.</p>
                                            <button class="btn btn-danger" onclick="disputePayment(0, {{ $item['item_id'] }}, {{ $project->project_id }}, {{ $milestone['milestone_id'] }})">File Payment Dispute</button>
                                        </div>
                                        @endif
                                    @endif
                                @endif
                            </div>
                        @endforeach
                    @else
                        <div class="empty-state">No milestone items for this milestone.</div>
                    @endif
                </div>
            @endforeach
        @else
            <div class="empty-state">
                <h3>No Milestones Found</h3>
                <p>This project doesn't have any milestones set up yet.</p>
            </div>
        @endif
    </div>
        @endif

    @include('modals.addEditDisputeModal')
    @include('modals.addEditProgressModal')
    @include('modals.deleteProgressModal')
    @include('modals.approveProgressModal')
    @include('modals.addEditPaymentModal')
    @include('modals.deletePaymentModal')
    @include('modals.approvePaymentModal')
    @if($isOwner && $project->project_status === 'open')
        @include('modals.acceptBidModal')
    @endif

    <script src="{{ asset('js/modal.js') }}"></script>
    <script src="{{ asset('js/both.js') }}"></script>
    @if($isContractor)
        <script src="{{ asset('js/contractor.js') }}"></script>
    @endif

    @if($isContractor && count($milestones) > 0)
        @include('modals.deleteMilestoneModal')
    @endif

    @if($isOwner)
        @include('modals.approveMilestoneModal')
        @include('modals.rejectMilestoneModal')
    @endif
    @if($isOwner)
        <script src="{{ asset('js/owner.js') }}"></script>
    @endif

</body>
</html>
