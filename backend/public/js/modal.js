if (typeof window.DisputeModal === 'undefined') {
    window.DisputeModal = {
        // Add more files function
        addMoreFiles: function(containerId, buttonId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const fileInputs = container.querySelectorAll('.file-input-group');
            if (fileInputs.length >= 10) {
                alert('Maximum of 10 files allowed');
                return;
            }

            const tempInput = document.createElement('input');
            tempInput.type = 'file';
            tempInput.style.display = 'none';

            const existingInput = container.querySelector('input[type="file"]');
            tempInput.name = existingInput.getAttribute('name');
            tempInput.accept = existingInput.getAttribute('accept');
            tempInput.className = existingInput.getAttribute('class');

            tempInput.onchange = function() {
                if (this.files && this.files.length > 0) {
                    const newFileGroup = document.createElement('div');
                    newFileGroup.className = 'file-input-group';

                    // Create file name display div
                    const fileNameDisplay = document.createElement('div');
                    fileNameDisplay.className = 'file-name-display visible';
                    fileNameDisplay.textContent = '📄 ' + tempInput.files[0].name;

                    const newInput = document.createElement('input');
                    newInput.type = 'file';
                    newInput.name = this.name;
                    newInput.accept = this.accept;
                    newInput.className = this.className + ' has-file';
                    newInput.onchange = function() { window.DisputeModal.handleFileSelection(this, containerId, buttonId); };

                    const dataTransfer = new DataTransfer();
                    Array.from(tempInput.files).forEach(file => dataTransfer.items.add(file));
                    newInput.files = dataTransfer.files;

                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'remove-file-btn';
                    removeBtn.textContent = 'Remove';
                    removeBtn.onclick = function() { window.DisputeModal.removeFileInput(this, containerId, buttonId); };
                    removeBtn.style.display = 'inline-block';

                    newFileGroup.appendChild(fileNameDisplay);
                    newFileGroup.appendChild(newInput);
                    newFileGroup.appendChild(removeBtn);
                    container.appendChild(newFileGroup);

                    const updatedFileInputs = container.querySelectorAll('.file-input-group');
                    const addMoreBtn = document.getElementById(buttonId);
                    if (updatedFileInputs.length >= 10) {
                        if (addMoreBtn) addMoreBtn.style.display = 'none';
                    } else {
                        if (addMoreBtn) addMoreBtn.style.display = 'inline-block';
                    }
                }
                document.body.removeChild(tempInput);
            };

            document.body.appendChild(tempInput);
            tempInput.click();
        },

        // Handle file selection
        handleFileSelection: function(input, containerId, buttonId) {
            if (input.files && input.files.length > 0) {
                const fileGroup = input.parentElement;

                // Hide the file input and show file name instead
                input.classList.add('has-file');

                // Check if file name display already exists
                let fileNameDisplay = fileGroup.querySelector('.file-name-display');
                if (!fileNameDisplay) {
                    fileNameDisplay = document.createElement('div');
                    fileNameDisplay.className = 'file-name-display';
                    fileGroup.insertBefore(fileNameDisplay, input);
                }

                fileNameDisplay.textContent = '📄 ' + input.files[0].name;
                fileNameDisplay.classList.add('visible');

                const removeBtn = fileGroup.querySelector('.remove-file-btn');
                if (removeBtn) {
                    removeBtn.style.display = 'inline-block';
                }

                // Show the Add More Files button
                const addMoreBtn = document.getElementById(buttonId);
                if (addMoreBtn) {
                    const container = document.getElementById(containerId);
                    if (container) {
                        const fileInputs = container.querySelectorAll('.file-input-group');
                        if (fileInputs.length < 10) {
                            addMoreBtn.style.display = 'inline-block';
                        }
                    }
                }
            }
        },

        // Remove file input
        removeFileInput: function(button, containerId, buttonId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const fileGroup = button.parentElement;
            const fileInputs = container.querySelectorAll('.file-input-group');

            if (fileInputs.length > 1) {
                fileGroup.remove();

                const addMoreBtn = document.getElementById(buttonId);
                if (addMoreBtn && fileInputs.length - 1 < 10) {
                    addMoreBtn.style.display = 'inline-block';
                }
            } else {
                const input = fileGroup.querySelector('input[type="file"]');
                const fileNameDisplay = fileGroup.querySelector('.file-name-display');

                if (input) {
                    input.value = '';
                    input.classList.remove('has-file');
                    button.style.display = 'none';
                }

                if (fileNameDisplay) {
                    fileNameDisplay.classList.remove('visible');
                }

                const addMoreBtn = document.getElementById(buttonId);
                if (addMoreBtn) {
                    addMoreBtn.style.display = 'none';
                }
            }
        },

        // ========== MODAL OPERATIONS ==========

        // Open dispute modal
        open: function(mode = 'add', disputeData = null) {
            const modal = document.getElementById('addEditDisputeModal');
            const title = document.getElementById('disputeModalTitle');
            const submitBtn = document.getElementById('modalSubmitBtn');
            const isEditInput = document.getElementById('modal_is_edit');

            // Reset form
            document.getElementById('disputeModalForm').reset();
            document.getElementById('modalCharCount').textContent = '0 / 2000 characters';
            document.getElementById('modalErrorMessages').style.display = 'none';
            document.getElementById('modalSuccessMessages').style.display = 'none';

            // Reset deleted files tracking
            const deletedFilesInput = document.getElementById('deleted_file_ids');
            if (deletedFilesInput) {
                deletedFilesInput.remove();
            }

            if (mode === 'edit' && disputeData) {
                title.textContent = 'Edit Dispute';
                submitBtn.textContent = 'Update Dispute';
                isEditInput.value = '1';

                document.getElementById('modal_dispute_id').value = disputeData.dispute_id;
                document.getElementById('modal_dispute_type').value = disputeData.dispute_type;
                document.getElementById('modal_dispute_desc').value = disputeData.dispute_desc;
                document.getElementById('modalCharCount').textContent = disputeData.dispute_desc.length + ' / 2000 characters';

                // Hide project selection fields in edit mode and remove required attribute
                document.getElementById('modalProjectGroup').style.display = 'none';
                document.getElementById('modalMilestoneGroup').style.display = 'none';
                document.getElementById('modalMilestoneItemGroup').style.display = 'none';
                document.getElementById('modal_project_id').removeAttribute('required');
                document.getElementById('modal_milestone_id').removeAttribute('required');
                document.getElementById('modal_milestone_item_id').removeAttribute('required');
                document.getElementById('modalFilesLabel').textContent = 'Add More Evidence Files (Optional)';

                // Show existing files
                if (disputeData.files && disputeData.files.length > 0) {
                    const filesList = document.getElementById('modalExistingFilesList');
                    filesList.innerHTML = '';

                    disputeData.files.forEach(file => {
                        const li = document.createElement('li');
                        li.style.display = 'flex';
                        li.style.alignItems = 'center';
                        li.style.gap = '10px';
                        li.style.marginBottom = '8px';
                        li.id = 'modal-file-' + file.file_id;

                        const link = document.createElement('a');
                        link.href = '/storage/' + file.storage_path;
                        link.target = '_blank';
                        link.textContent = file.original_name;
                        link.style.flex = '1';

                        const size = document.createElement('small');
                        size.textContent = '(' + (file.size / 1024).toFixed(1) + ' KB)';
                        size.style.marginRight = '10px';

                        const deleteBtn = document.createElement('button');
                        deleteBtn.type = 'button';
                        deleteBtn.className = 'remove-file-btn';
                        deleteBtn.textContent = 'Remove';
                        deleteBtn.style.display = 'inline-block';
                        deleteBtn.onclick = function() { window.DisputeModal.markFileForRemoval(file.file_id); };

                        li.appendChild(link);
                        li.appendChild(size);
                        li.appendChild(deleteBtn);
                        filesList.appendChild(li);
                    });

                    document.getElementById('modalExistingFilesSection').style.display = 'block';
                } else {
                    document.getElementById('modalExistingFilesSection').style.display = 'none';
                }
            } else {
                // Add mode
                title.textContent = 'File New Dispute';
                submitBtn.textContent = 'Submit Dispute';
                isEditInput.value = '0';

                document.getElementById('modalProjectGroup').style.display = 'block';
                document.getElementById('modalMilestoneGroup').style.display = 'block';
                document.getElementById('modalMilestoneItemGroup').style.display = 'block';
                document.getElementById('modal_project_id').setAttribute('required', 'required');
                document.getElementById('modal_milestone_id').setAttribute('required', 'required');
                document.getElementById('modal_milestone_item_id').setAttribute('required', 'required');
                document.getElementById('modalFilesLabel').textContent = 'Evidence Files (Optional)';
                document.getElementById('modalExistingFilesSection').style.display = 'none';

                // Pre-fill if coming from project details
                if (disputeData && disputeData.project_id) {
                    document.getElementById('modal_project_id').value = disputeData.project_id;

                    // Trigger milestone load with proper callback
                    if (disputeData.milestone_id) {
                        window.DisputeModal.loadMilestones(disputeData.project_id, disputeData.milestone_id);

                        // Load milestone items after milestones are loaded
                        if (disputeData.milestone_item_id) {
                            setTimeout(() => {
                                window.DisputeModal.loadMilestoneItems(disputeData.milestone_id, disputeData.milestone_item_id);
                            }, 500);
                        }
                    }
                }
            }

            // Reset file upload container
            const fileContainer = document.getElementById('modal-file-upload-container');
            fileContainer.innerHTML = `
                <div class="file-input-group">
                    <input type="file" name="evidence_files[]" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" class="evidence-file-input" onchange="DisputeModal.handleFileSelection(this, 'modal-file-upload-container', 'modal-add-more-files')">
                    <button type="button" class="remove-file-btn" onclick="DisputeModal.removeFileInput(this, 'modal-file-upload-container', 'modal-add-more-files')" style="display:none;">Remove</button>
                </div>
            `;
            document.getElementById('modal-add-more-files').style.display = 'none';

            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        },

        // Close dispute modal
        close: function() {
            const modal = document.getElementById('addEditDisputeModal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        },

        // Mark file for removal (only removed from UI, actual deletion on form submit)
        markFileForRemoval: function(fileId) {
            console.log('markFileForRemoval called for file ID:', fileId);

            // Remove from UI
            const fileElement = document.getElementById('modal-file-' + fileId);
            if (fileElement) {
                fileElement.remove();
                console.log('File element removed from UI');
            }

            // Add to hidden input for deletion tracking
            let deletedFilesInput = document.getElementById('deleted_file_ids');
            if (!deletedFilesInput) {
                deletedFilesInput = document.createElement('input');
                deletedFilesInput.type = 'hidden';
                deletedFilesInput.id = 'deleted_file_ids';
                deletedFilesInput.name = 'deleted_file_ids';
                deletedFilesInput.value = '';
                document.getElementById('disputeModalForm').appendChild(deletedFilesInput);
                console.log('Created hidden input for deleted files');
            }

            // Add file ID to deletion list
            const deletedIds = deletedFilesInput.value ? deletedFilesInput.value.split(',').filter(id => id) : [];
            if (!deletedIds.includes(fileId.toString())) {
                deletedIds.push(fileId);
                deletedFilesInput.value = deletedIds.join(',');
                console.log('Updated deleted files list:', deletedFilesInput.value);
            }

            // Hide section if no files left
            const filesList = document.getElementById('modalExistingFilesList');
            if (filesList.children.length === 0) {
                document.getElementById('modalExistingFilesSection').style.display = 'none';
            }
        },

        deleteEvidenceFile: function(fileId) {
            if (!confirm('Are you sure you want to delete this file?')) {
                return;
            }

            fetch(`/both/disputes/evidence/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const fileElement = document.getElementById('modal-file-' + fileId);
                    if (fileElement) {
                        fileElement.remove();
                    }

                    const filesList = document.getElementById('modalExistingFilesList');
                    if (filesList.children.length === 0) {
                        document.getElementById('modalExistingFilesSection').style.display = 'none';
                    }
                } else {
                    alert(result.message || 'Error deleting file');
                }
            })
            .catch(error => {
                console.error('Delete error:', error);
                alert('An error occurred while deleting the file.');
            });
        },

        // Load milestones for a project
        loadMilestones: function(projectId, preselectMilestoneId = null) {
            const milestoneSelect = document.getElementById('modal_milestone_id');
            const milestoneItemSelect = document.getElementById('modal_milestone_item_id');

            if (!milestoneSelect) return;

            fetch(`/both/disputes/milestones/${projectId}`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                let milestones = [];
                if (data.success && data.data && data.data.milestones) {
                    milestones = data.data.milestones;
                } else if (data.milestones) {
                    milestones = data.milestones;
                }

                milestoneSelect.innerHTML = '<option value="">Select Milestone</option>';

                milestones.forEach(milestone => {
                    const option = document.createElement('option');
                    option.value = milestone.milestone_id;
                    option.textContent = milestone.milestone_name || 'Unnamed Milestone';
                    milestoneSelect.appendChild(option);
                });

                if (preselectMilestoneId) {
                    milestoneSelect.value = preselectMilestoneId;
                    window.DisputeModal.loadMilestoneItems(preselectMilestoneId);
                }
            })
            .catch(error => {
                console.error('Error loading milestones:', error);
            });

            if (milestoneItemSelect) {
                milestoneItemSelect.innerHTML = '<option value="">Select Milestone Item</option>';
            }
        },

        // Load milestone items for a milestone
        loadMilestoneItems: function(milestoneId, preselectItemId = null) {
            const milestoneItemSelect = document.getElementById('modal_milestone_item_id');

            if (!milestoneItemSelect || !milestoneId) {
                if (milestoneItemSelect) {
                    milestoneItemSelect.innerHTML = '<option value="">Select Milestone Item</option>';
                }
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
                let milestoneItems = [];
                if (data.success && data.data && data.data.milestone_items) {
                    milestoneItems = data.data.milestone_items;
                } else if (data.milestone_items) {
                    milestoneItems = data.milestone_items;
                }

                milestoneItemSelect.innerHTML = '<option value="">Select Milestone Item</option>';

                milestoneItems.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.milestone_item_id;
                    option.textContent = item.milestone_item_title || 'Unnamed Item';
                    milestoneItemSelect.appendChild(option);
                });

                if (preselectItemId) {
                    milestoneItemSelect.value = preselectItemId;
                }
            })
            .catch(error => {
                console.error('Error loading milestone items:', error);
                milestoneItemSelect.innerHTML = '<option value="">Error loading milestone items</option>';
            });
        },

        // Initialize modal event listeners
        init: function() {
            const modalDescTextarea = document.getElementById('modal_dispute_desc');
            if (modalDescTextarea) {
                modalDescTextarea.addEventListener('input', function() {
                    const count = this.value.length;
                    document.getElementById('modalCharCount').textContent = count + ' / 2000 characters';
                });
            }

            // Project selection change
            const modalProjectSelect = document.getElementById('modal_project_id');
            if (modalProjectSelect) {
                modalProjectSelect.addEventListener('change', function() {
                    const projectId = this.value;
                    if (projectId) {
                        window.DisputeModal.loadMilestones(projectId);
                    } else {
                        document.getElementById('modal_milestone_id').innerHTML = '<option value="">Select Milestone</option>';
                        document.getElementById('modal_milestone_item_id').innerHTML = '<option value="">Select Milestone Item</option>';
                    }
                });
            }

            // Milestone selection change
            const modalMilestoneSelect = document.getElementById('modal_milestone_id');
            if (modalMilestoneSelect) {
                modalMilestoneSelect.addEventListener('change', function() {
                    const milestoneId = this.value;
                    if (milestoneId) {
                        window.DisputeModal.loadMilestoneItems(milestoneId);
                    }
                });
            }
            // handler attachment to guys na galing sa both.js
            const initialFileInput = document.querySelector('#modal-file-upload-container .evidence-file-input');
            if (initialFileInput) {
                initialFileInput.addEventListener('change', function() {
                    window.DisputeModal.handleFileSelection(this, 'modal-file-upload-container', 'modal-add-more-files');
                });
            }

            const initialRemoveBtn = document.querySelector('#modal-file-upload-container .remove-file-btn');
            if (initialRemoveBtn) {
                initialRemoveBtn.addEventListener('click', function() {
                    window.DisputeModal.removeFileInput(this, 'modal-file-upload-container', 'modal-add-more-files');
                });
            }

            const addMoreBtn = document.getElementById('modal-add-more-files');
            if (addMoreBtn) {
                addMoreBtn.addEventListener('click', function() {
                    window.DisputeModal.addMoreFiles('modal-file-upload-container', 'modal-add-more-files');
                });
            }

            const modalCancelBtn = document.getElementById('modalCancelBtn');
            if (modalCancelBtn) {
                modalCancelBtn.addEventListener('click', function() {
                    window.DisputeModal.close();
                });
            }

            // ========== PROGRESS MODAL INITIALIZATION ==========

            const progressTextarea = document.getElementById('progress_purpose');
            if (progressTextarea) {
                progressTextarea.addEventListener('input', function() {
                    const count = this.value.length;
                    document.getElementById('progressCharCount').textContent = count + ' / 1000 characters';
                });
            }

            // Attach handler to initial file input in progress modal
            const initialProgressFileInput = document.querySelector('#progress-file-upload-container .evidence-file-input');
            if (initialProgressFileInput) {
                initialProgressFileInput.addEventListener('change', function() {
                    window.ProgressModal.handleFileSelection(this);
                });
            }

            const initialProgressRemoveBtn = document.querySelector('#progress-file-upload-container .remove-file-btn');
            if (initialProgressRemoveBtn) {
                initialProgressRemoveBtn.addEventListener('click', function() {
                    window.ProgressModal.removeFileInput(this);
                });
            }

            const progressAddMoreBtn = document.getElementById('progress-add-more-files');
            if (progressAddMoreBtn) {
                progressAddMoreBtn.addEventListener('click', function() {
                    window.ProgressModal.addMoreFiles();
                });
            }

            const progressCancelBtn = document.getElementById('progressCancelBtn');
            if (progressCancelBtn) {
                progressCancelBtn.addEventListener('click', function() {
                    window.ProgressModal.close();
                });
            }

            // Progress form submission
            const progressForm = document.getElementById('progressModalForm');
            if (progressForm) {
                progressForm.addEventListener('submit', function(e) {
                    e.preventDefault();

                    const formData = new FormData(this);
                    const isEdit = document.getElementById('progress_is_edit').value === '1';
                    const progressId = document.getElementById('progress_id').value;
                    const errorDiv = document.getElementById('progressModalErrorMessages');
                    const successDiv = document.getElementById('progressModalSuccessMessages');

                    errorDiv.style.display = 'none';
                    successDiv.style.display = 'none';

                    let url = '/contractor/progress/upload';
                    let method = 'POST';
                    let headers = {
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    };

                    if (isEdit && progressId) {
                        url = `/contractor/progress/${progressId}`;
                        headers['X-HTTP-Method-Override'] = 'PUT';
                    }

                    fetch(url, {
                        method: method,
                        headers: headers,
                        body: formData
                    })
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            successDiv.innerHTML = '<p>' + (result.message || 'Progress uploaded successfully!') + '</p>';
                            successDiv.style.display = 'block';

                            setTimeout(() => {
                                window.ProgressModal.close();
                                location.reload();
                            }, 1500);
                        } else {
                            let errorMessage = result.message || 'An error occurred';
                            if (result.errors) {
                                errorMessage = '<ul>';
                                for (let field in result.errors) {
                                    if (Array.isArray(result.errors[field])) {
                                        result.errors[field].forEach(error => {
                                            errorMessage += '<li>' + error + '</li>';
                                        });
                                    } else {
                                        errorMessage += '<li>' + result.errors[field] + '</li>';
                                    }
                                }
                                errorMessage += '</ul>';
                            }
                            errorDiv.innerHTML = errorMessage;
                            errorDiv.style.display = 'block';
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        errorDiv.innerHTML = '<p>An error occurred while uploading progress.</p>';
                        errorDiv.style.display = 'block';
                    });
                });
            }

            // Form submission
            const modalForm = document.getElementById('disputeModalForm');
            if (modalForm) {
                modalForm.addEventListener('submit', function(e) {
                    e.preventDefault();

                    const formData = new FormData(this);
                    const isEdit = document.getElementById('modal_is_edit').value === '1';
                    const disputeId = document.getElementById('modal_dispute_id').value;
                    const errorDiv = document.getElementById('modalErrorMessages');
                    const successDiv = document.getElementById('modalSuccessMessages');

                    // console.log('Form submission - isEdit:', isEdit);
                    // console.log('Form data contents:');
                    for (let pair of formData.entries()) {
                        console.log(pair[0] + ': ' + pair[1]);
                    }

                    errorDiv.style.display = 'none';
                    successDiv.style.display = 'none';

                    let url = '/both/disputes/file';
                    let method = 'POST';
                    let headers = {
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    };

                    if (isEdit) {
                        url = `/both/disputes/${disputeId}`;
                        headers['X-HTTP-Method-Override'] = 'PUT';
                    }

                    fetch(url, {
                        method: method,
                        headers: headers,
                        body: formData
                    })
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            successDiv.innerHTML = result.message;
                            successDiv.style.display = 'block';

                            setTimeout(() => {
                                window.DisputeModal.close();
                                location.reload();
                            }, 1500);
                        } else {
                            if (result.errors) {
                                let errorHtml = '<ul>';
                                for (let field in result.errors) {
                                    if (Array.isArray(result.errors[field])) {
                                        result.errors[field].forEach(error => {
                                            errorHtml += `<li>${error}</li>`;
                                        });
                                    }
                                }
                                errorHtml += '</ul>';
                                errorDiv.innerHTML = errorHtml;
                            } else {
                                errorDiv.innerHTML = result.message || 'Error processing dispute';
                            }
                            errorDiv.style.display = 'block';
                        }
                    })
                    .catch(error => {
                        console.error('Submit error:', error);
                        errorDiv.innerHTML = 'An error occurred while processing the dispute.';
                        errorDiv.style.display = 'block';
                    });
                });
            }
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.DisputeModal.init);
    } else {
        window.DisputeModal.init();
    }
}

if (typeof window.DisputeCancel === 'undefined') {
    window.DisputeCancel = {
        disputeToCancel: null,

        // Open cancel modal
        open: function(disputeId) {
            this.disputeToCancel = disputeId;
            const modal = document.getElementById('cancelDisputeModal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        },

        // Close cancel modal
        close: function() {
            const modal = document.getElementById('cancelDisputeModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            this.disputeToCancel = null;
        },

        // Confirm cancel dispute
        confirm: function() {
            if (!this.disputeToCancel) return;

            const disputeId = this.disputeToCancel;
            this.close();

            fetch(`/both/disputes/${disputeId}/cancel`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    if (typeof showSuccess === 'function') {
                        showSuccess(result.message);
                    } else {
                        alert(result.message);
                    }
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    if (typeof showErrors === 'function') {
                        showErrors(result.message || 'Error cancelling dispute');
                    } else {
                        alert(result.message || 'Error cancelling dispute');
                    }
                }
            })
            .catch(error => {
                console.error('Cancel error:', error);
                if (typeof showErrors === 'function') {
                    showErrors('An error occurred while cancelling the dispute.');
                } else {
                    alert('An error occurred while cancelling the dispute.');
                }
            });
        }
    };
}

// ========== PAYMENT MODAL ==========

if (typeof window.PaymentModal === 'undefined') {
    window.PaymentModal = {
        paymentId: null,

        open: function(mode = 'add', paymentData = null) {
            const modal = document.getElementById('paymentModal');
            const title = document.getElementById('paymentModalTitle');
            const form = document.getElementById('paymentModalForm');
            const isEditInput = document.getElementById('payment_is_edit');

            // reset
            form.reset();
            document.getElementById('paymentModalErrorMessages').style.display = 'none';
            document.getElementById('paymentModalSuccessMessages').style.display = 'none';
            document.getElementById('payment_id').value = '';
            isEditInput.value = '0';

            if (mode === 'edit' && paymentData) {
                title.textContent = 'Edit Payment Validation';
                document.getElementById('payment_id').value = paymentData.payment_id || '';
                isEditInput.value = '1';
                document.getElementById('payment_item_id').value = paymentData.item_id || '';
                document.getElementById('payment_project_id').value = paymentData.project_id || '';
                document.getElementById('payment_item_title').textContent = paymentData.item_title || '';
                document.getElementById('payment_amount').value = paymentData.amount || '';
                document.getElementById('payment_type').value = paymentData.payment_type || '';
                document.getElementById('transaction_number').value = paymentData.transaction_number || '';
                if (paymentData.transaction_date) {
                    // set date-only (YYYY-MM-DD)
                    const dateVal = paymentData.transaction_date.toString().slice(0,10);
                    document.getElementById('transaction_date').value = dateVal;
                }
                if (paymentData.receipt_photo) {
                    // show existing receipt area (not implemented: keep simple)
                }
            } else {
                title.textContent = 'Upload Payment Validation';
                if (paymentData) {
                    document.getElementById('payment_item_id').value = paymentData.item_id || '';
                    document.getElementById('payment_project_id').value = paymentData.project_id || '';
                    document.getElementById('payment_item_title').textContent = paymentData.item_title || '';
                }
            }

            // reset file input container; include existing receipt section and a single file input
            const fileContainer = document.getElementById('payment-file-upload-container');
            fileContainer.innerHTML = `
                <div id="existingReceiptSection" style="display:none; margin-bottom:8px;">
                    <div id="existingReceiptLink" style="margin-bottom:6px;"></div>
                    <button type="button" id="chooseFileAgainBtn" class="btn-secondary">Choose file again</button>
                </div>
                <div class="file-input-group">
                    <input type="file" name="receipt_photo" accept=".jpg,.jpeg,.png,.pdf" class="evidence-file-input">
                </div>
            `;

            // attach file input handler using DisputeModal helper
            const newFileInput = fileContainer.querySelector('.evidence-file-input');
            const chooseFileBtn = document.getElementById('chooseFileAgainBtn');
            const existingSection = document.getElementById('existingReceiptSection');

            if (chooseFileBtn) {
                chooseFileBtn.addEventListener('click', function() {
                    // trigger file input to allow user to pick a new file
                    if (newFileInput) newFileInput.click();
                });
            }

            if (newFileInput) {
                newFileInput.addEventListener('change', function() {
                    // when user chooses a new file, show the chosen filename in the existingReceiptLink area
                    const linkDiv = document.getElementById('existingReceiptLink');
                    if (this.files && this.files.length > 0) {
                        const f = this.files[0];
                        if (linkDiv) {
                            // show filename (not a storage link) to indicate a newly selected file
                            linkDiv.innerHTML = `<span>Selected file: ${f.name}</span>`;
                        }
                        if (existingSection) existingSection.style.display = 'block';
                        // show file name and remove button via existing helper
                        window.DisputeModal.handleFileSelection(this, 'payment-file-upload-container', '');
                    } else {
                        if (linkDiv) linkDiv.innerHTML = '';
                        if (existingSection) existingSection.style.display = 'none';
                    }
                });
            }

            // If we're in edit mode and paymentData has an existing receipt, show it
            if (isEditInput && isEditInput.value === '1' && typeof paymentData !== 'undefined' && paymentData && paymentData.receipt_photo) {
                const linkDiv = document.getElementById('existingReceiptLink');
                if (linkDiv) {
                    const url = '/storage/' + paymentData.receipt_photo;
                    linkDiv.innerHTML = `<a href="${url}" target="_blank">View current receipt</a>`;
                }
                if (existingSection) existingSection.style.display = 'block';
            }

            // attach cancel
            const cancelBtn = document.getElementById('paymentCancelBtn');
            if (cancelBtn) {
                cancelBtn.onclick = function() { window.PaymentModal.close(); };
            }

            // attach submit handler once
            if (!form._payment_handler_attached) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const fd = new FormData(form);
                    const isEdit = document.getElementById('payment_is_edit').value === '1';
                    let url = '/owner/payment/upload';
                    let method = 'POST';
                    const headers = {
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest'
                    };

                    if (isEdit) {
                        const pid = document.getElementById('payment_id').value;
                        url = `/owner/payment/${pid}`;
                        // use POST with _method override or send PUT via fetch with FormData - using POST with override
                        fd.append('_method', 'PUT');
                    }

                    fetch(url, {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: headers,
                        body: fd
                    })
                    .then(r => r.json())
                    .then(res => {
                        const errDiv = document.getElementById('paymentModalErrorMessages');
                        const successDiv = document.getElementById('paymentModalSuccessMessages');
                        errDiv.style.display = 'none'; successDiv.style.display = 'none';
                        if (res.success) {
                            successDiv.innerHTML = '<p>' + (res.message || 'Payment saved') + '</p>';
                            successDiv.style.display = 'block';
                            setTimeout(() => { window.PaymentModal.close(); location.reload(); }, 1000);
                        } else {
                            errDiv.innerHTML = res.message || 'Error saving payment';
                            errDiv.style.display = 'block';
                        }
                    })
                    .catch(err => {
                        const errDiv = document.getElementById('paymentModalErrorMessages');
                        errDiv.innerHTML = 'An error occurred';
                        errDiv.style.display = 'block';
                        console.error('Payment submit error', err);
                    });
                });
                form._payment_handler_attached = true;
            }

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        },

        close: function() {
            const modal = document.getElementById('paymentModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    };
}

if (typeof window.PaymentDelete === 'undefined') {
    window.PaymentDelete = {
        paymentToDelete: null,
        open: function(paymentId) { this.paymentToDelete = paymentId; const modal = document.getElementById('deletePaymentModal'); if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; } },
        close: function() { const modal = document.getElementById('deletePaymentModal'); if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; } this.paymentToDelete = null; },
        confirm: function() {
            if (!this.paymentToDelete) return;
            const pid = this.paymentToDelete; this.close();
            fetch(`/owner/payment/${pid}`, { method: 'DELETE', credentials: 'same-origin', headers: { 'X-CSRF-TOKEN': getCsrfToken(), 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
            .then(r => r.json()).then(res => { if (res.success) { alert(res.message || 'Deleted'); setTimeout(() => location.reload(), 700); } else { alert(res.message || 'Error deleting'); } }).catch(err => { console.error(err); alert('Error deleting payment'); });
        }
    };
}

// ========== BACKWARD COMPATIBILITY ALIASES ==========
// For existing code that uses these function names

if (typeof addMoreFilesWrapper === 'undefined') {
    window.addMoreFilesWrapper = function(containerId, buttonId) {
        window.DisputeModal.addMoreFiles(containerId, buttonId);
    };
}

if (typeof handleFileSelectionWrapper === 'undefined') {
    window.handleFileSelectionWrapper = function(input, containerId, buttonId) {
        window.DisputeModal.handleFileSelection(input, containerId, buttonId);
    };
}

if (typeof removeFileInputWrapper === 'undefined') {
    window.removeFileInputWrapper = function(button, containerId, buttonId) {
        window.DisputeModal.removeFileInput(button, containerId, buttonId);
    };
}

if (typeof openDisputeModal === 'undefined') {
    window.openDisputeModal = function(mode, disputeData) {
        window.DisputeModal.open(mode, disputeData);
    };
}

if (typeof closeDisputeModal === 'undefined') {
    window.closeDisputeModal = function() {
        window.DisputeModal.close();
    };
}

if (typeof deleteDisputeEvidenceFile === 'undefined') {
    window.deleteDisputeEvidenceFile = function(fileId) {
        window.DisputeModal.deleteEvidenceFile(fileId);
    };
}

if (typeof loadModalMilestones === 'undefined') {
    window.loadModalMilestones = function(projectId, preselectMilestoneId) {
        window.DisputeModal.loadMilestones(projectId, preselectMilestoneId);
    };
}

if (typeof loadModalMilestoneItems === 'undefined') {
    window.loadModalMilestoneItems = function(milestoneId, preselectItemId) {
        window.DisputeModal.loadMilestoneItems(milestoneId, preselectItemId);
    };
}

if (typeof cancelDispute === 'undefined') {
    window.cancelDispute = function(disputeId) {
        window.DisputeCancel.open(disputeId);
    };
}

if (typeof closeCancelModal === 'undefined') {
    window.closeCancelModal = function() {
        window.DisputeCancel.close();
    };
}

if (typeof confirmCancelDispute === 'undefined') {
    window.confirmCancelDispute = function() {
        window.DisputeCancel.confirm();
    };
}

if (typeof window.ProgressDelete === 'undefined') {
    window.ProgressDelete = {
        progressToDelete: null,

        // Open delete modal
        open: function(progressId) {
            this.progressToDelete = progressId;
            const modal = document.getElementById('deleteProgressModal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        },

        // Close delete modal
        close: function() {
            const modal = document.getElementById('deleteProgressModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            this.progressToDelete = null;
        },

        // Confirm delete progress
        confirm: function() {
            if (!this.progressToDelete) return;

            const progressId = this.progressToDelete;
            this.close();

            fetch(`/contractor/progress/${progressId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    if (typeof showSuccess === 'function') {
                        showSuccess(result.message);
                    } else {
                        alert(result.message || 'Progress report deleted successfully');
                    }
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    if (typeof showError === 'function') {
                        showError(result.message);
                    } else {
                        alert('Error: ' + result.message);
                    }
                }
            })
            .catch(error => {
                console.error('Delete error:', error);
                if (typeof showError === 'function') {
                    showError('An error occurred while deleting the progress report.');
                } else {
                    alert('An error occurred while deleting the progress report.');
                }
            });
        }
    };
}

// ========== PROGRESS UPLOAD MODAL ==========

if (typeof window.ProgressModal === 'undefined') {
    window.ProgressModal = {
        // Open progress modal
        open: function(mode = 'add', progressData = null) {
            const modal = document.getElementById('progressModal');
            const title = document.getElementById('progressModalTitle');
            const form = document.getElementById('progressModalForm');
            const submitBtn = document.getElementById('progressSubmitBtnText');
            const isEditInput = document.getElementById('progress_is_edit');

            form.reset();
            document.getElementById('progressModalErrorMessages').style.display = 'none';
            document.getElementById('progressModalSuccessMessages').style.display = 'none';

            const deletedFilesInput = document.getElementById('progress_deleted_file_ids');
            if (deletedFilesInput) {
                deletedFilesInput.remove();
            }

            if (mode === 'edit' && progressData) {
                title.textContent = 'Edit Progress Upload';
                submitBtn.textContent = 'Update Progress';
                isEditInput.value = '1';

                document.getElementById('progress_item_id').value = progressData.item_id || '';
                document.getElementById('progress_project_id').value = progressData.project_id || '';
                document.getElementById('progress_id').value = progressData.progress_id || '';
                document.getElementById('progress_item_title').textContent = progressData.item_title || '';
                document.getElementById('progress_purpose').value = progressData.purpose || '';

                const charCount = (progressData.purpose || '').length;
                document.getElementById('progressCharCount').textContent = charCount + ' / 1000 characters';

                if (progressData.files && progressData.files.length > 0) {
                    const filesSection = document.getElementById('existingProgressFilesSection');
                    const filesList = document.getElementById('existingProgressFilesList');
                    filesList.innerHTML = '';

                    progressData.files.forEach(file => {
                        const li = document.createElement('li');
                        li.id = 'progress-file-' + file.file_id;
                        li.innerHTML = `
                            <span>📄 ${file.original_name || file.file_path.split('/').pop()}</span>
                            <button type="button" onclick="ProgressModal.markFileForRemoval(${file.file_id})">Remove</button>
                        `;
                        filesList.appendChild(li);
                    });

                    filesSection.style.display = 'block';
                }

                // Change file label to optional
                document.getElementById('progressFilesLabel').textContent = 'Progress Files (Optional)';
                const fileInput = document.querySelector('#progress-file-upload-container input[type="file"]');
                if (fileInput) {
                    fileInput.removeAttribute('required');
                }
            } else {
                title.textContent = 'Upload Progress';
                submitBtn.textContent = 'Upload Progress';
                isEditInput.value = '0';

                if (progressData) {
                    document.getElementById('progress_item_id').value = progressData.item_id || '';
                    document.getElementById('progress_project_id').value = progressData.project_id || '';
                    document.getElementById('progress_item_title').textContent = progressData.item_title || '';
                }

                // Hide existing files section
                document.getElementById('existingProgressFilesSection').style.display = 'none';

                // Make file input required
                document.getElementById('progressFilesLabel').textContent = 'Progress Files *';
                const fileInput = document.querySelector('#progress-file-upload-container input[type="file"]');
                if (fileInput) {
                    fileInput.setAttribute('required', 'required');
                }
            }

            const fileContainer = document.getElementById('progress-file-upload-container');
            fileContainer.innerHTML = `
                <div class="file-input-group">
                    <input type="file" name="progress_files[]" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" class="progress-file-input evidence-file-input">
                    <button type="button" class="remove-file-btn" style="display:none;">Remove</button>
                </div>
            `;
            document.getElementById('progress-add-more-files').style.display = 'none';

            const newFileInput = fileContainer.querySelector('.evidence-file-input');
            if (newFileInput) {
                newFileInput.addEventListener('change', function() {
                    window.ProgressModal.handleFileSelection(this);
                });
            }

            const newRemoveBtn = fileContainer.querySelector('.remove-file-btn');
            if (newRemoveBtn) {
                newRemoveBtn.addEventListener('click', function() {
                    window.ProgressModal.removeFileInput(this);
                });
            }

            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        },

        close: function() {
            const modal = document.getElementById('progressModal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        },

        // Mark file for removal
        markFileForRemoval: function(fileId) {
            console.log('markFileForRemoval called for progress file ID:', fileId);

            // Remove from UI
            const fileElement = document.getElementById('progress-file-' + fileId);
            if (fileElement) {
                fileElement.remove();
                console.log('Progress file element removed from UI');
            }

            // Add to hidden input for deletion tracking
            let deletedFilesInput = document.getElementById('progress_deleted_file_ids');
            if (!deletedFilesInput) {
                deletedFilesInput = document.createElement('input');
                deletedFilesInput.type = 'hidden';
                deletedFilesInput.id = 'progress_deleted_file_ids';
                deletedFilesInput.name = 'deleted_file_ids';
                deletedFilesInput.value = '';
                document.getElementById('progressModalForm').appendChild(deletedFilesInput);
                console.log('Created hidden input for deleted progress files');
            }

            // Add file ID to deletion list
            const deletedIds = deletedFilesInput.value ? deletedFilesInput.value.split(',').filter(id => id) : [];
            if (!deletedIds.includes(fileId.toString())) {
                deletedIds.push(fileId);
                deletedFilesInput.value = deletedIds.join(',');
                console.log('Updated deleted progress files list:', deletedFilesInput.value);
            }

            // Hide section if no files left
            const filesList = document.getElementById('existingProgressFilesList');
            if (filesList && filesList.children.length === 0) {
                document.getElementById('existingProgressFilesSection').style.display = 'none';
            }
        },

        // Reuse DisputeModal file upload functions
        handleFileSelection: function(input) {
            window.DisputeModal.handleFileSelection(input, 'progress-file-upload-container', 'progress-add-more-files');
        },

        removeFileInput: function(button) {
            window.DisputeModal.removeFileInput(button, 'progress-file-upload-container', 'progress-add_more-files');
        },

        addMoreFiles: function() {
            window.DisputeModal.addMoreFiles('progress-file-upload-container', 'progress-add-more-files');
        }
    };
}

if (typeof window.ProgressApprove === 'undefined') {
    window.ProgressApprove = {
        progressToApprove: null,

        // Open approve modal
        open: function(progressId) {
            this.progressToApprove = progressId;
            const modal = document.getElementById('approveProgressModal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        },

        // Close approve modal
        close: function() {
            const modal = document.getElementById('approveProgressModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            this.progressToApprove = null;
        },

        // Confirm approve progress
        confirm: function() {
            if (!this.progressToApprove) return;

            const progressId = this.progressToApprove;

            const modal = document.getElementById('approveProgressModal');
            const errDiv = document.getElementById('approveProgressErrorMessage');
            const successDiv = document.getElementById('approveProgressSuccessMessage');

            if (errDiv) { errDiv.style.display = 'none'; errDiv.innerHTML = ''; }
            if (successDiv) { successDiv.style.display = 'none'; successDiv.innerHTML = ''; }

            // Show a simple loading state in the modal (disable buttons)
            const confirmBtn = modal ? modal.querySelector('.modal-actions .btn-primary') : null;
            const cancelBtn = modal ? modal.querySelector('.modal-actions .btn-secondary') : null;
            if (confirmBtn) confirmBtn.disabled = true;
            if (cancelBtn) cancelBtn.disabled = true;

            fetch(`/contractor/progress/approve/${progressId}`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ progress_id: progressId })
            })
            .then(response => response.json())
            .then(result => {
                if (confirmBtn) confirmBtn.disabled = false;
                if (cancelBtn) cancelBtn.disabled = false;

                if (result.success) {
                    if (successDiv) {
                        successDiv.innerHTML = '<p>' + (result.message || 'Progress report approved successfully') + '</p>';
                        successDiv.style.display = 'block';
                    } else {
                        // fallback to alert if modal elements missing
                        alert(result.message || 'Progress report approved successfully');
                    }

                    // Close modal after a brief delay to show message
                    setTimeout(() => { this.close(); location.reload(); }, 1200);
                } else {
                    if (errDiv) {
                        errDiv.innerHTML = result.message || 'Error approving progress report';
                        errDiv.style.display = 'block';
                    } else {
                        alert(result.message || 'Error approving progress report');
                    }
                }
            })
            .catch(error => {
                if (confirmBtn) confirmBtn.disabled = false;
                if (cancelBtn) cancelBtn.disabled = false;
                console.error('Approve error:', error);
                if (errDiv) {
                    errDiv.innerHTML = 'An error occurred while approving the progress report.';
                    errDiv.style.display = 'block';
                } else {
                    alert('An error occurred while approving the progress report.');
                }
            });
        }
    };
}
