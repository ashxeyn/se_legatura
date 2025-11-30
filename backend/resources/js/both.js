function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

function showErrors(errors) {
    const errorDiv = document.getElementById('errorMessages');
    const successDiv = document.getElementById('successMessages');

    if (!errorDiv) {
        console.error('Error div not found');
        return;
    }

    if (successDiv) {
        successDiv.style.display = 'none';
    }

    errorDiv.innerHTML = '';

    if (typeof errors === 'object') {
        let errorHtml = '<ul>';
        for (let field in errors) {
            if (Array.isArray(errors[field])) {
                errors[field].forEach(error => {
                    errorHtml += `<li>${error}</li>`;
                });
            } else {
                errorHtml += `<li>${errors[field]}</li>`;
            }
        }
        errorHtml += '</ul>';
        errorDiv.innerHTML = errorHtml;
    } else {
        errorDiv.innerHTML = errors;
    }

    errorDiv.style.display = 'block';
    window.scrollTo(0, 0);
}

function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessages');
    const successDiv = document.getElementById('successMessages');

    if (!successDiv) {
        console.error('Success div not found');
        return;
    }

    if (errorDiv) {
        errorDiv.style.display = 'none';
    }

    successDiv.innerHTML = message;
    successDiv.style.display = 'block';
    window.scrollTo(0, 0);
}

function approveProgress(fileId) {
    console.log('Approve progress clicked for file:', fileId);
    alert('Progress approved! (This will be implemented with AJAX later)');
}

function rejectProgress(fileId, itemId, projectId, milestoneId) {
    console.log('Reject progress clicked:', { fileId, itemId, projectId, milestoneId });
    const url = '/both/disputes?project_id=' + projectId + '&milestone_id=' + milestoneId + '&milestone_item_id=' + itemId;
    console.log('Redirecting to:', url);
    window.location.href = url;
}

function disputePayment(paymentId, itemId, projectId, milestoneId) {
    console.log('Dispute payment clicked:', { paymentId, itemId, projectId, milestoneId });
    const url = '/both/disputes?project_id=' + projectId + '&milestone_id=' + milestoneId + '&milestone_item_id=' + itemId;
    console.log('Redirecting to:', url);
    window.location.href = url;
}

function initializeProjectDetails() {
    console.log('Project Details page loaded');
    const disputeButtons = document.querySelectorAll('.btn-danger');
    console.log('Found', disputeButtons.length, 'dispute buttons');
}

if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProjectDetails);
    } else {
        initializeProjectDetails();
    }
}

function validateDisputeDescription(description) {
    if (!description || description.trim() === '') {
        return 'Dispute description is required.';
    }
    if (description.length > 2000) {
        return 'Dispute description cannot exceed 2000 characters.';
    }
    return 'valid';
}

function validateDisputeType(disputeType) {
    const validTypes = ['Payment', 'Delay', 'Quality', 'Others'];
    if (!disputeType || disputeType.trim() === '') {
        return 'Dispute type is required.';
    }
    if (!validTypes.includes(disputeType)) {
        return 'Invalid dispute type selected.';
    }
    return 'valid';
}

