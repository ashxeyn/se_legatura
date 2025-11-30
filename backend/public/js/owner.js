// Owner-specific JavaScript functions

// Accept Bid Modal functionality
if (typeof window.AcceptBidModal === 'undefined') {
    window.AcceptBidModal = {
        selectedBidId: null,
        projectId: null,

        open: function(bidId, companyName, proposedCost, projectId) {
            this.selectedBidId = bidId;
            this.projectId = projectId;

            const companyNameEl = document.getElementById('acceptBidCompanyName');
            const costEl = document.getElementById('acceptBidCost');
            const modal = document.getElementById('acceptBidModal');

            if (companyNameEl) companyNameEl.textContent = companyName;
            if (costEl) {
                costEl.textContent = proposedCost.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }

            if (modal) {
                modal.style.display = 'block';
                const errorMsg = document.getElementById('acceptBidErrorMessage');
                const successMsg = document.getElementById('acceptBidSuccessMessage');
                if (errorMsg) errorMsg.style.display = 'none';
                if (successMsg) successMsg.style.display = 'none';
            }
        },

        close: function() {
            const modal = document.getElementById('acceptBidModal');
            if (modal) {
                modal.style.display = 'none';
            }
            this.selectedBidId = null;
            this.projectId = null;

            const errorMsg = document.getElementById('acceptBidErrorMessage');
            const successMsg = document.getElementById('acceptBidSuccessMessage');
            if (errorMsg) errorMsg.style.display = 'none';
            if (successMsg) successMsg.style.display = 'none';
        },

        confirm: async function() {
            if (!this.selectedBidId || !this.projectId) {
                return;
            }

            const confirmBtn = document.getElementById('confirmAcceptBtn');
            const errorMsg = document.getElementById('acceptBidErrorMessage');
            const successMsg = document.getElementById('acceptBidSuccessMessage');

            if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Processing...';
            }

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                if (errorMsg) {
                    errorMsg.textContent = 'CSRF token not found. Please refresh the page.';
                    errorMsg.style.display = 'block';
                }
                if (confirmBtn) {
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Yes, Select This Contractor';
                }
                return;
            }

            try {
                const response = await fetch(`/owner/projects/${this.projectId}/bids/${this.selectedBidId}/accept`, {
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
                    if (successMsg) {
                        successMsg.textContent = data.message;
                        successMsg.style.display = 'block';
                    }
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    if (errorMsg) {
                        errorMsg.textContent = data.message || 'An error occurred while accepting the bid.';
                        errorMsg.style.display = 'block';
                    }
                    if (confirmBtn) {
                        confirmBtn.disabled = false;
                        confirmBtn.textContent = 'Yes, Select This Contractor';
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                if (errorMsg) {
                    errorMsg.textContent = 'An error occurred while accepting the bid. Please try again.';
                    errorMsg.style.display = 'block';
                }
                if (confirmBtn) {
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Yes, Select This Contractor';
                }
            }
        }
    };

    // Close modal when clicking outside - register handler
    if (typeof window.modalClickHandlers === 'undefined') {
        window.modalClickHandlers = [];

        // Initialize the global click handler if not already set up
        if (!window.modalClickHandlerInitialized) {
            window.addEventListener('click', function(event) {
                if (window.modalClickHandlers && window.modalClickHandlers.length > 0) {
                    window.modalClickHandlers.forEach(function(handler) {
                        handler(event);
                    });
                }
            });
            window.modalClickHandlerInitialized = true;
        }
    }

    window.modalClickHandlers.push(function(event) {
        const acceptBidModal = document.getElementById('acceptBidModal');
        if (event.target === acceptBidModal) {
            window.AcceptBidModal.close();
        }
    });
}

// Approve Milestone Modal functionality
if (typeof window.ApproveMilestoneModal === 'undefined') {
    window.ApproveMilestoneModal = {
        milestoneId: null,

        open: function(milestoneId) {
            this.milestoneId = milestoneId;
            document.getElementById('approve_milestone_id').value = milestoneId;
            document.getElementById('approveMilestoneModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            document.getElementById('approveMilestoneErrorMessage').style.display = 'none';
            document.getElementById('approveMilestoneSuccessMessage').style.display = 'none';
        },

        close: function() {
            document.getElementById('approveMilestoneModal').style.display = 'none';
            document.body.style.overflow = '';
            this.milestoneId = null;
            document.getElementById('approve_milestone_id').value = '';
            document.getElementById('approveMilestoneErrorMessage').style.display = 'none';
            document.getElementById('approveMilestoneSuccessMessage').style.display = 'none';
        },

        confirm: async function() {
            if (!this.milestoneId) {
                return;
            }

            const confirmBtn = document.getElementById('confirmApproveMilestoneBtn');
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Approving...';

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                document.getElementById('approveMilestoneErrorMessage').textContent = 'CSRF token not found. Please refresh the page.';
                document.getElementById('approveMilestoneErrorMessage').style.display = 'block';
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Approve Milestone';
                return;
            }

            try {
                const response = await fetch(`/owner/milestones/${this.milestoneId}/approve`, {
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
                    document.getElementById('approveMilestoneSuccessMessage').textContent = data.message;
                    document.getElementById('approveMilestoneSuccessMessage').style.display = 'block';
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    document.getElementById('approveMilestoneErrorMessage').textContent = data.message || 'An error occurred while approving the milestone.';
                    document.getElementById('approveMilestoneErrorMessage').style.display = 'block';
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Approve Milestone';
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('approveMilestoneErrorMessage').textContent = 'An error occurred while approving the milestone. Please try again.';
                document.getElementById('approveMilestoneErrorMessage').style.display = 'block';
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Approve Milestone';
            }
        }
    };

    // Reject Milestone Modal functionality
    window.RejectMilestoneModal = {
        milestoneId: null,

        open: function(milestoneId) {
            this.milestoneId = milestoneId;
            document.getElementById('reject_milestone_id').value = milestoneId;
            document.getElementById('rejection_reason').value = '';
            document.getElementById('rejectMilestoneModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            document.getElementById('rejectMilestoneErrorMessage').style.display = 'none';
            document.getElementById('rejectMilestoneSuccessMessage').style.display = 'none';
        },

        close: function() {
            document.getElementById('rejectMilestoneModal').style.display = 'none';
            document.body.style.overflow = '';
            this.milestoneId = null;
            document.getElementById('reject_milestone_id').value = '';
            document.getElementById('rejection_reason').value = '';
            document.getElementById('rejectMilestoneErrorMessage').style.display = 'none';
            document.getElementById('rejectMilestoneSuccessMessage').style.display = 'none';
        },

        confirm: async function() {
            if (!this.milestoneId) {
                return;
            }

            const reason = document.getElementById('rejection_reason').value.trim();
            if (!reason) {
                document.getElementById('rejectMilestoneErrorMessage').textContent = 'Please provide a reason for rejection.';
                document.getElementById('rejectMilestoneErrorMessage').style.display = 'block';
                return;
            }

            const confirmBtn = document.getElementById('confirmRejectMilestoneBtn');
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Rejecting...';

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                document.getElementById('rejectMilestoneErrorMessage').textContent = 'CSRF token not found. Please refresh the page.';
                document.getElementById('rejectMilestoneErrorMessage').style.display = 'block';
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Reject Milestone';
                return;
            }

            try {
                const response = await fetch(`/owner/milestones/${this.milestoneId}/reject`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({
                        rejection_reason: reason
                    })
                });

                const data = await response.json();

                if (data.success) {
                    document.getElementById('rejectMilestoneSuccessMessage').textContent = data.message;
                    document.getElementById('rejectMilestoneSuccessMessage').style.display = 'block';
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    document.getElementById('rejectMilestoneErrorMessage').textContent = data.message || 'An error occurred while rejecting the milestone.';
                    document.getElementById('rejectMilestoneErrorMessage').style.display = 'block';
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Reject Milestone';
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('rejectMilestoneErrorMessage').textContent = 'An error occurred while rejecting the milestone. Please try again.';
                document.getElementById('rejectMilestoneErrorMessage').style.display = 'block';
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Reject Milestone';
            }
        }
    };

    // Global functions for milestone modals
    function openApproveMilestoneModal(milestoneId) {
        if (window.ApproveMilestoneModal) {
            window.ApproveMilestoneModal.open(milestoneId);
        }
    }

    function closeApproveMilestoneModal() {
        if (window.ApproveMilestoneModal) {
            window.ApproveMilestoneModal.close();
        }
    }

    function confirmApproveMilestone() {
        if (window.ApproveMilestoneModal) {
            window.ApproveMilestoneModal.confirm();
        }
    }

    function openRejectMilestoneModal(milestoneId) {
        if (window.RejectMilestoneModal) {
            window.RejectMilestoneModal.open(milestoneId);
        }
    }

    function closeRejectMilestoneModal() {
        if (window.RejectMilestoneModal) {
            window.RejectMilestoneModal.close();
        }
    }

    function confirmRejectMilestone() {
        if (window.RejectMilestoneModal) {
            window.RejectMilestoneModal.confirm();
        }
    }

    // Register modal click handlers
    if (typeof window.modalClickHandlers === 'undefined') {
        window.modalClickHandlers = [];
    }
    window.modalClickHandlers.push(function(event) {
        const approveMilestoneModal = document.getElementById('approveMilestoneModal');
        const rejectMilestoneModal = document.getElementById('rejectMilestoneModal');
        if (event.target === approveMilestoneModal) {
            closeApproveMilestoneModal();
        }
        if (event.target === rejectMilestoneModal) {
            closeRejectMilestoneModal();
        }
    });
}

// Dashboard functions
function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrfToken) {
            alert('CSRF token not found. Please refresh the page.');
            return;
        }

        fetch(`/owner/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                window.location.reload();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting the project.');
        });
    }
}

function viewContractorProfile(contractorId) {
    // For now, just show an alert with contractor info
    // You can implement a modal or redirect to a profile page later
    alert('Contractor profile view - ID: ' + contractorId + '\nThis feature can be implemented later.');
}

