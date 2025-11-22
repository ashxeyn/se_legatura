<div id="deleteMilestoneModal" class="modal">
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
            <h2>Delete Milestone</h2>
            <span class="close" onclick="closeDeleteMilestoneModal()">&times;</span>
        </div>
        <div class="modal-body">
            <div id="deleteMilestoneErrorMessage" class="error-message" style="display:none;"></div>
            <div id="deleteMilestoneSuccessMessage" class="success-message" style="display:none;"></div>

            <p style="margin-bottom: 15px;">Are you sure you want to delete this milestone? Please provide a reason for deletion.</p>

            <div class="form-group">
                <label for="reason">Deletion Reason <span class="required">*</span></label>
                <textarea id="reason" name="reason" rows="4" required placeholder="Please explain why you are deleting this milestone..." maxlength="500"></textarea>
                <small style="color: #666; font-size: 12px;">Maximum 500 characters</small>
            </div>

            <input type="hidden" id="delete_milestone_id" value="">
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="closeDeleteMilestoneModal()">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDeleteMilestoneBtn" onclick="confirmDeleteMilestone()">Delete Milestone</button>
        </div>
    </div>
</div>

