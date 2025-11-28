const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
let selectedPaymentMode = '';
let startDateLimit = null;
let endDateLimit = null;
let milestoneItems = [];
let projectDetailsMap = {};
let step1State = null;
let step2State = null;
let editingIndex = null; // Track which item is being edited

// Delete Milestone Modal Functions
if (typeof window.DeleteMilestoneModal === 'undefined') {
    window.DeleteMilestoneModal = {
        milestoneId: null,

        open: function(milestoneId) {
            this.milestoneId = milestoneId;
            document.getElementById('delete_milestone_id').value = milestoneId;
            document.getElementById('reason').value = '';
            document.getElementById('deleteMilestoneModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            document.getElementById('deleteMilestoneErrorMessage').style.display = 'none';
            document.getElementById('deleteMilestoneSuccessMessage').style.display = 'none';
        },

        close: function() {
            document.getElementById('deleteMilestoneModal').style.display = 'none';
            document.body.style.overflow = '';
            this.milestoneId = null;
            document.getElementById('delete_milestone_id').value = '';
            document.getElementById('reason').value = '';
            document.getElementById('deleteMilestoneErrorMessage').style.display = 'none';
            document.getElementById('deleteMilestoneSuccessMessage').style.display = 'none';
        },

        confirm: async function() {
            if (!this.milestoneId) {
                return;
            }

            const reason = document.getElementById('reason').value.trim();
            if (!reason) {
                document.getElementById('deleteMilestoneErrorMessage').textContent = 'Please provide a reason for deletion.';
                document.getElementById('deleteMilestoneErrorMessage').style.display = 'block';
                return;
            }

            const confirmBtn = document.getElementById('confirmDeleteMilestoneBtn');
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Deleting...';

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                document.getElementById('deleteMilestoneErrorMessage').textContent = 'CSRF token not found. Please refresh the page.';
                document.getElementById('deleteMilestoneErrorMessage').style.display = 'block';
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Delete Milestone';
                return;
            }

            try {
                const response = await fetch(`/contractor/milestone/${this.milestoneId}/delete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({
                        reason: reason
                    })
                });

                const data = await response.json();

                if (data.success) {
                    document.getElementById('deleteMilestoneSuccessMessage').textContent = data.message;
                    document.getElementById('deleteMilestoneSuccessMessage').style.display = 'block';
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    document.getElementById('deleteMilestoneErrorMessage').textContent = data.message || 'An error occurred while deleting the milestone.';
                    document.getElementById('deleteMilestoneErrorMessage').style.display = 'block';
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Delete Milestone';
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('deleteMilestoneErrorMessage').textContent = 'An error occurred while deleting the milestone. Please try again.';
                document.getElementById('deleteMilestoneErrorMessage').style.display = 'block';
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Delete Milestone';
            }
        }
    };
}

// Global functions for delete milestone modal
function openDeleteMilestoneModal(milestoneId) {
    if (window.DeleteMilestoneModal) {
        window.DeleteMilestoneModal.open(milestoneId);
    }
}

function closeDeleteMilestoneModal() {
    if (window.DeleteMilestoneModal) {
        window.DeleteMilestoneModal.close();
    }
}

function confirmDeleteMilestone() {
    if (window.DeleteMilestoneModal) {
        window.DeleteMilestoneModal.confirm();
    }
}

// Register modal click handler for delete milestone modal
if (typeof window.modalClickHandlers === 'undefined') {
    window.modalClickHandlers = [];
}
window.modalClickHandlers.push(function(event) {
    const deleteMilestoneModal = document.getElementById('deleteMilestoneModal');
    if (event.target == deleteMilestoneModal) {
        closeDeleteMilestoneModal();
    }
});

if (window.contractorProjects && Array.isArray(window.contractorProjects)) {
    window.contractorProjects.forEach(function(project) {
        if (project && project.project_id) {
            projectDetailsMap[String(project.project_id)] = project;
        }
    });
}

// MILESTONE SETUP FUNCTIONS
function showMilestoneError(message) {
    let errorDiv = document.getElementById('milestoneErrorMessages');
    errorDiv.innerHTML = '<p>' + message + '</p>';
    errorDiv.style.display = 'block';
    document.getElementById('milestoneSuccessMessages').style.display = 'none';
}

function showMilestoneSuccess(message) {
    let successDiv = document.getElementById('milestoneSuccessMessages');
    successDiv.innerHTML = '<p>' + message + '</p>';
    successDiv.style.display = 'block';
    document.getElementById('milestoneErrorMessages').style.display = 'none';
}

function hideAllSteps() {
    let steps = document.querySelectorAll('.step-container');
    steps.forEach(function(step) {
        step.style.display = 'none';
    });
}

function showStep(stepId) {
    let targetStep = document.getElementById(stepId);
    if (!targetStep) {
        return;
    }
    hideAllSteps();
    targetStep.style.display = 'block';
    document.getElementById('milestoneErrorMessages').style.display = 'none';
    document.getElementById('milestoneSuccessMessages').style.display = 'none';
}

function goBackFromFirstStep() {
    window.history.back();
}

function renderMilestoneItems() {
    const listContainer = document.getElementById('milestoneItemsList');
    const totalDisplay = document.getElementById('totalPercentageDisplay');
    listContainer.innerHTML = '';

    if (milestoneItems.length === 0) {
        totalDisplay.textContent = '0';
        return;
    }

    let total = 0;
    const list = document.createElement('div');

    milestoneItems.forEach(function(item, index) {
        total += item.percentage;
        const itemDiv = document.createElement('div');
        itemDiv.style.borderTop = '1px solid #ccc';
        itemDiv.style.padding = '8px 0';
        itemDiv.innerHTML = '<p><strong>Order ' + (index + 1) + ':</strong> ' + item.percentage + '% - ' + item.title + '</p>' +
            '<p>' + item.description + '</p>' +
            '<p>Finish by: ' + item.date_to_finish + '</p>' +
            '<div style="margin-top: 8px;">' +
            '<button type="button" onclick="editMilestoneItem(' + index + ')" style="margin-right: 8px; background-color: #1877f2; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Edit</button>' +
            '<button type="button" onclick="removeMilestoneItem(' + index + ')" style="background-color: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Remove</button>' +
            '</div>';
        list.appendChild(itemDiv);
    });

    listContainer.appendChild(list);
    totalDisplay.textContent = total.toFixed(2).replace(/\.00$/, '');
}

function removeMilestoneItem(index) {
    milestoneItems.splice(index, 1);
    if (editingIndex === index) {
        editingIndex = null;
        resetMilestoneItemForm();
    } else if (editingIndex > index) {
        editingIndex = editingIndex - 1;
    }
    renderMilestoneItems();
}

function editMilestoneItem(index) {
    if (index < 0 || index >= milestoneItems.length) {
        return;
    }
    
    const item = milestoneItems[index];
    editingIndex = index;
    
    // Populate form fields
    document.getElementById('item_percentage').value = item.percentage;
    document.getElementById('item_title').value = item.title;
    document.getElementById('item_description').value = item.description;
    document.getElementById('item_date').value = item.date_to_finish;
    
    // Change button text
    const addButton = document.getElementById('addMilestoneItemButton');
    if (addButton) {
        addButton.textContent = 'Update Milestone Item';
    }
    
    // Scroll to form
    const form = document.getElementById('milestoneItemForm');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function resetMilestoneItemForm() {
    document.getElementById('item_percentage').value = '';
    document.getElementById('item_title').value = '';
    document.getElementById('item_description').value = '';
    document.getElementById('item_date').value = '';
    
    const addButton = document.getElementById('addMilestoneItemButton');
    if (addButton) {
        addButton.textContent = 'Add Milestone Item';
    }
    
    editingIndex = null;
}

function populateEditForm() {
    if (!window.existingMilestone) return;
    
    const milestone = window.existingMilestone;
    
    // Populate Step 1 fields
    const projectSelect = document.getElementById('project_id');
    if (projectSelect && milestone.project_id) {
        projectSelect.value = milestone.project_id;
        // Trigger change event to update project description
        const changeEvent = new Event('change', { bubbles: true });
        projectSelect.dispatchEvent(changeEvent);
        // Also manually update project description
        updateProjectDescription(milestone.project_id);
    }
    
    if (document.getElementById('milestone_name')) {
        document.getElementById('milestone_name').value = milestone.milestone_name || '';
    }
    
    if (document.getElementById('payment_mode')) {
        document.getElementById('payment_mode').value = milestone.payment_mode || '';
        // Update downpayment container visibility
        const downpaymentContainer = document.getElementById('downpaymentContainer');
        if (downpaymentContainer) {
            downpaymentContainer.style.display = milestone.payment_mode === 'downpayment' ? 'block' : 'none';
        }
    }
    
    // Populate Step 2 fields (will be populated when step 2 is shown)
    if (milestone.start_date && document.getElementById('start_date')) {
        const startDate = new Date(milestone.start_date);
        document.getElementById('start_date').value = startDate.toISOString().split('T')[0];
    }
    if (milestone.end_date && document.getElementById('end_date')) {
        const endDate = new Date(milestone.end_date);
        document.getElementById('end_date').value = endDate.toISOString().split('T')[0];
    }
    if (milestone.total_project_cost && document.getElementById('total_project_cost')) {
        document.getElementById('total_project_cost').value = milestone.total_project_cost;
    }
    if (milestone.downpayment_amount && document.getElementById('downpayment_amount')) {
        document.getElementById('downpayment_amount').value = milestone.downpayment_amount;
    }
    
    // Populate Step 3 items (will be populated when step 3 is shown)
    if (window.existingItems && window.existingItems.length > 0) {
        milestoneItems = window.existingItems.map(function(item) {
            const dateStr = item.date_to_finish ? item.date_to_finish.split(' ')[0] : '';
            return {
                percentage: parseFloat(item.percentage_progress),
                title: item.milestone_item_title,
                description: item.milestone_item_description || '',
                date_to_finish: dateStr
            };
        });
        renderMilestoneItems();
    }
}

function updateProjectDescription(projectId) {
    const container = document.getElementById('selectedProjectDetails');
    const descriptionText = document.getElementById('projectDescriptionText');
    if (!container || !descriptionText) {
        return;
    }

    const project = projectDetailsMap[String(projectId)] || null;
    if (project) {
        descriptionText.textContent = project.project_description || 'No description provided.';
        container.style.display = 'block';
    } else {
        descriptionText.textContent = '';
        container.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const step1Form = document.getElementById('milestoneStep1Form');
    const step2Form = document.getElementById('milestoneStep2Form');
    const addItemButton = document.getElementById('addMilestoneItemButton');
    const submitMilestoneButton = document.getElementById('submitMilestoneButton');
    const downpaymentContainer = document.getElementById('downpaymentContainer');
    const projectSelect = document.getElementById('project_id');
    
    // Build project details map for updateProjectDescription
    if (window.contractorProjects && Array.isArray(window.contractorProjects)) {
        window.contractorProjects.forEach(function(project) {
            projectDetailsMap[String(project.project_id)] = project;
        });
    }
    
    // If editing, populate form on page load
    if (window.isEditingMilestone && window.existingMilestone) {
        populateEditForm();
    }

    if (projectSelect) {
        projectSelect.addEventListener('change', function() {
            updateProjectDescription(projectSelect.value);
        });
        // Update project description for initial value (including when editing)
        if (projectSelect.value) {
            updateProjectDescription(projectSelect.value);
        }
    }

    if (step1Form) {
        step1Form.addEventListener('submit', function(e) {
            e.preventDefault();
            const projectId = document.getElementById('project_id').value;
            const milestoneName = document.getElementById('milestone_name').value.trim();
            const paymentMode = document.getElementById('payment_mode').value;

            if (!projectId || !milestoneName || !paymentMode) {
                showMilestoneError('Please complete all required fields.');
                return;
            }

            const formData = new FormData(step1Form);
            
            // If editing, include milestone_id
            if (window.isEditingMilestone && window.existingMilestone && window.existingMilestone.milestone_id) {
                formData.append('milestone_id', window.existingMilestone.milestone_id);
            }

            fetch('/contractor/milestone/setup/step1', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                body: formData
            })
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    const newStep1State = {
                        project_id: projectId,
                        milestone_name: milestoneName,
                        payment_mode: paymentMode
                    };

                    const projectChanged = !step1State || step1State.project_id !== newStep1State.project_id;
                    const paymentModeChanged = !step1State || step1State.payment_mode !== newStep1State.payment_mode;

                    if (projectChanged || paymentModeChanged) {
                        milestoneItems = [];
                        editingIndex = null;
                        resetMilestoneItemForm();
                        renderMilestoneItems();
                    }

                    step1State = newStep1State;
                    step2State = null;
                    selectedPaymentMode = data.payment_mode;
                    downpaymentContainer.style.display = selectedPaymentMode === 'downpayment' ? 'block' : 'none';
                    
                    // If editing, populate step 2 fields
                    if (window.isEditingMilestone && window.existingMilestone) {
                        const milestone = window.existingMilestone;
                        if (milestone.start_date && document.getElementById('start_date')) {
                            const startDate = new Date(milestone.start_date);
                            document.getElementById('start_date').value = startDate.toISOString().split('T')[0];
                        }
                        if (milestone.end_date && document.getElementById('end_date')) {
                            const endDate = new Date(milestone.end_date);
                            document.getElementById('end_date').value = endDate.toISOString().split('T')[0];
                        }
                        if (milestone.total_project_cost && document.getElementById('total_project_cost')) {
                            document.getElementById('total_project_cost').value = milestone.total_project_cost;
                        }
                        if (milestone.downpayment_amount && document.getElementById('downpayment_amount')) {
                            document.getElementById('downpayment_amount').value = milestone.downpayment_amount;
                        }
                    }
                    
                    showStep('milestoneStep2');
                } else {
                    const errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : 'An error occurred.';
                    showMilestoneError(errorMessage);
                }
            })
            .catch(function() {
                showMilestoneError('Network error. Please try again.');
            });
        });
    }

    if (step2Form) {
        step2Form.addEventListener('submit', function(e) {
            e.preventDefault();
            const startDate = document.getElementById('start_date').value;
            const endDate = document.getElementById('end_date').value;
            const totalCost = document.getElementById('total_project_cost').value;
            const downpaymentInput = document.getElementById('downpayment_amount');

            if (!startDate || !endDate || !totalCost) {
                showMilestoneError('Please fill in the required fields.');
                return;
            }

            if (selectedPaymentMode === 'downpayment') {
                if (!downpaymentInput.value) {
                    showMilestoneError('Downpayment amount is required for downpayment plan.');
                    return;
                }
                if (parseFloat(downpaymentInput.value) >= parseFloat(totalCost)) {
                    showMilestoneError('Downpayment must be less than the total project cost.');
                    return;
                }
            }

            const formData = new FormData(step2Form);

            fetch('/contractor/milestone/setup/step2', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                body: formData
            })
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    const downpaymentValue = downpaymentInput ? downpaymentInput.value : '';
                    const parsedDownpayment = selectedPaymentMode === 'downpayment' ? parseFloat(downpaymentValue) : null;
                    if (selectedPaymentMode === 'downpayment' && isNaN(parsedDownpayment)) {
                        parsedDownpayment = null;
                    }

                    const newStep2State = {
                        start_date: data.start_date,
                        end_date: data.end_date,
                        total_cost: parseFloat(totalCost),
                        downpayment: parsedDownpayment
                    };

                    const shouldResetItems = true;
                    if (step2State &&
                        step2State.start_date === newStep2State.start_date &&
                        step2State.end_date === newStep2State.end_date &&
                        step2State.total_cost === newStep2State.total_cost &&
                        ((step2State.downpayment === null && newStep2State.downpayment === null) ||
                            step2State.downpayment === newStep2State.downpayment)) {
                        shouldResetItems = false;
                    }

                    step2State = newStep2State;
                    startDateLimit = data.start_date;
                    endDateLimit = data.end_date;

                    if (shouldResetItems) {
                        milestoneItems = [];
                        editingIndex = null;
                        resetMilestoneItemForm();
                    }
                    
                    // If editing and items haven't been loaded yet, populate them
                    if (window.isEditingMilestone && window.existingItems && window.existingItems.length > 0 && milestoneItems.length === 0) {
                        milestoneItems = window.existingItems.map(function(item) {
                            const dateStr = item.date_to_finish ? item.date_to_finish.split(' ')[0] : '';
                            return {
                                percentage: parseFloat(item.percentage_progress),
                                title: item.milestone_item_title,
                                description: item.milestone_item_description || '',
                                date_to_finish: dateStr
                            };
                        });
                    }

                    renderMilestoneItems();
                    showStep('milestoneStep3');
                } else {
                    const errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : 'An error occurred.';
                    showMilestoneError(errorMessage);
                }
            })
            .catch(function() {
                showMilestoneError('Network error. Please try again.');
            });
        });
    }

    if (addItemButton) {
        addItemButton.addEventListener('click', function() {
            const percentageField = document.getElementById('item_percentage');
            const titleField = document.getElementById('item_title');
            const descriptionField = document.getElementById('item_description');
            const dateField = document.getElementById('item_date');

            const percentage = parseFloat(percentageField.value);
            const title = titleField.value.trim();
            const description = descriptionField.value.trim();
            const dateValue = dateField.value;

            if (!percentage || !title || !description || !dateValue) {
                showMilestoneError('Please complete all milestone item fields before adding.');
                return;
            }

            if (percentage <= 0) {
                showMilestoneError('Percentage must be greater than zero.');
                return;
            }

            // Calculate current total, excluding the item being edited
            const currentTotal = milestoneItems.reduce(function(total, item, index) {
                if (editingIndex !== null && index === editingIndex) {
                    return total; // Exclude the item being edited
                }
                return total + item.percentage;
            }, 0);

            if (currentTotal + percentage > 100) {
                showMilestoneError('Total percentage cannot exceed 100%.');
                return;
            }

            if (startDateLimit && dateValue < startDateLimit) {
                showMilestoneError('Milestone item date cannot be before the project start date.');
                return;
            }

            if (endDateLimit && dateValue > endDateLimit) {
                showMilestoneError('Milestone item date cannot be after the project end date.');
                return;
            }

            // If editing, update the existing item; otherwise, add a new one
            if (editingIndex !== null && editingIndex >= 0 && editingIndex < milestoneItems.length) {
                // Update existing item
                milestoneItems[editingIndex] = {
                    percentage: percentage,
                    title: title,
                    description: description,
                    date_to_finish: dateValue
                };
                showMilestoneSuccess('Milestone item updated.');
            } else {
                // Add new item
                milestoneItems.push({
                    percentage: percentage,
                    title: title,
                    description: description,
                    date_to_finish: dateValue
                });
                showMilestoneSuccess('Milestone item added.');
            }

            resetMilestoneItemForm();
            renderMilestoneItems();
        });
    }

    if (submitMilestoneButton) {
        submitMilestoneButton.addEventListener('click', function() {
            if (milestoneItems.length === 0) {
                showMilestoneError('Please add at least one milestone item.');
                return;
            }

            const total = milestoneItems.reduce(function(total, item) {
                return total + item.percentage;
            }, 0);

            if (Math.round(total * 100) / 100 !== 100) {
                showMilestoneError('Milestone percentages must add up to exactly 100%.');
                return;
            }

            const lastItem = milestoneItems[milestoneItems.length - 1];
            if (endDateLimit && lastItem.date_to_finish !== endDateLimit) {
                showMilestoneError('The last milestone item must finish on the project end date.');
                return;
            }

            const formData = new FormData();
            formData.append('items', JSON.stringify(milestoneItems));
            
            // If editing, include milestone_id
            if (window.isEditingMilestone && window.existingMilestone && window.existingMilestone.milestone_id) {
                formData.append('milestone_id', window.existingMilestone.milestone_id);
            }

            fetch('/contractor/milestone/setup/submit', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                body: formData
            })
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.success) {
                    showMilestoneSuccess(data.message);
                    setTimeout(function() {
                        window.location.href = data.redirect || '/dashboard';
                    }, 1500);
                } else {
                    const errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : 'An error occurred.';
                    showMilestoneError(errorMessage);
                }
            })
            .catch(function() {
                showMilestoneError('Network error. Please try again.');
            });
        });
    }
});

// Disputes page functionality
// Pre-fill form from URL parameters (when coming from project details page)
function initializeDisputeForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project_id');

    if (projectId) {
        const projectSelect = document.getElementById('project_id');
        if (projectSelect) {
            projectSelect.value = projectId;

            // Trigger change event to load milestones
            // The milestone and milestone item will be auto-selected by both.js
            const event = new Event('change');
            projectSelect.dispatchEvent(event);

            // Scroll to the form
            const disputeForm = document.getElementById('fileDisputeForm');
            if (disputeForm) {
                setTimeout(() => {
                    disputeForm.scrollIntoView({ behavior: 'smooth' });
                }, 800);
            }
        }
    }
}

// Multiple file upload functionality
function handleFileSelection(input) {
    const addMoreBtn = document.getElementById('add-more-files');
    const container = document.getElementById('file-upload-container');

    if (!addMoreBtn || !container) return;

    const fileInputs = container.querySelectorAll('.evidence-file-input');

    // Check if any file is selected in any input
    let hasFiles = false;
    fileInputs.forEach(fileInput => {
        if (fileInput.files.length > 0) {
            hasFiles = true;
        }
    });

    // Show/hide Add More Files button based on file selection
    if (hasFiles) {
        addMoreBtn.style.display = 'inline-block';
    } else {
        addMoreBtn.style.display = 'none';
    }

    updateRemoveButtons();
}

function addMoreFiles() {
    const container = document.getElementById('file-upload-container');
    if (!container) return;

    const fileInputs = container.querySelectorAll('.file-input-group');

    // Limit to 10 files
    if (fileInputs.length >= 10) {
        alert('Maximum 10 files allowed');
        return;
    }

    // Create a hidden file input to trigger file selection
    const hiddenFileInput = document.createElement('input');
    hiddenFileInput.type = 'file';
    hiddenFileInput.accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx';
    hiddenFileInput.style.display = 'none';

    // When file is selected, create the actual file input group
    hiddenFileInput.onchange = function() {
        if (this.files.length > 0) {
            const selectedFile = this.files[0];

            const newFileGroup = document.createElement('div');
            newFileGroup.className = 'file-input-group';

            // Create file input and set the selected file
            const newInput = document.createElement('input');
            newInput.type = 'file';
            newInput.name = 'evidence_files[]';
            newInput.accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx';
            newInput.className = 'evidence-file-input';
            newInput.onchange = function() { handleFileSelection(this); };

            // Use DataTransfer to set the file
            const dt = new DataTransfer();
            dt.items.add(selectedFile);
            newInput.files = dt.files;

            // Create remove button
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-file-btn';
            removeBtn.textContent = 'Remove';
            removeBtn.onclick = function() { removeFileInput(this); };

            // Add elements to the group
            newFileGroup.appendChild(newInput);
            newFileGroup.appendChild(removeBtn);

            container.appendChild(newFileGroup);
            updateRemoveButtons();
            handleFileSelection(newInput);
        }
    };

    // Trigger the file selection dialog
    hiddenFileInput.click();
}

function removeFileInput(button) {
    const container = document.getElementById('file-upload-container');
    if (!container) return;

    const fileGroup = button.parentElement;
    const fileGroups = container.querySelectorAll('.file-input-group');
    const isFirstInput = Array.from(fileGroups).indexOf(fileGroup) === 0;

    if (isFirstInput && fileGroups.length === 1) {
        // If this is the only (first) input, just clear it instead of removing
        const fileInput = fileGroup.querySelector('.evidence-file-input');
        fileInput.value = '';
    } else {
        // Remove the file group if it's not the first or there are multiple inputs
        container.removeChild(fileGroup);
    }

    // Check if we still have files selected after removal
    const fileInputs = container.querySelectorAll('.evidence-file-input');
    let hasFiles = false;
    fileInputs.forEach(fileInput => {
        if (fileInput.files.length > 0) {
            hasFiles = true;
        }
    });

    // Hide Add More Files button if no files are selected
    const addMoreBtn = document.getElementById('add-more-files');
    if (addMoreBtn && !hasFiles) {
        addMoreBtn.style.display = 'none';
    }

    updateRemoveButtons();
}

function updateRemoveButtons() {
    const container = document.getElementById('file-upload-container');
    if (!container) return;

    const fileGroups = container.querySelectorAll('.file-input-group');

    fileGroups.forEach((group, index) => {
        const removeBtn = group.querySelector('.remove-file-btn');
        const fileInput = group.querySelector('.evidence-file-input');

        if (!removeBtn || !fileInput) return;

        // Show remove button if:
        // 1. There's more than one file input, OR
        // 2. This is the first input and it has a file selected
        const hasFile = fileInput.files.length > 0;
        const isFirstInput = index === 0;
        const shouldShowRemove = fileGroups.length > 1 || (isFirstInput && hasFile);

        removeBtn.style.display = shouldShowRemove ? 'inline-block' : 'none';
    });
}

// Approve Payment Modal Functions
if (typeof window.ApprovePaymentModal === 'undefined') {
    window.ApprovePaymentModal = {
        paymentId: null,

        open: function(paymentId) {
            this.paymentId = paymentId;
            document.getElementById('approve_payment_id').value = paymentId;
            document.getElementById('approvePaymentModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            document.getElementById('approvePaymentErrorMessage').style.display = 'none';
            document.getElementById('approvePaymentSuccessMessage').style.display = 'none';
        },

        close: function() {
            document.getElementById('approvePaymentModal').style.display = 'none';
            document.body.style.overflow = '';
            this.paymentId = null;
            document.getElementById('approve_payment_id').value = '';
            document.getElementById('approvePaymentErrorMessage').style.display = 'none';
            document.getElementById('approvePaymentSuccessMessage').style.display = 'none';
        },

        confirm: async function() {
            if (!this.paymentId) {
                return;
            }

            const confirmBtn = document.getElementById('confirmApprovePaymentBtn');
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Approving...';

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                document.getElementById('approvePaymentErrorMessage').textContent = 'CSRF token not found. Please refresh the page.';
                document.getElementById('approvePaymentErrorMessage').style.display = 'block';
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Approve Payment';
                return;
            }

            try {
                const response = await fetch(`/contractor/payments/${this.paymentId}/approve`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    document.getElementById('approvePaymentSuccessMessage').textContent = data.message;
                    document.getElementById('approvePaymentSuccessMessage').style.display = 'block';
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    document.getElementById('approvePaymentErrorMessage').textContent = data.message || 'An error occurred while approving the payment.';
                    document.getElementById('approvePaymentErrorMessage').style.display = 'block';
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Approve Payment';
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('approvePaymentErrorMessage').textContent = 'An error occurred while approving the payment. Please try again.';
                document.getElementById('approvePaymentErrorMessage').style.display = 'block';
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Approve Payment';
            }
        }
    };
}

// Global functions for approve payment modal
function openApprovePaymentModal(paymentId) {
    if (window.ApprovePaymentModal) {
        window.ApprovePaymentModal.open(paymentId);
    }
}

function closeApprovePaymentModal() {
    if (window.ApprovePaymentModal) {
        window.ApprovePaymentModal.close();
    }
}

function confirmApprovePayment() {
    if (window.ApprovePaymentModal) {
        window.ApprovePaymentModal.confirm();
    }
}

// Cancel Bid Modal Functions
if (typeof window.CancelBidModal === 'undefined') {
    window.CancelBidModal = {
        bidId: null,

        open: function() {
            // Get bid ID from window variable or hidden input
            if (window.existingBid && window.existingBid.bid_id) {
                this.bidId = window.existingBid.bid_id;
            } else {
                const bidIdInput = document.getElementById('bid_id');
                if (bidIdInput && bidIdInput.value) {
                    this.bidId = parseInt(bidIdInput.value);
                }
            }

            if (!this.bidId) {
                const errorMsg = document.getElementById('cancelBidErrorMessage');
                if (errorMsg) {
                    errorMsg.textContent = 'Bid ID not found.';
                    errorMsg.style.display = 'block';
                }
                return;
            }

            const modal = document.getElementById('cancelBidModal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }

            const errorMsg = document.getElementById('cancelBidErrorMessage');
            const successMsg = document.getElementById('cancelBidSuccessMessage');
            if (errorMsg) errorMsg.style.display = 'none';
            if (successMsg) successMsg.style.display = 'none';
        },

        close: function() {
            const modal = document.getElementById('cancelBidModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
            this.bidId = null;

            const errorMsg = document.getElementById('cancelBidErrorMessage');
            const successMsg = document.getElementById('cancelBidSuccessMessage');
            if (errorMsg) errorMsg.style.display = 'none';
            if (successMsg) successMsg.style.display = 'none';
        },

        confirm: async function() {
            if (!this.bidId) {
                const errorMsg = document.getElementById('cancelBidErrorMessage');
                if (errorMsg) {
                    errorMsg.textContent = 'Bid ID not found.';
                    errorMsg.style.display = 'block';
                }
                return;
            }

            const confirmBtn = document.getElementById('confirmCancelBtn');
            if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Canceling...';
            }

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                const errorMsg = document.getElementById('cancelBidErrorMessage');
                if (errorMsg) {
                    errorMsg.textContent = 'CSRF token not found. Please refresh the page.';
                    errorMsg.style.display = 'block';
                }
                if (confirmBtn) {
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Yes, Cancel Bid';
                }
                return;
            }

            try {
                const response = await fetch(`/contractor/bids/${this.bidId}/cancel`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    const successMsg = document.getElementById('cancelBidSuccessMessage');
                    if (successMsg) {
                        successMsg.textContent = data.message;
                        successMsg.style.display = 'block';
                    }
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    const errorMsg = document.getElementById('cancelBidErrorMessage');
                    if (errorMsg) {
                        errorMsg.textContent = data.message || 'An error occurred while canceling the bid.';
                        errorMsg.style.display = 'block';
                    }
                    if (confirmBtn) {
                        confirmBtn.disabled = false;
                        confirmBtn.textContent = 'Yes, Cancel Bid';
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                const errorMsg = document.getElementById('cancelBidErrorMessage');
                if (errorMsg) {
                    errorMsg.textContent = 'An error occurred while canceling the bid. Please try again.';
                    errorMsg.style.display = 'block';
                }
                if (confirmBtn) {
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Yes, Cancel Bid';
                }
            }
        }
    };

    // Global functions for cancel bid modal
    window.openCancelBidModal = function() {
        if (window.CancelBidModal) {
            window.CancelBidModal.open();
        }
    };

    window.closeCancelBidModal = function() {
        if (window.CancelBidModal) {
            window.CancelBidModal.close();
        }
    };

    window.confirmCancelBid = function() {
        if (window.CancelBidModal) {
            window.CancelBidModal.confirm();
        }
    };

    // Register modal click handler
    if (typeof window.modalClickHandlers === 'undefined') {
        window.modalClickHandlers = [];
    }
    window.modalClickHandlers.push(function(event) {
        const cancelBidModal = document.getElementById('cancelBidModal');
        if (event.target === cancelBidModal) {
            closeCancelBidModal();
        }
    });
}

// Initialize dispute form when page loads (only if on disputes page)
if (typeof window !== 'undefined') {
    function initDisputesIfPresent() {
        // Only initialize if we're on the disputes page
        if (document.getElementById('fileDisputeForm')) {
            initializeDisputeForm();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDisputesIfPresent);
    } else {
        initDisputesIfPresent();
    }

    // PROGRESS UPLOAD FUNCTIONS
}

// Project Details page - Progress functions
function openProgressUploadModal(itemId, projectId, itemTitle) {
    if (typeof ProgressModal !== 'undefined') {
        ProgressModal.open('add', {
            item_id: itemId,
            project_id: projectId,
            item_title: itemTitle
        });
    }
}

function editProgress(progressId) {
    fetch(`/contractor/progress/files/0?progress_id=${progressId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const progressData = data.data;
                // Transform data to match modal expectations
                const modalData = {
                    progress_id: progressData.progress_id || progressId,
                    item_id: progressData.item_id,
                    project_id: progressData.project_id,
                    item_title: progressData.item_title,
                    purpose: progressData.purpose,
                    files: progressData.files || []
                };
                if (typeof ProgressModal !== 'undefined') {
                    ProgressModal.open('edit', modalData);
                }
            } else {
                alert('Error loading progress: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading progress');
        });
}

function deleteProgress(progressId) {
    if (typeof ProgressDelete !== 'undefined') {
        ProgressDelete.open(progressId);
    }
}
