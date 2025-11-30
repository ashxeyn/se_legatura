<div id="paymentModal" class="modal">
    <div class="modal-content" style="max-width: 700px; display:flex; flex-direction:column; max-height:80vh;">
        <div class="modal-header">
            <h2 id="paymentModalTitle">Upload Payment Validation</h2>
            <span class="close" onclick="PaymentModal.close()">&times;</span>
        </div>
        <div class="modal-body" style="overflow:auto; padding-right:12px;">
            <div id="paymentModalErrorMessages" class="error-message" style="display:none;"></div>
            <div id="paymentModalSuccessMessages" class="success-message" style="display:none;"></div>

        <form id="paymentModalForm" enctype="multipart/form-data">
            <input type="hidden" id="payment_id" name="payment_id">
            <input type="hidden" id="payment_is_edit" value="0">

            <div class="form-group">
                <label for="payment_item_id">Milestone Item</label>
                <div id="payment_item_title" style="font-weight:600; padding: 10px; background: #f8f9fa; border-radius: 6px;"></div>
                <input type="hidden" id="payment_item_id" name="item_id">
                <input type="hidden" id="payment_project_id" name="project_id">
            </div>

            <div class="form-group">
                <label for="payment_amount">Amount <span class="required">*</span></label>
                <input type="number" id="payment_amount" name="amount" step="0.01" min="0" required>
            </div>

            <div class="form-group">
                <label for="payment_type">Payment Type <span class="required">*</span></label>
                <select id="payment_type" name="payment_type" required>
                    <option value="">Select Type</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="online_payment">Online Payment</option>
                </select>
            </div>

            <div class="form-group">
                <label for="transaction_number">Transaction Number (optional)</label>
                <input type="text" id="transaction_number" name="transaction_number">
            </div>

            <div class="form-group">
                <label for="transaction_date">Transaction Date</label>
                <input type="date" id="transaction_date" name="transaction_date">
            </div>

            <div class="form-group">
                <label id="paymentFilesLabel">Receipt / Proof <span class="required">*</span></label>
                <div id="payment-file-upload-container">
                    <div id="existingReceiptSection" style="display:none; margin-bottom:8px;">
                        <div id="existingReceiptLink" style="margin-bottom:6px;"></div>
                        <button type="button" id="chooseFileAgainBtn" class="btn btn-secondary">Choose file again</button>
                    </div>

                    <div class="file-input-group">
                        <input type="file" name="receipt_photo" accept=".jpg,.jpeg,.png,.pdf" class="evidence-file-input">
                    </div>
                </div>
            </div>

        </div>
        <div class="modal-actions" style="position:sticky; bottom:0; background:#fff; padding:12px 16px; display:flex; gap:8px; justify-content:flex-end; border-top:1px solid #e9ecef;">
            <button type="button" class="btn btn-secondary" id="paymentCancelBtn" onclick="PaymentModal.close()">Cancel</button>
            <button type="submit" class="btn btn-primary" id="paymentSubmitBtn">Upload Payment</button>
        </div>
        </form>
    </div>
</div>
