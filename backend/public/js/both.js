// Get CSRF token from meta tag
function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

// Show error messages
function showErrors(errors) {
    const errorDiv = document.getElementById('errorMessages');
    const successDiv = document.getElementById('successMessages');

    successDiv.style.display = 'none';
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

// Show success messages
function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessages');
    const successDiv = document.getElementById('successMessages');

    errorDiv.style.display = 'none';
    successDiv.innerHTML = message;
    successDiv.style.display = 'block';
    window.scrollTo(0, 0);
}

// Validate dispute description
function validateDisputeDescription(description) {
    if (!description || description.trim() === '') {
        return 'Dispute description is required.';
    }
    if (description.length > 2000) {
        return 'Dispute description cannot exceed 2000 characters.';
    }
    return 'valid';
}

// Validate dispute type
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

// Validate file upload
function validateEvidenceFile(file) {
    if (!file) {
        return 'valid';
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    if (!allowedTypes.includes(file.type)) {
        return 'Evidence file must be JPG, JPEG, PNG, or PDF format.';
    }

    if (file.size > maxSize) {
        return 'Evidence file must not exceed 5MB.';
    }

    return 'valid';
}

// Character counter for dispute description
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
                milestoneSelect.innerHTML = '<option value="">Select Milestone (Optional)</option>';
            }
        });
    }

    // File dispute form submission
    const fileDisputeForm = document.getElementById('fileDisputeForm');
    if (fileDisputeForm) {
        fileDisputeForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const projectId = document.getElementById('project_id').value;
            const disputeType = document.getElementById('dispute_type').value;
            const disputeDesc = document.getElementById('dispute_desc').value;
            const evidenceFile = document.getElementById('evidence_file').files[0];
            const milestoneId = document.getElementById('milestone_id').value;

            // Client-side validation
            let errors = [];

            if (!projectId) {
                errors.push('Please select a project.');
            }

            const typeValidation = validateDisputeType(disputeType);
            if (typeValidation !== 'valid') {
                errors.push(typeValidation);
            }

            const descValidation = validateDisputeDescription(disputeDesc);
            if (descValidation !== 'valid') {
                errors.push(descValidation);
            }

            const fileValidation = validateEvidenceFile(evidenceFile);
            if (fileValidation !== 'valid') {
                errors.push(fileValidation);
            }

            if (errors.length > 0) {
                showErrors(errors);
                return;
            }

            // Prepare form data
            const formData = new FormData();
            formData.append('project_id', projectId);
            formData.append('dispute_type', disputeType);
            formData.append('dispute_desc', disputeDesc);

            if (milestoneId) {
                formData.append('milestone_id', milestoneId);
            }

            if (evidenceFile) {
                formData.append('evidence_file', evidenceFile);
            }

            // Submit form
            fetch('/both/disputes/file', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccess(data.message);
                    fileDisputeForm.reset();
                    document.getElementById('charCount').textContent = '0 / 2000 characters';

                    // Reload page to show new dispute in list
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                } else {
                    if (data.errors) {
                        showErrors(data.errors);
                    } else {
                        showErrors(data.message);
                    }
                }
            })
            .catch(error => {
                showErrors('An error occurred while submitting the dispute. Please try again.');
                console.error('Error:', error);
            });
        });
    }
});

// Load milestones for selected project
function loadMilestones(projectId) {
    const milestoneSelect = document.getElementById('milestone_id');

    fetch(`/both/disputes/milestones/${projectId}`, {
        method: 'GET',
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            milestoneSelect.innerHTML = '<option value="">Select Milestone (Optional)</option>';

            data.milestones.forEach(milestone => {
                const option = document.createElement('option');
                option.value = milestone.milestone_id;
                option.textContent = milestone.milestone_name;
                milestoneSelect.appendChild(option);
            });
        }
    })
    .catch(error => {
        console.error('Error loading milestones:', error);
    });
}

// Reset form
function resetForm() {
    document.getElementById('fileDisputeForm').reset();
    document.getElementById('charCount').textContent = '0 / 2000 characters';
    document.getElementById('milestone_id').innerHTML = '<option value="">Select Milestone (Optional)</option>';
    document.getElementById('errorMessages').style.display = 'none';
    document.getElementById('successMessages').style.display = 'none';
}
