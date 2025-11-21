<div id="deletePaymentModal" class="modal">
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
            <h2>Delete Payment Validation</h2>
            <span class="close" onclick="PaymentDelete.close()">&times;</span>
        </div>
        <div class="modal-body">
            <p style="margin-bottom: 20px; font-size: 16px;">
                Are you sure you want to delete this payment validation? This action cannot be undone.
            </p>
            <div id="deletePaymentErrorMessage" class="error-message" style="display: none;"></div>
            <div id="deletePaymentSuccessMessage" class="success-message" style="display: none;"></div>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="PaymentDelete.close()">No, Keep It</button>
            <button type="button" class="btn btn-danger" onclick="PaymentDelete.confirm()">Yes, Delete</button>
        </div>
    </div>
</div>
