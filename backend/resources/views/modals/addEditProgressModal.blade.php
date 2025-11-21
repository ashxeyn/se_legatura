<style>
    /* Shared file upload styles - matching dispute modal structure */
    #progressModal .file-input-group {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    #progressModal .progress-file-input,
    #progressModal .evidence-file-input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: #f8f9fa;
    }

    #progressModal .progress-file-input.has-file,
    #progressModal .evidence-file-input.has-file {
        display: none;
    }

    #progressModal .file-name-display {
        flex: 1;
        padding: 8px;
        border: 1px solid #28a745;
        border-radius: 4px;
        background-color: #d4edda;
        color: #155724;
        font-size: 14px;
        display: none;
    }

    #progressModal .file-name-display.visible {
        display: block;
    }

    #progressModal .remove-file-btn {
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
    }

    #progressModal .remove-file-btn:hover {
        background-color: #c82333;
    }

    #progressModal .form-group {
        margin-bottom: 20px;
    }

    #progressModal label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: #333;
    }

    #progressModal textarea,
    #progressModal input[type="text"] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: inherit;
        font-size: 14px;
    }

    #progressModal textarea {
        min-height: 100px;
        resize: vertical;
    }

    #progressModal textarea:focus,
    #progressModal input[type="text"]:focus {
        outline: none;
        border-color: #007bff;
    }

    #progressModal small {
        display: block;
        margin-top: 5px;
        color: #666;
        font-size: 13px;
    }

    .existing-progress-files {
        list-style: none;
        padding: 0;
        margin: 10px 0;
    }

    .existing-progress-files li {
        padding: 10px;
        background: #f8f9fa;
        margin-bottom: 8px;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .existing-progress-files li span {
        flex: 1;
    }

    .existing-progress-files li button {
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
    }

    .existing-progress-files li button:hover {
        background-color: #c82333;
    }
</style>

<div id="progressModal" class="modal">
    <div class="modal-content" style="max-width:700px;">
        <div class="modal-header">
            <h2 id="progressModalTitle">Upload Progress</h2>
            <span class="close" onclick="ProgressModal.close()">&times;</span>
        </div>
        <div class="modal-body">
            <div id="progressModalErrorMessages" class="error-message" style="display:none;"></div>
            <div id="progressModalSuccessMessages" class="success-message" style="display:none;"></div>

        <form id="progressModalForm" enctype="multipart/form-data">
            <input type="hidden" id="progress_item_id" name="item_id">
            <input type="hidden" id="progress_project_id" name="project_id">
            <input type="hidden" id="progress_is_edit" value="0">
            <input type="hidden" id="progress_id" name="progress_id">

            <div class="form-group">
                <label>Milestone Item:</label>
                <div style="padding: 10px; background: #e9ecef; border-radius: 4px; font-weight: 500;">
                    <span id="progress_item_title"></span>
                </div>
            </div>

            <div class="form-group">
                <label for="progress_purpose">Purpose / Description *</label>
                <textarea id="progress_purpose" name="purpose" required maxlength="1000" placeholder="Describe the progress update (e.g., Foundation completed, Walls constructed, etc.)"></textarea>
                <small id="progressCharCount">0 / 1000 characters</small>
            </div>

            <div class="form-group" id="existingProgressFilesSection" style="display:none;">
                <label>Current Progress Files:</label>
                <ul id="existingProgressFilesList" class="existing-progress-files"></ul>
            </div>

            <div class="form-group">
                <label for="progress_files"><span id="progressFilesLabel">Progress Files *</span></label>
                <div id="progress-file-upload-container">
                    <div class="file-input-group">
                        <input type="file" name="progress_files[]" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" class="progress-file-input evidence-file-input">
                        <button type="button" class="remove-file-btn" style="display:none;">Remove</button>
                    </div>
                </div>
                <button type="button" id="progress-add-more-files" style="display:none; margin-top:10px; background:#007bff; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">Add More Files</button>
                <small>Accepted formats: JPG, JPEG, PNG, PDF, DOC, DOCX (Max 5MB each, up to 10 files)<br>
                <em>Click "Add More Files" to select additional progress files one by one.</em></small>
            </div>

        </div>
        <div class="modal-actions">
            <button type="button" id="progressCancelBtn" class="btn btn-secondary" onclick="ProgressModal.close()">Cancel</button>
            <button type="submit" id="progressSubmitBtn" class="btn btn-primary">
                <span id="progressSubmitBtnText">Upload Progress</span>
            </button>
        </div>
        </form>
    </div>
</div>
