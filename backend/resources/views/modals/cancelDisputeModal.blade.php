<div id="cancelDisputeModal" class="modal">
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
            <h2>Cancel Dispute</h2>
            <span class="close" onclick="DisputeCancel.close()">&times;</span>
        </div>
        <div class="modal-body">
            <p style="margin-bottom: 20px; font-size: 16px;">
                Are you sure you want to cancel this dispute? This action cannot be undone.
            </p>
            <div id="cancelDisputeErrorMessage" class="error-message" style="display: none;"></div>
            <div id="cancelDisputeSuccessMessage" class="success-message" style="display: none;"></div>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="DisputeCancel.close()">No, Keep It</button>
            <button type="button" class="btn btn-danger" onclick="DisputeCancel.confirm()">Yes, Cancel Dispute</button>
        </div>
    </div>
</div>
