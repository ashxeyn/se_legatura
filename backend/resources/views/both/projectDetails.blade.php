<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $project->project_title }} - Project Details</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
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
                                    <!-- Property Owner View: See Progress Files Uploaded by Contractor -->
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
                                    <!-- Contractor View: See Payment Validations Uploaded by Owner -->
                                    <h5>Payment Validations:</h5>
                                    @if(count($item['payments']) > 0)
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
                                        <div class="empty-state">No payment validations uploaded yet.</div>
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

    <script>
        function approveProgress(fileId) {
            console.log('Approve progress clicked for file:', fileId);
            alert('Progress approved! (This will be implemented with AJAX later)');
            // TODO: Implement AJAX call to approve progress
        }

        function rejectProgress(fileId, itemId, projectId, milestoneId) {
            console.log('Reject progress clicked:', { fileId, itemId, projectId, milestoneId });
            const url = '/both/disputes?project_id=' + projectId + '&milestone_id=' + milestoneId;
            console.log('Redirecting to:', url);
            window.location.href = url;
        }

        function disputePayment(paymentId, itemId, projectId, milestoneId) {
            console.log('Dispute payment clicked:', { paymentId, itemId, projectId, milestoneId });
            const url = '/both/disputes?project_id=' + projectId + '&milestone_id=' + milestoneId;
            console.log('Redirecting to:', url);
            window.location.href = url;
        }

        // Add click event listeners to make buttons more obvious (debugging)
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Project Details page loaded');
            const disputeButtons = document.querySelectorAll('.btn-danger');
            console.log('Found', disputeButtons.length, 'dispute buttons');
        });
    </script>
</body>
</html>