function validateEvidenceFile(file) {
    if (!file) {
        return 'valid';
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; //

    if (!allowedTypes.includes(file.type)) {
        return 'Evidence file must be JPG, JPEG, PNG, or PDF format.';
    }

    if (file.size > maxSize) {
        return 'Evidence file must not exceed 5MB.';
    }

    return 'valid';
}

function resetForm() {
    const fileDisputeForm = document.getElementById('fileDisputeForm');
    if (fileDisputeForm) {
        fileDisputeForm.reset();
        document.getElementById('charCount').textContent = '0 / 2000 characters';

        const fileContainer = document.getElementById('file-upload-container');
        const addMoreBtn = document.getElementById('add-more-files');
        if (fileContainer && addMoreBtn) {
            fileContainer.innerHTML = `
                <div class="file-input-group">
                    <input type="file" name="evidence_files[]" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" class="evidence-file-input" onchange="handleFileSelectionWrapper(this, 'file-upload-container', 'add-more-files')">
                    <button type="button" class="remove-file-btn" onclick="removeFileInputWrapper(this, 'file-upload-container', 'add-more-files')" style="display:none;">Remove</button>
                </div>
            `;
            addMoreBtn.style.display = 'none';
        }

        const errorDiv = document.getElementById('errorMessages');
        const successDiv = document.getElementById('successMessages');
        if (errorDiv) errorDiv.style.display = 'none';
        if (successDiv) successDiv.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const disputeDescTextarea = document.getElementById('dispute_desc');
    const charCount = document.getElementById('charCount');

    if (disputeDescTextarea && charCount) {
        disputeDescTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            charCount.textContent = `${currentLength} / 2000 characters`;

            if (currentLength > 2000) {
                charCount.style.color = 'red';
            } else {
                charCount.style.color = 'black';
            }
        });
    }

    // Load milestones when project is selected
    const projectSelect = document.getElementById('project_id');
    const milestoneSelect = document.getElementById('milestone_id');
    const milestoneItemSelect = document.getElementById('milestone_item_id');
    const againstUserIdInput = document.getElementById('against_user_id');

    if (projectSelect) {
        projectSelect.addEventListener('change', function() {
            const projectId = this.value;
            const selectedOption = this.options[this.selectedIndex];
            const contractorId = selectedOption.getAttribute('data-contractor-id');
            const ownerId = selectedOption.getAttribute('data-owner-id');

            // Determine against_user_id based on current user
            // This will be set by checking session on server side
            // For now, we'll handle this in the controller

            if (projectId) {
                loadMilestones(projectId);
            } else {
                if (milestoneSelect) {
                    milestoneSelect.innerHTML = '<option value="">Select Milestone</option>';
                }
                if (milestoneItemSelect) {
                    milestoneItemSelect.innerHTML = '<option value="">Select Milestone Item</option>';
                }
            }
        });
    }

    if (milestoneSelect) {
        milestoneSelect.addEventListener('change', function() {
            const milestoneId = this.value;
            if (milestoneItemSelect) {
                loadMilestoneItems(milestoneId);
            }
        });
    }

    const fileDisputeForm = document.getElementById('fileDisputeForm');
    if (fileDisputeForm) {
        fileDisputeForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const projectId = document.getElementById('project_id').value;
            const disputeType = document.getElementById('dispute_type').value;
            const disputeDesc = document.getElementById('dispute_desc').value;
            const milestoneId = document.getElementById('milestone_id').value;
            const milestoneItemId = document.getElementById('milestone_item_id').value;

            const fileInputs = document.querySelectorAll('.evidence-file-input');
            const evidenceFiles = [];
            fileInputs.forEach(input => {
                if (input.files.length > 0) {
                    for (let i = 0; i < input.files.length; i++) {
                        evidenceFiles.push(input.files[i]);
                    }
                }
            });

            let errors = [];

            if (!projectId) {
                errors.push('Please select a project.');
            }

            if (!milestoneItemId) {
                errors.push('Please select a milestone item.');
            }

            const typeValidation = validateDisputeType(disputeType);
            if (typeValidation !== 'valid') {
                errors.push(typeValidation);
            }

            const descValidation = validateDisputeDescription(disputeDesc);
            if (descValidation !== 'valid') {
                errors.push(descValidation);
            }

            if (evidenceFiles.length > 10) {
                errors.push('Maximum 10 files allowed.');
            }

            for (let file of evidenceFiles) {
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    errors.push(`File "${file.name}" exceeds 5MB limit.`);
                }
                const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
                const fileExt = '.' + file.name.split('.').pop().toLowerCase();
                if (!allowedTypes.includes(fileExt)) {
                    errors.push(`File "${file.name}" has invalid format. Allowed: JPG, PNG, PDF, DOC, DOCX.`);
                }
            }

            if (errors.length > 0) {
                showErrors(errors);
                return;
            }

            const formData = new FormData();
            formData.append('project_id', projectId);
            formData.append('dispute_type', disputeType);
            formData.append('dispute_desc', disputeDesc);
            formData.append('milestone_item_id', milestoneItemId);

            if (milestoneId) {
                formData.append('milestone_id', milestoneId);
            }

            // Append all evidence files
            evidenceFiles.forEach(file => {
                formData.append('evidence_files[]', file);
            });

            fetch('/both/disputes/file', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            })
            .then(response => {
                return response.json().then(data => {
                    if (!response.ok) {
                        // Return data with error flag so we can handle it in next then()
                        return { isError: true, status: response.status, data: data };
                    }
                    return { isError: false, data: data };
                });
            })
            .then(result => {
                if (result.isError) {
                    const data = result.data;

                    if (result.status === 422 && data.errors) {
                        showErrors(data.errors);
                    } else if (data.message) {
                        showErrors(data.message);
                    } else {
                        showErrors('An error occurred while submitting the dispute.');
                    }
                    return;
                }

                const data = result.data;

                if (data.success) {
                    showSuccess(data.message);

                    // Reset form if it still exists
                    if (fileDisputeForm) {
                        fileDisputeForm.reset();
                    }

                    const charCount = document.getElementById('charCount');
                    if (charCount) {
                        charCount.textContent = '0 / 2000 characters';
                    }

                    const fileContainer = document.getElementById('file-upload-container');
                    const addMoreBtn = document.getElementById('add-more-files');
                    if (fileContainer && addMoreBtn) {
                        fileContainer.innerHTML = `
                            <div class="file-input-group">
                                <input type="file" name="evidence_files[]" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" class="evidence-file-input" onchange="handleFileSelectionWrapper(this, 'file-upload-container', 'add-more-files')">
                                <button type="button" class="remove-file-btn" onclick="removeFileInputWrapper(this, 'file-upload-container', 'add-more-files')" style="display:none;">Remove</button>
                            </div>
                        `;
                        addMoreBtn.style.display = 'none';
                    }

                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                }
            })
            .catch(error => {
                console.error('Submission error:', error);
                showErrors(error.message || 'An error occurred while submitting the dispute. Please try again.');
            });
        });
    }
});

