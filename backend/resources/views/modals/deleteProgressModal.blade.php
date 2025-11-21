<div id="deleteProgressModal" class="modal">
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
            <h2>Delete Progress Report</h2>
            <span class="close" onclick="ProgressDelete.close()">&times;</span>
        </div>
        <div class="modal-body">
            <p style="margin-bottom: 20px; font-size: 16px;">
                Are you sure you want to delete this progress report? This action cannot be undone.
            </p>
            <div id="deleteProgressErrorMessage" class="error-message" style="display: none;"></div>
            <div id="deleteProgressSuccessMessage" class="success-message" style="display: none;"></div>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="ProgressDelete.close()">No, Keep It</button>
            <button type="button" class="btn btn-danger" onclick="ProgressDelete.confirm()">Yes, Delete Report</button>
        </div>
    </div>
</div>

