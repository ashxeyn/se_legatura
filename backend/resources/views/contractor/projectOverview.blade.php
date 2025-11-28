<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $project->project_title }} - Project Overview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f0f2f5;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
        }

        .header {
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 24px;
            color: #1c1e21;
        }

        .nav-links {
            display: flex;
            gap: 15px;
        }

        .nav-links a {
            color: #1877f2;
            text-decoration: none;
            font-weight: 500;
        }

        .nav-links a:hover {
            text-decoration: underline;
        }

        .project-card {
            background: white;
            border-radius: 8px;
            padding: 25px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid #e4e6eb;
            margin-bottom: 20px;
        }

        .project-header {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e4e6eb;
        }

        .project-title {
            font-size: 28px;
            font-weight: 600;
            color: #1c1e21;
            margin-bottom: 10px;
        }

        .project-meta {
            font-size: 14px;
            color: #65676b;
            margin-bottom: 10px;
        }

        .project-status {
            padding: 6px 14px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            display: inline-block;
        }

        .status-open {
            background-color: #d1ecf1;
            color: #0c5460;
        }

        .project-description {
            font-size: 16px;
            color: #1c1e21;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .project-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 6px;
        }

        .project-detail {
            font-size: 14px;
        }

        .project-detail strong {
            color: #65676b;
            display: block;
            margin-bottom: 5px;
        }

        .project-files {
            margin-bottom: 20px;
        }

        .project-files h3 {
            font-size: 18px;
            color: #1c1e21;
            margin-bottom: 15px;
        }

        .file-list {
            list-style: none;
            padding: 0;
        }

        .file-item {
            padding: 10px;
            background: #f8f9fa;
            border-radius: 6px;
            margin-bottom: 8px;
        }

        .file-item a {
            color: #1877f2;
            text-decoration: none;
        }

        .file-item a:hover {
            text-decoration: underline;
        }

        .action-buttons {
            display: flex;
            gap: 15px;
            padding-top: 20px;
            border-top: 1px solid #e4e6eb;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: background-color 0.2s;
        }

        .btn-primary {
            background-color: #1877f2;
            color: white;
        }

        .btn-primary:hover {
            background-color: #166fe5;
        }

        .btn-secondary {
            background-color: #42b72a;
            color: white;
        }

        .btn-secondary:hover {
            background-color: #36a420;
        }

        .btn-danger {
            background-color: #dc3545;
            color: white;
        }

        .btn-danger:hover {
            background-color: #c82333;
        }

        .btn:disabled {
            background-color: #e4e6eb;
            color: #8a8d91;
            cursor: not-allowed;
        }

        .existing-bid-info {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .existing-bid-info h3 {
            color: #856404;
            margin-bottom: 10px;
        }

        .existing-bid-info p {
            color: #856404;
            margin-bottom: 5px;
        }

        .bid-status {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            display: inline-block;
            margin-left: 10px;
        }

        .status-submitted {
            background-color: #d1ecf1;
            color: #0c5460;
        }

        .status-under_review {
            background-color: #fff3cd;
            color: #856404;
        }

        .status-accepted {
            background-color: #d4edda;
            color: #155724;
        }

        .status-rejected {
            background-color: #f8d7da;
            color: #721c24;
        }

        .status-withdrawn {
            background-color: #e2e3e5;
            color: #383d41;
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.5);
        }

        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 30px;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e4e6eb;
        }

        .modal-header h2 {
            font-size: 24px;
            color: #1c1e21;
        }

        .close {
            color: #65676b;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            line-height: 20px;
        }

        .close:hover {
            color: #1c1e21;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #1c1e21;
            font-size: 14px;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #e4e6eb;
            border-radius: 6px;
            font-size: 14px;
            font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #1877f2;
        }

        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }

        .file-upload-area {
            border: 2px dashed #e4e6eb;
            border-radius: 6px;
            padding: 20px;
            text-align: center;
            background-color: #f8f9fa;
            margin-bottom: 15px;
        }

        .file-upload-area.dragover {
            border-color: #1877f2;
            background-color: #e7f3ff;
        }

        .file-list-upload {
            list-style: none;
            padding: 0;
            margin-top: 15px;
        }

        .file-list-upload li {
            padding: 8px;
            background: #f8f9fa;
            border-radius: 4px;
            margin-bottom: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .file-list-upload li .remove-file {
            color: #dc3545;
            cursor: pointer;
            font-weight: bold;
        }

        .existing-files {
            margin-top: 15px;
        }

        .existing-files h4 {
            font-size: 14px;
            color: #65676b;
            margin-bottom: 10px;
        }

        .existing-file-item {
            padding: 8px;
            background: #f8f9fa;
            border-radius: 4px;
            margin-bottom: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .existing-file-item a {
            color: #1877f2;
            text-decoration: none;
        }

        .existing-file-item a:hover {
            text-decoration: underline;
        }

        .existing-file-item .delete-file {
            color: #dc3545;
            cursor: pointer;
            font-weight: bold;
            font-size: 12px;
        }

        .modal-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #e4e6eb;
        }

        .error-message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
            display: none;
        }

        .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Project Overview</h1>
            <div class="nav-links">
                <a href="/dashboard">Back to Dashboard</a>
                <a href="/accounts/logout">Logout</a>
            </div>
        </div>

        <div class="project-card">
            <div class="project-header">
                <h1 class="project-title">{{ $project->project_title }}</h1>
                <div class="project-meta">
                    Posted by {{ $project->owner_name }} | {{ date('M d, Y', strtotime($project->created_at)) }}
                </div>
                <span class="project-status status-{{ $project->project_status }}">
                    {{ ucfirst(str_replace('_', ' ', $project->project_status)) }}
                </span>
            </div>

            <div class="project-description">
                <p>{{ $project->project_description }}</p>
            </div>

            <div class="project-details">
                <div class="project-detail">
                    <strong>Location:</strong>
                    {{ $project->project_location }}
                </div>
                <div class="project-detail">
                    <strong>Property Type:</strong>
                    {{ $project->property_type }}
                </div>
                <div class="project-detail">
                    <strong>Contractor Type:</strong>
                    {{ $project->type_name }}
                </div>
                <div class="project-detail">
                    <strong>Budget Range:</strong>
                    ₱{{ number_format($project->budget_range_min, 2) }} - ₱{{ number_format($project->budget_range_max, 2) }}
                </div>
                <div class="project-detail">
                    <strong>Lot Size:</strong>
                    {{ $project->lot_size }} sqm
                </div>
                <div class="project-detail">
                    <strong>Floor Area:</strong>
                    {{ $project->floor_area }} sqm
                </div>
                @if($project->bidding_deadline)
                    <div class="project-detail">
                        <strong>Bidding Deadline:</strong>
                        {{ date('M d, Y', strtotime($project->bidding_deadline)) }}
                    </div>
                @endif
            </div>

            @if(count($projectFiles) > 0)
                <div class="project-files">
                    <h3>Project Files</h3>
                    <ul class="file-list">
                        @foreach($projectFiles as $file)
                            <li class="file-item">
                                <a href="{{ asset('storage/' . $file->file_path) }}" target="_blank">
                                    {{ $file->file_type }} - {{ basename($file->file_path) }}
                                </a>
                            </li>
                        @endforeach
                    </ul>
                </div>
            @endif

            @if($existingBid)
                <div class="existing-bid-info">
                    <h3>Your Bid</h3>
                    <p><strong>Proposed Cost:</strong> ₱{{ number_format($existingBid->proposed_cost, 2) }}</p>
                    <p><strong>Estimated Timeline:</strong> {{ $existingBid->estimated_timeline }} months</p>
                    @if($existingBid->contractor_notes)
                        <p><strong>Notes:</strong> {{ $existingBid->contractor_notes }}</p>
                    @endif
                    <p><strong>Status:</strong> 
                        <span class="bid-status status-{{ $existingBid->bid_status }}">
                            {{ ucfirst(str_replace('_', ' ', $existingBid->bid_status)) }}
                        </span>
                    </p>
                    <p><strong>Submitted:</strong> {{ date('M d, Y h:i A', strtotime($existingBid->submitted_at)) }}</p>
                </div>
            @endif

            <div class="action-buttons">
                @if($canBid)
                    @if($existingBid && in_array($existingBid->bid_status, ['submitted', 'under_review']))
                        <button class="btn btn-primary" onclick="openBidModal('edit')">Edit Bid</button>
                        <button class="btn btn-danger" onclick="openCancelBidModal()">Cancel Bid</button>
                    @elseif($existingBid && $existingBid->bid_status === 'withdrawn')
                        <span class="btn btn-secondary" style="cursor: default;">Bid Cancelled</span>
                    @elseif(!$existingBid)
                        <button class="btn btn-secondary" onclick="openBidModal('create')">Apply for Bid</button>
                    @endif
                @else
                    <button class="btn" disabled>Bidding Deadline Has Passed</button>
                @endif
            </div>
        </div>
    </div>

    @include('modals.addEditBiddingModal')
    @include('modals.cancelBidModal')

    <script>
        // Pass existing bid data to JavaScript
        @if(isset($existingBid) && $existingBid)
            window.existingBid = {
                bid_id: {{ $existingBid->bid_id }},
                proposed_cost: {{ $existingBid->proposed_cost ?? 0 }},
                estimated_timeline: {{ $existingBid->estimated_timeline ?? 0 }},
                contractor_notes: {!! json_encode($existingBid->contractor_notes ?? '') !!}
            };
        @else
            window.existingBid = null;
        @endif
    </script>
    <script>
        let deletedFiles = [];
        let selectedFiles = [];

        function openBidModal(mode) {
            const modal = document.getElementById('bidModal');
            const modalTitle = document.getElementById('modalTitle');
            const formMethod = document.getElementById('form_method');
            const submitBtn = document.getElementById('submitBtn');
            const bidIdInput = document.getElementById('bid_id');

            if (mode === 'edit') {
                modalTitle.textContent = 'Edit Bid';
                formMethod.value = 'PUT';
                submitBtn.textContent = 'Update Bid';
                
                // Ensure bid_id is set and populate form fields with existing bid data
                if (window.existingBid && window.existingBid.bid_id) {
                    bidIdInput.value = window.existingBid.bid_id;
                    
                    const proposedCost = document.getElementById('proposed_cost');
                    const estimatedTimeline = document.getElementById('estimated_timeline');
                    const contractorNotes = document.getElementById('contractor_notes');
                    
                    // Set values if they exist and fields are empty
                    if (proposedCost && !proposedCost.value && window.existingBid.proposed_cost) {
                        proposedCost.value = window.existingBid.proposed_cost;
                    }
                    if (estimatedTimeline && !estimatedTimeline.value && window.existingBid.estimated_timeline) {
                        estimatedTimeline.value = window.existingBid.estimated_timeline;
                    }
                    if (contractorNotes && !contractorNotes.value.trim() && window.existingBid.contractor_notes) {
                        contractorNotes.value = window.existingBid.contractor_notes;
                    }
                }
            } else {
                modalTitle.textContent = 'Apply for Bid';
                formMethod.value = 'POST';
                submitBtn.textContent = 'Submit Bid';
                bidIdInput.value = '';
            }

            // Clear error/success messages
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('successMessage').style.display = 'none';
            
            modal.style.display = 'block';
        }

        function closeBidModal() {
            document.getElementById('bidModal').style.display = 'none';
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('successMessage').style.display = 'none';
            deletedFiles = [];
            selectedFiles = [];
            document.getElementById('fileList').innerHTML = '';
            document.getElementById('bid_files').value = '';
        }


        // File upload handling
        const fileInput = document.getElementById('bid_files');
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileList = document.getElementById('fileList');

        fileInput.addEventListener('change', function(e) {
            handleFiles(e.target.files);
        });

        fileUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });

        function handleFiles(files) {
            for (let file of files) {
                selectedFiles.push(file);
                const li = document.createElement('li');
                li.innerHTML = `
                    ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
                    <span class="remove-file" onclick="removeFile('${file.name}')">×</span>
                `;
                fileList.appendChild(li);
            }
        }

        function removeFile(fileName) {
            selectedFiles = selectedFiles.filter(f => f.name !== fileName);
            updateFileList();
        }

        function updateFileList() {
            fileList.innerHTML = '';
            selectedFiles.forEach(file => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
                    <span class="remove-file" onclick="removeFile('${file.name}')">×</span>
                `;
                fileList.appendChild(li);
            });
        }

        function deleteExistingFile(fileId) {
            if (confirm('Are you sure you want to delete this file?')) {
                deletedFiles.push(fileId);
                document.getElementById('file-' + fileId).style.display = 'none';
            }
        }

        // Form submission
        document.getElementById('bidForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData();
            const formMethod = document.getElementById('form_method').value;
            const projectId = document.querySelector('input[name="project_id"]').value;
            const bidId = document.getElementById('bid_id').value;

            // Get CSRF token from meta tag or form
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                             document.querySelector('input[name="_token"]')?.value;
            
            if (!csrfToken) {
                alert('CSRF token not found. Please refresh the page.');
                submitBtn.disabled = false;
                submitBtn.textContent = formMethod === 'PUT' ? 'Update Bid' : 'Submit Bid';
                return;
            }

            formData.append('_token', csrfToken);
            
            // Get form values
            const proposedCost = document.getElementById('proposed_cost').value.trim();
            const estimatedTimeline = document.getElementById('estimated_timeline').value.trim();
            const contractorNotes = document.getElementById('contractor_notes').value.trim();

            // Validate required fields
            if (!proposedCost || !estimatedTimeline) {
                document.getElementById('errorMessage').textContent = 'Please fill in all required fields.';
                document.getElementById('errorMessage').style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = formMethod === 'PUT' ? 'Update Bid' : 'Submit Bid';
                return;
            }

            formData.append('proposed_cost', proposedCost);
            formData.append('estimated_timeline', estimatedTimeline);
            formData.append('contractor_notes', contractorNotes);

            // Add files
            selectedFiles.forEach(file => {
                formData.append('bid_files[]', file);
            });

            // Add deleted files
            deletedFiles.forEach(fileId => {
                formData.append('delete_files[]', fileId);
            });

            if (formMethod === 'PUT') {
                if (!bidId) {
                    document.getElementById('errorMessage').textContent = 'Bid ID is required for update.';
                    document.getElementById('errorMessage').style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Update Bid';
                    return;
                }
                formData.append('bid_id', bidId);
                formData.append('_method', 'PUT');
            } else {
                formData.append('project_id', projectId);
            }

            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            try {
                let url = '/contractor/bids';
                if (formMethod === 'PUT') {
                    url = '/contractor/bids/' + bidId;
                }

                const response = await fetch(url, {
                    method: formMethod === 'PUT' ? 'POST' : 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    document.getElementById('successMessage').textContent = data.message;
                    document.getElementById('successMessage').style.display = 'block';
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    document.getElementById('errorMessage').textContent = data.message;
                    document.getElementById('errorMessage').style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = formMethod === 'PUT' ? 'Update Bid' : 'Submit Bid';
                }
            } catch (error) {
                document.getElementById('errorMessage').textContent = 'An error occurred. Please try again.';
                document.getElementById('errorMessage').style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = formMethod === 'PUT' ? 'Update Bid' : 'Submit Bid';
            }
        });

        // Close modals when clicking outside
        window.onclick = function(event) {
            const bidModal = document.getElementById('bidModal');
            const cancelBidModal = document.getElementById('cancelBidModal');
            if (event.target == bidModal) {
                closeBidModal();
            }
            if (event.target == cancelBidModal && window.CancelBidModal) {
                window.CancelBidModal.close();
            }
        }
    </script>
    <script src="{{ asset('js/contractor.js') }}"></script>
</body>
</html>

