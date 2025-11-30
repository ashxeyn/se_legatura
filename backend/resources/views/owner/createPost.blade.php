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
                <label>Barangay <span class="required">*</span></label>
                <select name="barangay" id="project_barangay" required disabled>
                    <option value="">Loading barangays...</option>
                </select>
                @error('barangay')
                    <div class="error-message">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>Street / Barangay Details <span class="required">*</span></label>
                <input type="text" name="street_address" id="street_address" value="{{ old('street_address') }}" required maxlength="255" placeholder="Street, Purok, House No. etc">
                @error('street_address')
                    <div class="error-message">{{ $message }}</div>
                @enderror
                <small style="display:block; margin-top:6px; color:#666;">City and Province are fixed to <strong>Zamboanga City</strong>, <strong>Zamboanga del Sur</strong>.</small>
            </div>

            {{-- Hidden composed location (will be set by JS before submit) --}}
            <input type="hidden" name="project_location" id="project_location_hidden" value="{{ old('project_location') }}">
            {{-- PSGC codes for structured backend handling --}}
            <input type="hidden" name="project_city_code" id="project_city_code_hidden" value="{{ old('project_city_code') }}">
            <input type="hidden" name="project_province_code" id="project_province_code_hidden" value="{{ old('project_province_code') }}">

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
                <select name="type_id" id="project_type_id" required>
                    <option value="">Select Contractor Type</option>
                    {{-- Render all non-"Others" options first, then place Others last --}}
                    @php
                        $othersOption = null;
                    @endphp
                    @foreach($contractorTypes as $type)
                        @if(strtolower(trim($type->type_name)) === 'others')
                            @php $othersOption = $type; continue; @endphp
                        @endif
                        <option value="{{ $type->type_id }}" data-name="{{ $type->type_name }}" {{ old('type_id') == $type->type_id ? 'selected' : '' }}>
                            {{ $type->type_name }}
                        </option>
                    @endforeach
                    @if($othersOption)
                        <option value="{{ $othersOption->type_id }}" data-name="{{ $othersOption->type_name }}" {{ old('type_id') == $othersOption->type_id ? 'selected' : '' }}>
                            {{ $othersOption->type_name }}
                        </option>
                    @endif
                </select>
                @error('type_id')
                    <div class="error-message">{{ $message }}</div>
                @enderror

                <div id="other_contractor_type_container" style="display: {{ old('if_others_ctype') ? 'block' : 'none' }}; margin-top:10px;">
                    <label for="if_others_ctype">If Others, specify contractor type <span class="required">*</span></label>
                    <input type="text" name="if_others_ctype" id="if_others_ctype" value="{{ old('if_others_ctype') }}" maxlength="200" placeholder="Specify contractor type">
                    @error('if_others_ctype')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>
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

    <script>
        // File upload handling - consistent with progress/payment modals
        function handleFileSelection(input, containerId) {
            if (input.files && input.files.length > 0) {
                const file = input.files[0];
                const container = document.getElementById(containerId);
                const fileGroup = input.closest('.file-input-group');
                const removeBtn = fileGroup.querySelector('.remove-file-btn');

                // Hide input, show file name
                input.classList.add('has-file');

                // Create file name display
                let fileNameDisplay = fileGroup.querySelector('.file-name-display');
                if (!fileNameDisplay) {
                    fileNameDisplay = document.createElement('div');
                    fileNameDisplay.className = 'file-name-display visible';
                    fileGroup.insertBefore(fileNameDisplay, removeBtn);
                }
                fileNameDisplay.textContent = '📄 ' + file.name;
                fileNameDisplay.classList.add('visible');

                // Show remove button
                if (removeBtn) removeBtn.style.display = 'inline-block';

                // Show "Add More Files" button if not required field
                if (!input.hasAttribute('required')) {
                    const addMoreBtn = container.parentElement.querySelector('.add-more-files-btn');
                    if (addMoreBtn) addMoreBtn.classList.add('visible');
                }
            }
        }

        function removeFileInput(btn, containerId) {
            const fileGroup = btn.closest('.file-input-group');
            const input = fileGroup.querySelector('.evidence-file-input');
            const fileNameDisplay = fileGroup.querySelector('.file-name-display');

            // Reset input
            input.value = '';
            input.classList.remove('has-file');
            if (fileNameDisplay) {
                fileNameDisplay.remove();
            }
            btn.style.display = 'none';

            // Hide "Add More Files" button if no files
            const container = document.getElementById(containerId);
            const fileGroups = container.querySelectorAll('.file-input-group');
            const hasFiles = Array.from(fileGroups).some(group => {
                const fileInput = group.querySelector('.evidence-file-input');
                return fileInput && fileInput.files && fileInput.files.length > 0;
            });

            if (!hasFiles) {
                const addMoreBtn = container.parentElement.querySelector('.add-more-files-btn');
                if (addMoreBtn) addMoreBtn.classList.remove('visible');
            }
        }

        function addMoreFiles(containerId, fieldName) {
            const container = document.getElementById(containerId);
            const fileGroups = container.querySelectorAll('.file-input-group');

            if (fileGroups.length >= 10) {
                alert('Maximum of 10 files allowed');
                return;
            }

            const existingInput = container.querySelector('.evidence-file-input');
            const acceptAttr = existingInput ? existingInput.getAttribute('accept') : '';
            const isMultiple = fieldName === 'others';

            const newFileGroup = document.createElement('div');
            newFileGroup.className = 'file-input-group';

            const newInput = document.createElement('input');
            newInput.type = 'file';
            newInput.className = 'evidence-file-input';
            newInput.accept = acceptAttr;
            if (isMultiple) {
                newInput.name = 'others[]';
            } else {
                newInput.name = fieldName;
            }
            newInput.addEventListener('change', function() {
                handleFileSelection(this, containerId);
            });

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-file-btn';
            removeBtn.textContent = 'Remove';
            removeBtn.onclick = function() {
                removeFileInput(this, containerId);
                updateRemoveButtons(containerId);
            };

            newFileGroup.appendChild(newInput);
            newFileGroup.appendChild(removeBtn);
            container.appendChild(newFileGroup);

            updateRemoveButtons(containerId);
        }

        function updateRemoveButtons(containerId) {
            const container = document.getElementById(containerId);
            const fileGroups = container.querySelectorAll('.file-input-group');

            fileGroups.forEach((group, index) => {
                const removeBtn = group.querySelector('.remove-file-btn');
                const fileInput = group.querySelector('.evidence-file-input');

                if (removeBtn && fileInput) {
                    const hasFile = fileInput.files && fileInput.files.length > 0;
                    const shouldShow = fileGroups.length > 1 || hasFile;
                    removeBtn.style.display = shouldShow ? 'inline-block' : 'none';
                }
            });
        }

        // Initialize file inputs
        document.addEventListener('DOMContentLoaded', function() {
            const fileInputs = document.querySelectorAll('.evidence-file-input');
            fileInputs.forEach(input => {
                const containerId = input.closest('[id$="-upload-container"]')?.id;
                if (containerId) {
                    input.addEventListener('change', function() {
                        handleFileSelection(this, containerId);
                        updateRemoveButtons(containerId);
                    });
                }
            });
        });

        // Form validation
        document.getElementById('projectForm').addEventListener('submit', function(e) {
            // Compose hidden project_location from barangay (PSGC select) + street + fixed city/province
            const barangayEl = document.getElementById('project_barangay');
            const streetEl = document.getElementById('street_address');
            const hiddenLocation = document.getElementById('project_location_hidden');
            if (hiddenLocation) {
                // prefer the human-readable barangay name stored in data-name attribute
                const barangayVal = barangayEl && barangayEl.selectedIndex > -1
                    ? (barangayEl.options[barangayEl.selectedIndex].getAttribute('data-name') || barangayEl.value).trim()
                    : '';
                const streetVal = streetEl ? streetEl.value.trim() : '';
                const city = 'Zamboanga City';
                const province = 'Zamboanga del Sur';
                let composed = '';
                if (barangayVal) composed += barangayVal + ', ';
                if (streetVal) composed += streetVal + ', ';
                composed += city + ', ' + province;
                hiddenLocation.value = composed;
            }
            const budgetMin = parseFloat(document.querySelector('input[name="budget_range_min"]').value);
            const budgetMax = parseFloat(document.querySelector('input[name="budget_range_max"]').value);

            if (budgetMax < budgetMin) {
                e.preventDefault();
                alert('Maximum budget must be greater than or equal to minimum budget.');
                return false;
            }
        });

            // Contractor Type "Others" handling
            (function() {
                const typeSelect = document.getElementById('project_type_id');
                const otherContainer = document.getElementById('other_contractor_type_container');
                const otherInput = document.getElementById('if_others_ctype');

                if (!typeSelect) return;

                function toggleOther() {
                    const selected = typeSelect.options[typeSelect.selectedIndex];
                    const name = (selected && selected.getAttribute('data-name')) ? selected.getAttribute('data-name').toLowerCase() : '';
                    if (name === 'others') {
                        otherContainer.style.display = 'block';
                        if (otherInput) otherInput.setAttribute('required', 'required');
                    } else {
                        otherContainer.style.display = 'none';
                        if (otherInput) {
                            otherInput.removeAttribute('required');
                        }
                    }
                }

                typeSelect.addEventListener('change', toggleOther);
                // initial state
                toggleOther();
            })();

        // PSGC: populate barangays for Zamboanga City (fixed province/province)
        document.addEventListener('DOMContentLoaded', function() {
            const barangaySelect = document.getElementById('project_barangay');
            if (!barangaySelect) return;

            // Keep a copy of old value (previous user input - name)
            const oldBarangay = {!! json_encode(old('barangay')) !!};

            // 1) fetch provinces to find Zamboanga del Sur code (be tolerant with naming)
            fetch('/api/psgc/provinces')
                .then(r => {
                    if (!r.ok) throw new Error('Failed to load provinces: ' + r.status + ' ' + r.statusText);
                    return r.json();
                })
                .then(provinces => {
                    let prov = provinces.find(p => p.name && p.name.toLowerCase().includes('zamboanga del sur'));
                    if (!prov) {
                        // fallback: any province containing 'zamboanga' and 'sur'
                        prov = provinces.find(p => {
                            const n = (p.name || '').toLowerCase();
                            return n.includes('zamboanga') && n.includes('sur');
                        });
                    }
                    if (!prov) {
                        // last resort: any province with 'zamboanga' in name
                        prov = provinces.find(p => (p.name || '').toLowerCase().includes('zamboanga'));
                    }
                    if (!prov) throw new Error('Province not found in PSGC response');
                    // populate hidden province code for backend
                    const provInput = document.getElementById('project_province_code_hidden');
                    if (provInput) provInput.value = prov.code;
                    return fetch('/api/psgc/provinces/' + prov.code + '/cities');
                })
                .then(r => {
                    if (!r.ok) throw new Error('Failed to load cities: ' + r.status + ' ' + r.statusText);
                    return r.json();
                })
                .then(cities => {
                    // find Zamboanga City in the province's cities (tolerant)
                    let city = cities.find(c => c.name && c.name.toLowerCase().includes('zamboanga city'));
                    if (!city) {
                        city = cities.find(c => (c.name || '').toLowerCase().includes('zamboanga'));
                    }
                    if (!city) throw new Error('City not found in PSGC response');
                    // populate hidden city code for backend
                    const cityInput = document.getElementById('project_city_code_hidden');
                    if (cityInput) cityInput.value = city.code;
                    return fetch('/api/psgc/cities/' + city.code + '/barangays');
                })
                .then(r => r.json())
                .then(barangays => {
                    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
                    barangays.forEach(function(b) {
                        const option = document.createElement('option');
                        option.value = b.code;
                        option.setAttribute('data-name', b.name);
                        option.textContent = b.name;
                        // preserve old value if it was a barangay name
                        if (oldBarangay && oldBarangay === b.name) {
                            option.selected = true;
                        }
                        barangaySelect.appendChild(option);
                    });
                    barangaySelect.disabled = false;
                })
                .catch(err => {
                    const msg = err && err.message ? err.message : 'Unknown error';
                    barangaySelect.innerHTML = '<option value="">Error loading barangays: ' + msg + '</option>';
                    barangaySelect.disabled = false;
                    console.error('Failed to load PSGC barangays for Zamboanga City:', err);
                });
        });
    </script>
</body>
</html>

