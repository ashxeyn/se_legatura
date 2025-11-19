<style>
    .cancel-modal-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1001;
        align-items: center;
        justify-content: center;
    }

    .cancel-modal-content {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        text-align: center;
    }

    .cancel-modal-content h3 {
        margin-top: 0;
        color: #dc3545;
        font-size: 24px;
    }

    .cancel-modal-content p {
        margin: 20px 0;
        font-size: 16px;
        color: #333;
    }

    .cancel-modal-buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    .cancel-abort-btn {
        flex: 1;
        background: #6c757d;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
    }

    .cancel-abort-btn:hover {
        background: #5a6268;
    }

    .cancel-confirm-btn {
        flex: 1;
        background: #dc3545;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
    }

    .cancel-confirm-btn:hover {
        background: #c82333;
    }
</style>

<div id="cancelDisputeModal" class="cancel-modal-overlay">
    <div class="cancel-modal-content">
        <h3>Cancel Dispute</h3>
        <p>Are you sure you want to cancel this dispute? This action cannot be undone.</p>
        <div class="cancel-modal-buttons">
            <button type="button" class="cancel-abort-btn" onclick="DisputeCancel.close()">No, Keep It</button>
            <button type="button" class="cancel-confirm-btn" onclick="DisputeCancel.confirm()">Yes, Cancel Dispute</button>
        </div>
    </div>
</div>
