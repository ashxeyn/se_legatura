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

                // Show remove button
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
                // Edit mode
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

                // Show project selection fields and restore required attribute
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

        // Delete evidence file immediately (for standalone file deletion, not used in edit mode)
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
            // Character counter for modal
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

            // Attach handler to initial file input in modal
            const initialFileInput = document.querySelector('#modal-file-upload-container .evidence-file-input');
            if (initialFileInput) {
                initialFileInput.addEventListener('change', function() {
                    window.DisputeModal.handleFileSelection(this, 'modal-file-upload-container', 'modal-add-more-files');
                });
            }

            // Attach handler to initial remove button in modal
            const initialRemoveBtn = document.querySelector('#modal-file-upload-container .remove-file-btn');
            if (initialRemoveBtn) {
                initialRemoveBtn.addEventListener('click', function() {
                    window.DisputeModal.removeFileInput(this, 'modal-file-upload-container', 'modal-add-more-files');
                });
            }

            // Attach handler to "Add More Files" button
            const addMoreBtn = document.getElementById('modal-add-more-files');
            if (addMoreBtn) {
                addMoreBtn.addEventListener('click', function() {
                    window.DisputeModal.addMoreFiles('modal-file-upload-container', 'modal-add-more-files');
                });
            }

            // Attach handler to modal cancel button
            const modalCancelBtn = document.getElementById('modalCancelBtn');
            if (modalCancelBtn) {
                modalCancelBtn.addEventListener('click', function() {
                    window.DisputeModal.close();
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

                    // Debug: Log form data
                    console.log('Form submission - isEdit:', isEdit);
                    console.log('Form data contents:');
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

// ========== CANCEL/DELETE DISPUTE MODAL ==========
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