// Load milestones for selected project
function loadMilestones(projectId) {
    const milestoneSelect = document.getElementById('milestone_id');
    const milestoneItemSelect = document.getElementById('milestone_item_id');

    if (!milestoneSelect) {
        console.warn('Milestone select element not found');
        return;
    }

    fetch(`/both/disputes/milestones/${projectId}`, {
        method: 'GET',
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Milestones response:', data);

        let milestones = [];
        if (data.success && data.data && data.data.milestones) {
            milestones = data.data.milestones;
        } else if (data.milestones) {
            milestones = data.milestones;
        } else {
            console.log('No milestones found in response');
            milestoneSelect.innerHTML = '<option value="">No milestones available</option>';
            return;
        }

        milestoneSelect.innerHTML = '<option value="">Select Milestone</option>';

        milestones.forEach(milestone => {
            const option = document.createElement('option');
            option.value = milestone.milestone_id;
            option.textContent = milestone.milestone_name || 'Unnamed Milestone';
            milestoneSelect.appendChild(option);
            console.log('Added milestone:', milestone.milestone_name, 'with ID:', milestone.milestone_id);
        });

        const urlParams = new URLSearchParams(window.location.search);
        const milestoneIdParam = urlParams.get('milestone_id');
        if (milestoneIdParam && milestones.find(m => m.milestone_id == milestoneIdParam)) {
            milestoneSelect.value = milestoneIdParam;
            const event = new Event('change');
            milestoneSelect.dispatchEvent(event);
        }
    })
    .catch(error => {
        console.error('Error loading milestones:', error);
    });

    // Clear milestone items when project changes
    if (milestoneItemSelect) {
        milestoneItemSelect.innerHTML = '<option value="">Select Milestone Item</option>';
    }
}

function loadMilestoneItems(milestoneId) {
    const milestoneItemSelect = document.getElementById('milestone_item_id');

    if (!milestoneItemSelect) {
        console.warn('Milestone item select element not found');
        return;
    }

    if (!milestoneId) {
        milestoneItemSelect.innerHTML = '<option value="">Select Milestone Item</option>';
        return;
    }

    fetch(`/both/disputes/milestone-items/${milestoneId}`, {
        method: 'GET',
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Milestone items response:', data);

        let milestoneItems = [];
        if (data.success && data.data && data.data.milestone_items) {
            milestoneItems = data.data.milestone_items;
        } else if (data.milestone_items) {
            milestoneItems = data.milestone_items;
        } else {
            console.log('No milestone items found in response');
            milestoneItemSelect.innerHTML = '<option value="">No milestone items available</option>';
            return;
        }

        milestoneItemSelect.innerHTML = '<option value="">Select Milestone Item</option>';

        milestoneItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.milestone_item_id;
            option.textContent = item.milestone_item_title || 'Unnamed Item';
            milestoneItemSelect.appendChild(option);
            console.log('Added milestone item:', item.milestone_item_title, 'with ID:', item.milestone_item_id);
        });

        // Check if there's a milestone item to pre-select
        const urlParams = new URLSearchParams(window.location.search);
        const milestoneItemIdParam = urlParams.get('milestone_item_id');
        if (milestoneItemIdParam && milestoneItems.find(mi => mi.milestone_item_id == milestoneItemIdParam)) {
            milestoneItemSelect.value = milestoneItemIdParam;
            console.log('Pre-selected milestone item:', milestoneItemIdParam);
        }
    })
    .catch(error => {
        console.error('Error loading milestone items:', error);
        milestoneItemSelect.innerHTML = '<option value="">Error loading milestone items</option>';
    });
}

