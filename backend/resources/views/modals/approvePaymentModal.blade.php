<div id="approvePaymentModal" class="modal">
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
            <h2>Approve Payment</h2>
            <span class="close" onclick="closeApprovePaymentModal()">&times;</span>
        </div>
        <div class="modal-body">
            <div id="approvePaymentErrorMessage" class="error-message" style="display:none;"></div>
            <div id="approvePaymentSuccessMessage" class="success-message" style="display:none;"></div>

            <p style="margin-bottom: 15px;">Are you sure you want to approve this payment validation? Once approved, the payment will be marked as completed.</p>

            <input type="hidden" id="approve_payment_id" value="">
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="closeApprovePaymentModal()">Cancel</button>
            <button type="button" class="btn btn-primary" id="confirmApprovePaymentBtn" onclick="confirmApprovePayment()">Approve Payment</button>
        </div>
    </div>
</div>

