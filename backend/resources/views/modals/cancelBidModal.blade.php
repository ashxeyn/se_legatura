<!-- Cancel Bid Confirmation Modal -->
<div id="cancelBidModal" class="modal">
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
            <h2>Cancel Bid</h2>
            <span class="close" onclick="closeCancelBidModal()">&times;</span>
        </div>
        <div class="modal-body">
            <p style="margin-bottom: 20px; font-size: 16px;">
                Are you sure you want to cancel this bid? This action cannot be undone.
            </p>
            <div id="cancelBidErrorMessage" class="error-message" style="display: none;"></div>
            <div id="cancelBidSuccessMessage" class="success-message" style="display: none;"></div>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="closeCancelBidModal()">No, Keep Bid</button>
            <button type="button" class="btn btn-danger" id="confirmCancelBtn" onclick="confirmCancelBid()">Yes, Cancel Bid</button>
        </div>
    </div>
</div>

