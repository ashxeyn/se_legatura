<div id="approveMilestoneModal" class="modal">
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
            <h2>Approve Milestone</h2>
            <span class="close" onclick="closeApproveMilestoneModal()">&times;</span>
        </div>
        <div class="modal-body">
            <div id="approveMilestoneErrorMessage" class="error-message" style="display:none;"></div>
            <div id="approveMilestoneSuccessMessage" class="success-message" style="display:none;"></div>

            <p style="margin-bottom: 15px;">Are you sure you want to approve this milestone setup? Once approved, the contractor can proceed with the project milestones.</p>

            <input type="hidden" id="approve_milestone_id" value="">
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="closeApproveMilestoneModal()">Cancel</button>
            <button type="button" class="btn btn-primary" id="confirmApproveMilestoneBtn" onclick="confirmApproveMilestone()">Approve Milestone</button>
        </div>
    </div>
</div>

