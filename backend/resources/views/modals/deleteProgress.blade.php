<style>
    .delete-progress-modal-overlay {
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

    .delete-progress-modal-content {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        text-align: center;
    }

    .delete-progress-modal-content h3 {
        margin-top: 0;
        color: #dc3545;
        font-size: 24px;
    }

    .delete-progress-modal-content p {
        margin: 20px 0;
        font-size: 16px;
        color: #333;
    }

    .delete-progress-modal-buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    .delete-progress-abort-btn {
        flex: 1;
        background: #6c757d;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
    }

    .delete-progress-abort-btn:hover {
        background: #5a6268;
    }

    .delete-progress-confirm-btn {
        flex: 1;
        background: #dc3545;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
    }

    .delete-progress-confirm-btn:hover {
        background: #c82333;
    }
</style>

<div id="deleteProgressModal" class="delete-progress-modal-overlay">
    <div class="delete-progress-modal-content">
        <h3>Delete Progress Report</h3>
        <p>Are you sure you want to delete this progress report? This action cannot be undone.</p>
        <div class="delete-progress-modal-buttons">
            <button type="button" class="delete-progress-abort-btn" onclick="ProgressDelete.close()">No, Keep It</button>
            <button type="button" class="delete-progress-confirm-btn" onclick="ProgressDelete.confirm()">Yes, Delete Report</button>
        </div>
    </div>
</div>
