<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Create Project Post - Legatura</title>
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
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 20px;
        }

        .header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e4e6eb;
        }

        .back-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            margin-right: 15px;
            color: #1877f2;
            padding: 5px;
        }

        .back-btn:hover {
            background-color: #f0f2f5;
            border-radius: 50%;
        }

        .header h1 {
            font-size: 20px;
            font-weight: 600;
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
        }

        .form-group label .required {
            color: #e41e3f;
        }

        .form-group input[type="text"],
        .form-group input[type="number"],
        .form-group input[type="date"],
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccd0d5;
            border-radius: 6px;
            font-size: 15px;
            font-family: inherit;
        }

        .form-group textarea {
            min-height: 100px;
            resize: vertical;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #1877f2;
        }

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
            font-size: 14px;
        }

        .evidence-file-input:focus {
            outline: none;
            border-color: #1877f2;
            box-shadow: 0 0 5px rgba(24, 119, 242, 0.3);
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

        .add-more-files-btn {
            background-color: #1877f2;
            color: white;
            border: 1px solid #1877f2;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 5px;
            transition: all 0.3s ease;
            font-size: 14px;
            display: none;
        }

        .add-more-files-btn:hover {
            background-color: #166fe5;
            border-color: #166fe5;
            transform: translateY(-1px);
        }

        .add-more-files-btn.visible {
            display: inline-block;
        }

        .submit-btn {
            width: 100%;
            padding: 12px;
            background-color: #1877f2;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 20px;
        }

        .submit-btn:hover {
            background-color: #166fe5;
        }

        .submit-btn:disabled {
            background-color: #ccd0d5;
            cursor: not-allowed;
        }

        .error-message {
            color: #e41e3f;
            font-size: 14px;
            margin-top: 5px;
        }

        .alert {
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
        }

        .alert-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .alert-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <button class="back-btn" onclick="window.location.href='/dashboard'">←</button>
            <h1>Create Project Post</h1>
        </div>

        @if(session('success'))
            <div class="alert alert-success">{{ session('success') }}</div>
        @endif

        @if(session('error'))
            <div class="alert alert-error">{{ session('error') }}</div>
        @endif

        <form id="projectForm" method="POST" action="/owner/projects" enctype="multipart/form-data">
            @csrf

            <div class="form-group">
                <label>Project Title <span class="required">*</span></label>
                <input type="text" name="project_title" value="{{ old('project_title') }}" required maxlength="200">
                @error('project_title')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Project Description <span class="required">*</span></label>
                <textarea name="project_description" required>{{ old('project_description') }}</textarea>
                @error('project_description')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Project Location <span class="required">*</span></label>
                <input type="text" name="project_location" value="{{ old('project_location') }}" required>
                @error('project_location')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Budget Range (Min) <span class="required">*</span></label>
                <input type="number" name="budget_range_min" step="0.01" value="{{ old('budget_range_min') }}" required min="0">
                @error('budget_range_min')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Budget Range (Max) <span class="required">*</span></label>
                <input type="number" name="budget_range_max" step="0.01" value="{{ old('budget_range_max') }}" required min="0">
                @error('budget_range_max')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Lot Size (sqm) <span class="required">*</span></label>
                <input type="number" name="lot_size" value="{{ old('lot_size') }}" required min="1">
                @error('lot_size')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Floor Area (sqm) <span class="required">*</span></label>
                <input type="number" name="floor_area" value="{{ old('floor_area') }}" required min="1">
                @error('floor_area')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Property Type <span class="required">*</span></label>
                <select name="property_type" required>
                    <option value="">Select Property Type</option>
                    <option value="Residential" {{ old('property_type') == 'Residential' ? 'selected' : '' }}>Residential</option>
                    <option value="Commercial" {{ old('property_type') == 'Commercial' ? 'selected' : '' }}>Commercial</option>
                    <option value="Industrial" {{ old('property_type') == 'Industrial' ? 'selected' : '' }}>Industrial</option>
                    <option value="Agricultural" {{ old('property_type') == 'Agricultural' ? 'selected' : '' }}>Agricultural</option>
                </select>
                @error('property_type')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Contractor Type Required <span class="required">*</span></label>
                <select name="type_id" required>
                    <option value="">Select Contractor Type</option>
                    @foreach($contractorTypes as $type)
                        <option value="{{ $type->type_id }}" {{ old('type_id') == $type->type_id ? 'selected' : '' }}>
                            {{ $type->type_name }}
                        </option>
                    @endforeach
                </select>
                @error('type_id')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Bidding Deadline <span class="required">*</span></label>
                <input type="date" name="bidding_deadline" value="{{ old('bidding_deadline') }}" required>
                @error('bidding_deadline')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Building Permit <span class="required">*</span></label>
                <div id="building-permit-upload-container">
                    <div class="file-input-group">
                        <input type="file" id="building_permit" name="building_permit" accept=".jpg,.jpeg,.png" class="evidence-file-input" required>
                        <button type="button" class="remove-file-btn" style="display:none;" onclick="removeFileInput(this, 'building-permit-upload-container')">Remove</button>
                    </div>
                </div>
                <small>Accepted formats: JPG, JPEG, PNG (Max 10MB). Photo only.</small>
                @error('building_permit')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Title of the Land <span class="required">*</span></label>
                <div id="title-of-land-upload-container">
                    <div class="file-input-group">
                        <input type="file" id="title_of_land" name="title_of_land" accept=".jpg,.jpeg,.png" class="evidence-file-input" required>
                        <button type="button" class="remove-file-btn" style="display:none;" onclick="removeFileInput(this, 'title-of-land-upload-container')">Remove</button>
                    </div>
                </div>
                <small>Accepted formats: JPG, JPEG, PNG (Max 10MB). Photo only.</small>
                @error('title_of_land')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Blueprint (Optional)</label>
                <div id="blueprint-upload-container">
                    <div class="file-input-group">
                        <input type="file" id="blueprint" name="blueprint[]" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" class="evidence-file-input">
                        <button type="button" class="remove-file-btn" style="display:none;" onclick="removeFileInput(this, 'blueprint-upload-container')">Remove</button>
                    </div>
                </div>
                <button type="button" class="add-more-files-btn" id="blueprint-add-more" onclick="addMoreFiles('blueprint-upload-container', 'blueprint')">Add More Files</button>
                <small>Accepted formats: JPG, JPEG, PNG, PDF, DOC, DOCX (Max 10MB each, up to 10 files)<br>
                <em>Click "Add More Files" to select additional files one by one.</em></small>
                @error('blueprint')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Desired Design (Optional)</label>
                <div id="desired-design-upload-container">
                    <div class="file-input-group">
                        <input type="file" id="desired_design" name="desired_design[]" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" class="evidence-file-input">
                        <button type="button" class="remove-file-btn" style="display:none;" onclick="removeFileInput(this, 'desired-design-upload-container')">Remove</button>
                    </div>
                </div>
                <button type="button" class="add-more-files-btn" id="desired-design-add-more" onclick="addMoreFiles('desired-design-upload-container', 'desired_design')">Add More Files</button>
                <small>Accepted formats: JPG, JPEG, PNG, PDF, DOC, DOCX (Max 10MB each, up to 10 files)<br>
                <em>Click "Add More Files" to select additional files one by one.</em></small>
                @error('desired_design')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Others (Optional - Multiple Files)</label>
                <div id="others-upload-container">
                    <div class="file-input-group">
                        <input type="file" id="others" name="others[]" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" class="evidence-file-input">
                        <button type="button" class="remove-file-btn" style="display:none;" onclick="removeFileInput(this, 'others-upload-container')">Remove</button>
                    </div>
                </div>
                <button type="button" class="add-more-files-btn" id="others-add-more" onclick="addMoreFiles('others-upload-container', 'others')">Add More Files</button>
                <small>Accepted formats: JPG, JPEG, PNG, PDF, DOC, DOCX (Max 10MB each, up to 10 files)<br>
                <em>Click "Add More Files" to select additional files one by one.</em></small>
                @error('others')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <button type="submit" class="submit-btn">Post Project</button>
        </form>
    </div>

    <script src="{{ asset('js/owner.js') }}"></script>
</body>
</html>

