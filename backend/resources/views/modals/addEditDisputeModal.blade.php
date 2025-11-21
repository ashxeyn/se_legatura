<style>
    .file-input-group {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .evidence-file-input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: #f8f9fa;
    }

    .evidence-file-input.has-file {
        display: none;
    }

    .file-name-display {
        flex: 1;
        padding: 8px;
        border: 1px solid #28a745;
        border-radius: 4px;
        background-color: #d4edda;
        color: #155724;
        font-size: 14px;
        display: none;
    }

    .file-name-display.visible {
        display: block;
    }

    .remove-file-btn {
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
    }

    .remove-file-btn:hover {
        background-color: #c82333;
    }
</style>

<div id="addEditDisputeModal" class="modal">
    <div class="modal-content" style="max-width:700px;">
        <div class="modal-header">
            <h2 id="disputeModalTitle">File New Dispute</h2>
            <span class="close" onclick="DisputeModal.close()">&times;</span>
        </div>
        <div class="modal-body">
            <div id="modalErrorMessages" class="error-message" style="display:none;"></div>
            <div id="modalSuccessMessages" class="success-message" style="display:none;"></div>

        <form id="disputeModalForm" enctype="multipart/form-data">
            <input type="hidden" id="modal_dispute_id" name="dispute_id">
            <input type="hidden" id="modal_is_edit" value="0">

            <div class="form-group" id="modalProjectGroup">
                <label for="modal_project_id">Project *</label>
                <select id="modal_project_id" name="project_id" required>
                    <option value="">Select Project</option>
                    @if(isset($projects) && $projects)
                        @foreach($projects as $project)
                            <option value="{{ $project->project_id }}"
                                    data-contractor-id="{{ $project->contractor_user_id ?? '' }}"
                                    data-owner-id="{{ $project->owner_id }}">
                                {{ $project->project_title }}
                            </option>
                        @endforeach
                    @endif
                </select>
            </div>

            <div class="form-group" id="modalMilestoneGroup">
                <label for="modal_milestone_id">Milestone *</label>
                <select id="modal_milestone_id" name="milestone_id" required>
                    <option value="">Select Milestone</option>
                </select>
            </div>

            <div class="form-group" id="modalMilestoneItemGroup">
                <label for="modal_milestone_item_id">Milestone Item *</label>
                <select id="modal_milestone_item_id" name="milestone_item_id" required>
                    <option value="">Select Milestone Item</option>
                </select>
            </div>

            <div class="form-group">
                <label for="modal_dispute_type">Dispute Type *</label>
                <select id="modal_dispute_type" name="dispute_type" required>
                    <option value="">Select Dispute Type</option>
                    <option value="Payment">Payment</option>
                    <option value="Delay">Delay</option>
                    <option value="Quality">Quality</option>
                    <option value="Others">Others</option>
                </select>
            </div>

            <div class="form-group">
                <label for="modal_dispute_desc">Dispute Description *</label>
                <textarea id="modal_dispute_desc" name="dispute_desc" required maxlength="2000" placeholder="Provide detailed description of the dispute..."></textarea>
                <small id="modalCharCount">0 / 2000 characters</small>
            </div>

            <div class="form-group" id="modalExistingFilesSection" style="display:none;">
                <label>Current Evidence Files:</label>
                <ul id="modalExistingFilesList" class="evidence-files"></ul>
            </div>

            <div class="form-group">
                <label for="modal_evidence_files"><span id="modalFilesLabel">Evidence Files (Optional)</span></label>
                <div id="modal-file-upload-container">
                    <div class="file-input-group">
                        <input type="file" name="evidence_files[]" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" class="evidence-file-input">
                        <button type="button" class="remove-file-btn" style="display:none;">Remove</button>
                    </div>
                </div>
                <button type="button" id="modal-add-more-files" style="display:none;">Add More Files</button>
                <small>Accepted formats: JPG, JPEG, PNG, PDF, DOC, DOCX (Max 5MB each, up to 10 files)<br>
                <em>Click "Add More Files" to select additional evidence files one by one.</em></small>
            </div>

        </div>
        <div class="modal-actions">
            <button type="button" id="modalCancelBtn" class="btn btn-secondary" onclick="DisputeModal.close()">Cancel</button>
            <button type="submit" id="modalSubmitBtn" class="btn btn-primary">Submit Dispute</button>
        </div>
        </form>
    </div>
</div>
