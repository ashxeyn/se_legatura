<!-- Accept Bid Confirmation Modal -->
<div id="acceptBidModal" class="modal">
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
            <h2>Accept Bid</h2>
            <span class="close" onclick="AcceptBidModal.close()">&times;</span>
        </div>
        <div class="modal-body">
            <p style="margin-bottom: 15px; font-size: 16px;">
                Are you sure you want to select <strong id="acceptBidCompanyName"></strong> for this project?
            </p>
            <div style="padding: 15px; background: #f8f9fa; border-radius: 6px; margin-bottom: 15px;">
                <p style="margin-bottom: 5px;"><strong>Proposed Cost:</strong> ₱<span id="acceptBidCost"></span></p>
            </div>
            <p style="margin-bottom: 20px; font-size: 14px; color: #65676b;">
                This will close bidding for this project and reject all other bids. This action cannot be undone.
            </p>
            <div id="acceptBidErrorMessage" class="error-message" style="display: none;"></div>
            <div id="acceptBidSuccessMessage" class="success-message" style="display: none;"></div>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="AcceptBidModal.close()">Cancel</button>
            <button type="button" class="btn btn-primary" id="confirmAcceptBtn" onclick="AcceptBidModal.confirm()">Yes, Select This Contractor</button>
        </div>
    </div>
</div>

