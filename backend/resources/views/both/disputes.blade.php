<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Disputes - Legatura</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('css/common.css') }}">
    <style>
        .file-input-group {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .evidence-file-input {
            flex: 1;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: #f8f9fa;
        }

        .evidence-file-input:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
        }

        .evidence-file-input.has-file {
            display: none;
        }

        .file-name-display {
            flex: 1;
            padding: 8px;
            border: 1px solid #28a745;
            border-radius: 4px;
            background-color: #d4edda;
            color: #155724;
            font-size: 14px;
            display: none;
        }

        .file-name-display.visible {
            display: block;
        }

        .remove-file-btn {
            background-color: #dc3545;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }

        .remove-file-btn:hover {
            background-color: #c82333;
        }

        #add-more-files {
            background-color: #007bff;
            color: white;
            border: 1px solid #007bff;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 5px;
            transition: all 0.3s ease;
            font-size: 14px;
        }

        #add-more-files:hover {
            background-color: #0056b3;
            border-color: #0056b3;
            transform: translateY(-1px);
        }        .evidence-files {
            list-style-type: none;
            padding-left: 20px;
        }

        .evidence-files li {
            margin-bottom: 5px;
        }

        .evidence-files a {
            color: #007bff;
            text-decoration: none;
        }

        .evidence-files a:hover {
            text-decoration: underline;
        }

        .error-messages, .success-messages {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 500;
            display: none;
        }

        .error-messages {
            background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
            color: #721c24;
            border: 2px solid #f5c6cb;
        }

        .success-messages {
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            color: #155724;
            border: 2px solid #c3e6cb;
        }

        .error-messages ul {
            margin: 0;
            padding-left: 20px;
        }

        .error-messages li {
            margin-bottom: 5px;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background-color: #007bff;
            color: white;
        }

        .btn-primary:hover {
            background-color: #0056b3;
            transform: translateY(-1px);
        }

        .btn-danger {
            background-color: #dc3545;
            color: white;
        }

        .btn-danger:hover {
            background-color: #c82333;
            transform: translateY(-1px);
        }

        .btn-success {
            background-color: #28a745;
            color: white;
        }

        .btn-success:hover {
            background-color: #218838;
            transform: translateY(-1px);
        }

    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Disputes</h1>
            <div class="nav-links">
                <a href="/dashboard">Dashboard</a>
                <a href="/both/projects">My Projects</a>
            </div>
        </div>
        <div id="errorMessages" class="error-message" style="display: none;"></div>
        <div id="successMessages" class="success-message" style="display: none;"></div>

        <div class="card">
            <h2 style="font-size: 20px; margin-bottom: 15px; color: #1c1e21;">File New Dispute</h2>
            <p style="margin-bottom: 20px; color: #65676b;">File a dispute for project issues or view existing disputes.</p>

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
                <label for="milestone_id">Milestone *</label>
                <select id="milestone_id" name="milestone_id" required>
                    <option value="">Select Milestone</option>
                </select>
            </div>

            <div class="form-group">
                <label for="milestone_item_id">Milestone Item *</label>
                <select id="milestone_item_id" name="milestone_item_id" required>
                    <option value="">Select Milestone Item</option>
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
                <label for="evidence_files">Evidence Files (Optional)</label>
                <div id="file-upload-container">
                    <div class="file-input-group">
                        <input type="file" name="evidence_files[]" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" class="evidence-file-input" onchange="handleFileSelectionWrapper(this, 'file-upload-container', 'add-more-files')">
                        <button type="button" class="remove-file-btn" onclick="removeFileInputWrapper(this, 'file-upload-container', 'add-more-files')" style="display:none;">Remove</button>
                    </div>
                </div>
                <button type="button" id="add-more-files" onclick="addMoreFilesWrapper('file-upload-container', 'add-more-files')" style="display:none;">Add More Files</button>
                <small>Accepted formats: JPG, JPEG, PNG, PDF, DOC, DOCX (Max 5MB each, up to 10 files)<br>
                <em>Click "Add More Files" to select additional evidence files one by one.</em></small>
            </div>

            <button type="submit">Submit Dispute</button>
            <button type="button" onclick="resetForm()">Reset</button>
        </form>
        </div>

        <div class="card">
            <h2 style="font-size: 20px; margin-bottom: 15px; color: #1c1e21;">My Disputes</h2>
            <div id="disputeListContainer">
                @if(count($disputes) > 0)
                    @foreach($disputes as $dispute)
                        <div class="dispute-item" id="dispute-{{ $dispute->dispute_id }}">
                            <div class="dispute-header">
                                <strong>{{ $dispute->project_title }}</strong>
                                <span class="dispute-status status-{{ $dispute->dispute_status }}">
                                    {{ ucfirst(str_replace('_', ' ', $dispute->dispute_status)) }}
                                </span>
                            </div>
                            <p><strong>Type:</strong> <span class="dispute-type-text">{{ $dispute->dispute_type }}</span></p>
                            @if($dispute->milestone_name)
                                <p><strong>Milestone:</strong> {{ $dispute->milestone_name }}</p>
                            @endif
                            @if($dispute->milestone_item_title)
                                <p><strong>Milestone Item:</strong> {{ $dispute->milestone_item_title }}</p>
                            @endif
                            <p><strong>Filed by:</strong> {{ $dispute->raised_by_username }}</p>
                            <p><strong>Against:</strong> {{ $dispute->against_username }}</p>
                            <p><strong>Description:</strong> <span class="dispute-desc-text">{{ $dispute->dispute_desc }}</span></p>
                            @if(isset($dispute->files) && count($dispute->files) > 0)
                                <p><strong>Evidence Files:</strong></p>
                                <ul class="evidence-files">
                                    @foreach($dispute->files as $file)
                                        <li>
                                            <a href="{{ asset('storage/' . $file->storage_path) }}" target="_blank">
                                                {{ $file->original_name }}
                                            </a>
                                            <small>({{ number_format($file->size / 1024, 1) }} KB)</small>
                                        </li>
                                    @endforeach
                                </ul>
                            @endif
                            <p><small>Filed on: {{ date('M d, Y h:i A', strtotime($dispute->dispute_created_at)) }}</small></p>
                            @if($dispute->admin_response)
                                <p><strong>Admin Response:</strong> {{ $dispute->admin_response }}</p>
                            @endif

                            @if($dispute->raised_by_user_id == Session::get('user')->user_id)
                                <div class="dispute-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                                    @if($dispute->dispute_status == 'open')
                                        <button class="btn btn-primary" onclick='openDisputeModal("edit", { dispute_id: {{ $dispute->dispute_id }}, dispute_type: "{{ $dispute->dispute_type }}", dispute_desc: `{{ addslashes($dispute->dispute_desc) }}`, files: {{ json_encode($dispute->files ?? []) }} })'>
                                            Edit
                                        </button>
                                    @endif

                                    @if(in_array($dispute->dispute_status, ['open', 'under_review']))
                                        <button class="btn btn-danger" onclick="cancelDispute({{ $dispute->dispute_id }})">
                                            Cancel
                                        </button>
                                    @endif
                                </div>
                            @endif
                        </div>
                    @endforeach
                @else
                    <div class="empty-state">
                        <h3>No Disputes Found</h3>
                        <p>You haven't filed any disputes yet.</p>
                    </div>
                @endif
            </div>
        </div>
    </div>

    @include('modals.addEditDisputeModal')
    @include('modals.cancelDisputeModal')

    <script src="{{ asset('js/modal.js') }}"></script>
    <script src="{{ asset('js/both.js') }}"></script>
    <script src="{{ asset('js/contractor.js') }}"></script>
</body>
</html>
