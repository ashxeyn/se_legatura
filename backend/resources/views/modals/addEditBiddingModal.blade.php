<!-- Bid Modal -->
<div id="bidModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="modalTitle">Apply for Bid</h2>
            <span class="close" onclick="closeBidModal()">&times;</span>
        </div>
        <div class="modal-body">
            <div id="errorMessage" class="error-message" style="display: none;"></div>
            <div id="successMessage" class="success-message" style="display: none;"></div>
            <form id="bidForm" enctype="multipart/form-data">
                @csrf
                <input type="hidden" name="project_id" value="{{ $project->project_id }}">
                <input type="hidden" name="bid_id" id="bid_id" value="{{ $existingBid->bid_id ?? '' }}">
                <input type="hidden" name="_method" id="form_method" value="POST">

                <div class="form-group">
                    <label for="proposed_cost">Proposed Cost (₱) <span class="required">*</span></label>
                    <input type="number" id="proposed_cost" name="proposed_cost" step="0.01" min="0" required 
                           value="{{ old('proposed_cost', $existingBid->proposed_cost ?? '') }}">
                </div>

                <div class="form-group">
                    <label for="estimated_timeline">Estimated Timeline (months) <span class="required">*</span></label>
                    <input type="number" id="estimated_timeline" name="estimated_timeline" min="1" required 
                           value="{{ old('estimated_timeline', $existingBid->estimated_timeline ?? '') }}">
                </div>

                <div class="form-group">
                    <label for="contractor_notes">Contractor Notes</label>
                    <textarea id="contractor_notes" name="contractor_notes" rows="4" 
                              placeholder="Add any additional notes or information about your bid...">{{ old('contractor_notes', $existingBid->contractor_notes ?? '') }}</textarea>
                </div>

                <div class="form-group">
                    <label>Bid Files (Sample works, portfolio, etc.)</label>
                    <div class="file-upload-area" id="fileUploadArea">
                        <p>Drag and drop files here or click to select</p>
                        <input type="file" id="bid_files" name="bid_files[]" multiple 
                               accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.rar" style="display: none;">
                        <button type="button" onclick="document.getElementById('bid_files').click()" 
                                class="btn btn-primary" style="margin-top: 10px;">Select Files</button>
                    </div>
                    <ul class="file-list-upload" id="fileList"></ul>
                </div>

                @if(isset($existingBid) && $existingBid && isset($bidFiles) && count($bidFiles) > 0)
                    <div class="existing-files">
                        <h4>Existing Files:</h4>
                        @foreach($bidFiles as $file)
                            <div class="existing-file-item" id="file-{{ $file->file_id }}">
                                <a href="{{ asset('storage/' . $file->file_path) }}" target="_blank">
                                    {{ $file->file_name }}
                                </a>
                                <span class="delete-file" onclick="deleteExistingFile({{ $file->file_id }})">×</span>
                            </div>
                        @endforeach
                    </div>
                @endif

                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeBidModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="submitBtn">Submit Bid</button>
                </div>
            </form>
        </div>
    </div>
</div>

