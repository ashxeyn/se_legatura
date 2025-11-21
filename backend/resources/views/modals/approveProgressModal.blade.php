<div id="approveProgressModal" class="modal">
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
            <h2>Approve Progress Report</h2>
            <span class="close" onclick="ProgressApprove.close()">&times;</span>
        </div>
        <div class="modal-body">
            <p style="margin-bottom: 20px; font-size: 16px;">
                Are you sure you want to approve this progress report?
            </p>
            <div id="approveProgressErrorMessage" class="error-message" style="display: none;"></div>
            <div id="approveProgressSuccessMessage" class="success-message" style="display: none;"></div>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="ProgressApprove.close()">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="ProgressApprove.confirm()">Yes, Approve</button>
        </div>
    </div>
</div>
