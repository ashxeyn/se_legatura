<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Disputes</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <div class="container">
        <h1>Dispute Management</h1>
        <p>File a dispute for project issues or view existing disputes.</p>

        <div id="errorMessages" class="error-messages"></div>
        <div id="successMessages" class="success-messages"></div>

        <h2>File New Dispute</h2>
        <form id="fileDisputeForm">
            <div class="form-group">
                <label for="project_id">Project *</label>
                <select id="project_id" name="project_id" required>
                    <option value="">Select Project</option>
                    @foreach($projects as $project)
                        <option value="{{ $project->project_id }}"
                                data-contractor-id="{{ $project->contractor_user_id ?? '' }}"
                                data-owner-id="{{ $project->owner_id }}">
                            {{ $project->project_title }}
                        </option>
                    @endforeach
                </select>
            </div>

            <div class="form-group">
                <label for="milestone_id">Milestone (Optional)</label>
                <select id="milestone_id" name="milestone_id">
                    <option value="">Select Milestone (Optional)</option>
                </select>
            </div>

            <div class="form-group">
                <label for="dispute_type">Dispute Type *</label>
                <select id="dispute_type" name="dispute_type" required>
                    <option value="">Select Dispute Type</option>
                    <option value="Payment">Payment</option>
                    <option value="Delay">Delay</option>
                    <option value="Quality">Quality</option>
                    <option value="Others">Others</option>
                </select>
            </div>

            <div class="form-group">
                <label for="dispute_desc">Dispute Description *</label>
                <textarea id="dispute_desc" name="dispute_desc" required maxlength="2000" placeholder="Provide detailed description of the dispute..."></textarea>
                <small id="charCount">0 / 2000 characters</small>
            </div>

            <div class="form-group">
                <label for="evidence_file">Evidence File (Optional)</label>
                <input type="file" id="evidence_file" name="evidence_file" accept=".jpg,.jpeg,.png,.pdf">
                <small>Accepted formats: JPG, JPEG, PNG, PDF (Max 5MB)</small>
            </div>

            <button type="submit">Submit Dispute</button>
            <button type="button" onclick="resetForm()">Reset</button>
        </form>

        <div class="dispute-list">
            <h2>My Disputes</h2>
            <div id="disputeListContainer">
                @if(count($disputes) > 0)
                    @foreach($disputes as $dispute)
                        <div class="dispute-item">
                            <div class="dispute-header">
                                <strong>{{ $dispute->project_title }}</strong>
                                <span class="dispute-status status-{{ $dispute->dispute_status }}">
                                    {{ ucfirst(str_replace('_', ' ', $dispute->dispute_status)) }}
                                </span>
                            </div>
                            <p><strong>Type:</strong> {{ $dispute->dispute_type }}</p>
                            @if($dispute->milestone_name)
                                <p><strong>Milestone:</strong> {{ $dispute->milestone_name }}</p>
                            @endif
                            <p><strong>Filed by:</strong> {{ $dispute->raised_by_username }}</p>
                            <p><strong>Against:</strong> {{ $dispute->against_username }}</p>
                            <p><strong>Description:</strong> {{ $dispute->dispute_desc }}</p>
                            @if($dispute->evidence_file)
                                <p><strong>Evidence:</strong> <a href="{{ asset('storage/' . $dispute->evidence_file) }}" target="_blank">View File</a></p>
                            @endif
                            <p><small>Filed on: {{ date('M d, Y h:i A', strtotime($dispute->dispute_created_at)) }}</small></p>
                            @if($dispute->admin_response)
                                <p><strong>Admin Response:</strong> {{ $dispute->admin_response }}</p>
                            @endif
                        </div>
                    @endforeach
                @else
                    <p>No disputes found.</p>
                @endif
            </div>
        </div>
    </div>

    <script src="{{ asset('js/both.js') }}"></script>
    <script>
        // Pre-fill form from URL parameters (when coming from project details page)
        window.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('project_id');
            const milestoneId = urlParams.get('milestone_id');

            if (projectId) {
                const projectSelect = document.getElementById('project_id');
                projectSelect.value = projectId;

                // Trigger change event to load milestones
                const event = new Event('change');
                projectSelect.dispatchEvent(event);

                // If milestone_id is provided, select it after milestones are loaded
                if (milestoneId) {
                    // Wait a bit for milestones to load via AJAX
                    setTimeout(function() {
                        const milestoneSelect = document.getElementById('milestone_id');
                        milestoneSelect.value = milestoneId;
                    }, 500);
                }

                // Scroll to the form
                document.getElementById('fileDisputeForm').scrollIntoView({ behavior: 'smooth' });
            }
        });
    </script>
</body>
</html>
