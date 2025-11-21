<div id="rejectMilestoneModal" class="modal">
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
            <h2>Reject Milestone</h2>
            <span class="close" onclick="closeRejectMilestoneModal()">&times;</span>
        </div>
        <div class="modal-body">
            <div id="rejectMilestoneErrorMessage" class="error-message" style="display:none;"></div>
            <div id="rejectMilestoneSuccessMessage" class="success-message" style="display:none;"></div>

            <p style="margin-bottom: 15px;">Please provide a reason for rejecting this milestone setup.</p>

            <div class="form-group">
                <label for="rejection_reason">Rejection Reason <span class="required">*</span></label>
                <textarea id="rejection_reason" name="rejection_reason" rows="4" required placeholder="Please explain why you are rejecting this milestone setup..." maxlength="500"></textarea>
                <small style="color: #666; font-size: 12px;">Maximum 500 characters</small>
            </div>

            <input type="hidden" id="reject_milestone_id" value="">
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="closeRejectMilestoneModal()">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmRejectMilestoneBtn" onclick="confirmRejectMilestone()">Reject Milestone</button>
        </div>
    </div>
</div>