function resetForm() {
    const form = document.getElementById('fileDisputeForm');
    const charCount = document.getElementById('charCount');
    const milestoneSelect = document.getElementById('milestone_id');
    const milestoneItemSelect = document.getElementById('milestone_item_id');
    const errorDiv = document.getElementById('errorMessages');
    const successDiv = document.getElementById('successMessages');

    if (form) form.reset();
    if (charCount) charCount.textContent = '0 / 2000 characters';
    if (milestoneSelect) milestoneSelect.innerHTML = '<option value="">Select Milestone</option>';
    if (milestoneItemSelect) milestoneItemSelect.innerHTML = '<option value="">Select Milestone Item</option>';
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';

    const fileContainer = document.getElementById('file-upload-container');
    const addMoreBtn = document.getElementById('add-more-files');
    if (fileContainer && addMoreBtn) {
        fileContainer.innerHTML = `
            <div class="file-input-group">
                <input type="file" name="evidence_files[]" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" class="evidence-file-input" onchange="handleFileSelectionWrapper(this, 'file-upload-container', 'add-more-files')">
                <button type="button" class="remove-file-btn" onclick="removeFileInputWrapper(this, 'file-upload-container', 'add-more-files')" style="display:none;">Remove</button>
            </div>
        `;
        addMoreBtn.style.display = 'none';
    }
}

// ========== REUSABLE FILE UPLOAD FUNCTIONS ==========
// These functions are used by both disputes and progress upload features

function handleFileSelection(input) {
    if (input.files && input.files.length > 0) {
        const removeBtn = input.parentElement.querySelector('.remove-file-btn');
        if (removeBtn) {
            removeBtn.style.display = 'inline-block';
        }

        const addMoreBtn = document.getElementById('add-more-files');
        if (addMoreBtn) {
            const fileInputs = document.querySelectorAll('.evidence-file-input, .progress-file-input');
            if (fileInputs.length < 10) {
                addMoreBtn.style.display = 'inline-block';
            }
        }
    }
}

function addMoreFiles() {
    const container = document.getElementById('file-upload-container');
    if (!container) return;

    const fileInputs = container.querySelectorAll('.file-input-group');
    if (fileInputs.length >= 10) {
        alert('Maximum of 10 files allowed');
        return;
    }

    // Create a temporary hidden file input
    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.style.display = 'none';

    const existingInput = container.querySelector('input[type="file"]');
    tempInput.name = existingInput.getAttribute('name');
    tempInput.accept = existingInput.getAttribute('accept');
    tempInput.className = existingInput.getAttribute('class');

    // Handle file selection
    tempInput.onchange = function() {
        if (this.files && this.files.length > 0) {
            // Create the new file group only after file is selected
            const newFileGroup = document.createElement('div');
            newFileGroup.className = 'file-input-group';

            const newInput = document.createElement('input');
            newInput.type = 'file';
            newInput.name = this.name;
            newInput.accept = this.accept;
            newInput.className = this.className;
            newInput.onchange = function() { handleFileSelection(this); };

            // Transfer the selected file to the new input
            const dataTransfer = new DataTransfer();
            Array.from(tempInput.files).forEach(file => dataTransfer.items.add(file));
            newInput.files = dataTransfer.files;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-file-btn';
            removeBtn.textContent = 'Remove';
            removeBtn.onclick = function() { removeFileInput(this); };
            removeBtn.style.display = 'inline-block';

            newFileGroup.appendChild(newInput);
            newFileGroup.appendChild(removeBtn);
            container.appendChild(newFileGroup);

            // Check if we've reached the limit
            const updatedFileInputs = container.querySelectorAll('.file-input-group');
            if (updatedFileInputs.length >= 10) {
                const addMoreBtn = document.getElementById('add-more-files');
                if (addMoreBtn) {
                    addMoreBtn.style.display = 'none';
                }
            }
        }
        // Remove temp input
        document.body.removeChild(tempInput);
    };

    // Add temp input to body and trigger click
    document.body.appendChild(tempInput);
    tempInput.click();
}

function removeFileInput(button) {
    const container = document.getElementById('file-upload-container');
    if (!container) return;

    const fileGroup = button.parentElement;
    const fileInputs = container.querySelectorAll('.file-input-group');

    if (fileInputs.length > 1) {
        fileGroup.remove();

        const addMoreBtn = document.getElementById('add-more-files');
        if (addMoreBtn && fileInputs.length - 1 < 10) {
            addMoreBtn.style.display = 'inline-block';
        }
    } else {
        const input = fileGroup.querySelector('input[type="file"]');
        if (input) {
            input.value = '';
            button.style.display = 'none';
        }

        const addMoreBtn = document.getElementById('add-more-files');
        if (addMoreBtn) {
            addMoreBtn.style.display = 'none';
        }
    }
}

// Dashboard search functionality
function initializeDashboardSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.project-card');
            cards.forEach(card => {
                const title = card.querySelector('.project-title')?.textContent.toLowerCase() || '';
                const description = card.querySelector('.project-description')?.textContent.toLowerCase() || '';
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Initialize dashboard search when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDashboardSearch);
    } else {
        initializeDashboardSearch();
    }
}
