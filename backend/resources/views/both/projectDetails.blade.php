<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $project->project_title }} - Project Details</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .nav-links {
            background: #007bff;
            color: white;
            padding: 15px 20px;
            border-bottom: 1px solid #0056b3;
        }

        .nav-links a {
            color: white;
            text-decoration: none;
            margin-right: 15px;
            font-weight: 500;
            transition: opacity 0.2s;
        }

        .nav-links a:hover {
            opacity: 0.8;
            text-decoration: underline;
        }

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
        <div class="nav-links">
            <a href="/both/projects">Back</a> |
            <a href="/both/disputes">Disputes</a> |
            <a href="/dashboard">Dashboard</a>
        </div>

        <div class="project-header">
            <h1>
                {{ $project->project_title }}
                <span class="project-status status-{{ $project->project_status }}">
                    {{ ucfirst(str_replace('_', ' ', $project->project_status)) }}
                </span>
            </h1>
            <p><strong>Description:</strong> {{ $project->project_description }}</p>
            <p><strong>Location:</strong> {{ $project->project_location }}</p>
            <p><strong>Property Type:</strong> {{ $project->property_type }}</p>
                <p><strong>Owner:</strong> {{ $project->owner_name }}</p>
        </div>

        <h2>Project Milestones</h2>

        @if(count($milestones) > 0)
            @foreach($milestones as $milestone)
                <div class="milestone-container">
                    <div class="milestone-header">
                        <h3 style="margin: 0;">{{ $milestone['milestone_name'] }}</h3>
                        <p style="margin: 5px 0 0 0;">{{ $milestone['milestone_description'] }}</p>
                        <small>Status: {{ ucfirst(str_replace('_', ' ', $milestone['milestone_status'])) }} | {{ date('M d, Y', strtotime($milestone['start_date'])) }} - {{ date('M d, Y', strtotime($milestone['end_date'])) }}</small>
                    </div>

                    @if(count($milestone['items']) > 0)
                        @foreach($milestone['items'] as $item)
                            <div class="milestone-item">
                                <h4>{{ $item['milestone_item_title'] }}</h4>
                                <p>{{ $item['milestone_item_description'] }}</p>
                                <p><strong>Progress:</strong> {{ $item['percentage_progress'] }}% | <strong>Cost:</strong> ₱{{ number_format($item['milestone_item_cost'], 2) }}</p>
                                <p><small>Due: {{ date('M d, Y', strtotime($item['date_to_finish'])) }}</small></p>

                                @if($isOwner)
                                    <h5>Progress Reports:</h5>
                                    @if(count($item['progress_files']) > 0)
                                        @foreach($item['progress_files'] as $file)
                                            <div class="file-item">
                                                <strong>{{ $file->file_name }}</strong>
                                                <span class="file-status status-{{ $file->file_status }}">
                                                    {{ ucfirst(str_replace('_', ' ', $file->file_status)) }}
                                                </span>
                                                <p><small>Uploaded: {{ date('M d, Y h:i A', strtotime($file->uploaded_at)) }}</small></p>
                                                <a href="{{ asset('storage/' . $file->file_path) }}" target="_blank" class="btn btn-primary">View File</a>

                                                @if($file->file_status == 'submitted' || $file->file_status == 'under_review')
                                                    <button class="btn btn-success" onclick="approveProgress({{ $file->file_id }})">Approve</button>
                                                    <button class="btn btn-danger" onclick="rejectProgress({{ $file->file_id }}, {{ $item['item_id'] }}, {{ $project->project_id }}, {{ $milestone['milestone_id'] }})">Reject / File Dispute</button>
                                                @endif

                                                @if($file->owner_feedback)
                                                    <p><strong>Feedback:</strong> {{ $file->owner_feedback }}</p>
                                                @endif
                                            </div>
                                        @endforeach
                                    @else
                                        <div class="empty-state">No progress reports uploaded yet.</div>
                                    @endif
                                @else
                                    <div style="margin: 15px 0;">
                                        <a href="/contractor/progress/upload?item_id={{ $item['item_id'] }}&project_id={{ $project->project_id }}" class="btn btn-success">
                                            Upload Progress
                                        </a>
                                    </div>

                                    <h5>Payment Validations:</h5>
                                    @if(isset($item['payments']) && count($item['payments']) > 0)
                                        @foreach($item['payments'] as $payment)
                                            <div class="file-item {{ $payment->is_approved ? 'payment-approved' : '' }}">
                                                <strong>Payment: ₱{{ number_format($payment->amount, 2) }}</strong>
                                                @if($payment->is_approved)
                                                    <span class="file-status status-approved">Approved</span>
                                                @else
                                                    <span class="file-status status-submitted">Pending</span>
                                                @endif
                                                <p><strong>Type:</strong> {{ ucfirst(str_replace('_', ' ', $payment->payment_type)) }}</p>
                                                @if($payment->transaction_number)
                                                    <p><strong>Transaction #:</strong> {{ $payment->transaction_number }}</p>
                                                @endif
                                                <p><small>Date: {{ date('M d, Y h:i A', strtotime($payment->transaction_date)) }}</small></p>
                                                <a href="{{ asset('storage/' . $payment->receipt_photo) }}" target="_blank" class="btn btn-primary">View Receipt</a>

                                                @if(!$payment->is_approved)
                                                    <button class="btn btn-danger" onclick="disputePayment({{ $payment->payment_id }}, {{ $item['item_id'] }}, {{ $project->project_id }}, {{ $milestone['milestone_id'] }})">Dispute Payment</button>
                                                @endif
                                            </div>
                                        @endforeach
                                    @else
                                        <div class="empty-state">
                                            <p>No payment validations uploaded yet.</p>
                                            <button class="btn btn-danger" onclick="disputePayment(0, {{ $item['item_id'] }}, {{ $project->project_id }}, {{ $milestone['milestone_id'] }})">File Payment Dispute</button>
                                        </div>
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

    @include('modals.addEditDisputeModal')

    <script src="{{ asset('js/modal.js') }}"></script>
    <script src="{{ asset('js/both.js') }}"></script>
</body>
</html>
