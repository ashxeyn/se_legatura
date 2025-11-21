<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Milestone Setup - Legatura</title>
	<meta name="csrf-token" content="{{ csrf_token() }}">
	<link rel="stylesheet" href="{{ asset('css/common.css') }}">
	<style>
		.step-container {
			background: white;
			border-radius: 8px;
			padding: 25px;
			box-shadow: 0 2px 4px rgba(0,0,0,0.1);
			border: 1px solid #e4e6eb;
			margin-bottom: 20px;
		}

		.step-container h2 {
			font-size: 20px;
			color: #1c1e21;
			margin-bottom: 20px;
			padding-bottom: 15px;
			border-bottom: 1px solid #e4e6eb;
		}

		.step-container h3 {
			font-size: 16px;
			color: #1c1e21;
			margin-bottom: 10px;
		}

		#milestoneErrorMessages,
		#milestoneSuccessMessages {
			margin-bottom: 20px;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
	<h1>Milestone Setup</h1>
			<div class="nav-links">
				<a href="/dashboard">Back to Dashboard</a>
			</div>
		</div>

		<div class="card">
			<p style="margin-bottom: 20px; color: #65676b;">Set up the milestones for your project agreement.</p>

			<div id="milestoneErrorMessages" class="error-message" style="display:none;"></div>
			<div id="milestoneSuccessMessages" class="success-message" style="display:none;"></div>

	<div id="milestoneStep1" class="step-container">
		<h2>Step 1: Milestone Details</h2>
		<form id="milestoneStep1Form">
			<div>
				<label for="project_id">Project *</label>
				<select id="project_id" name="project_id" required>
					<option value="">Select Project</option>
					@foreach($projects as $project)
						<option value="{{ $project->project_id }}" {{ (isset($projectId) && (int) $projectId === (int) $project->project_id) ? 'selected' : '' }}>
							{{ $project->project_title }}
						</option>
					@endforeach
				</select>
			</div>

			<div id="selectedProjectDetails" style="margin-top:10px; display:none;">
				<h3>Project Description</h3>
				<p id="projectDescriptionText"></p>
			</div>

			<div>
				<label for="milestone_name">Milestone Name *</label>
				<input type="text" id="milestone_name" name="milestone_name" required maxlength="200">
			</div>

			<div>
				<label for="payment_mode">Payment Plan *</label>
				<select id="payment_mode" name="payment_mode" required>
					<option value="">Select Payment Plan</option>
					<option value="downpayment">Downpayment</option>
					<option value="full_payment">Full Payment</option>
				</select>
			</div>

			<div>
				<button type="button" onclick="goBackFromFirstStep()">Back</button>
				<button type="submit">Next</button>
			</div>
		</form>
	</div>

	<div id="milestoneStep2" class="step-container" style="display:none;">
		<h2>Step 2: Project Schedule and Cost</h2>
		<form id="milestoneStep2Form">
			<div>
				<label for="start_date">Project Start Date *</label>
				<input type="date" id="start_date" name="start_date" required>
			</div>

			<div>
				<label for="end_date">Project End Date *</label>
				<input type="date" id="end_date" name="end_date" required>
			</div>

			<div>
				<label for="total_project_cost">Total Project Cost *</label>
				<input type="number" id="total_project_cost" name="total_project_cost" required step="0.01" min="0">
			</div>

			<div id="downpaymentContainer" style="display:none;">
				<label for="downpayment_amount">Downpayment Amount *</label>
				<input type="number" id="downpayment_amount" name="downpayment_amount" step="0.01" min="0">
			</div>

			<div>
				<button type="button" onclick="showStep('milestoneStep1')">Back</button>
				<button type="submit">Next</button>
			</div>
		</form>
	</div>

	<div id="milestoneStep3" class="step-container" style="display:none;">
		<h2>Step 3: Milestone Items</h2>
		<p>Add milestone items until the total percentage equals 100%.</p>
		<form id="milestoneItemForm">
			<div>
				<label for="item_percentage">Percentage *</label>
				<input type="number" id="item_percentage" name="item_percentage" required step="0.01" min="0" max="100">
			</div>

			<div>
				<label for="item_title">Milestone Item Title *</label>
				<input type="text" id="item_title" name="item_title" required maxlength="255">
			</div>

			<div>
				<label for="item_description">Milestone Item Description *</label>
				<textarea id="item_description" name="item_description" required rows="3"></textarea>
			</div>

			<div>
				<label for="item_date">Date To Finish *</label>
				<input type="date" id="item_date" name="item_date" required>
			</div>

			<div>
				<button type="button" id="addMilestoneItemButton">Add Milestone Item</button>
			</div>
		</form>

		<h3>Milestone Items (Total: <span id="totalPercentageDisplay">0</span>%)</h3>
		<div id="milestoneItemsList"></div>

		<div>
			<button type="button" onclick="showStep('milestoneStep2')">Back</button>
			<button type="button" id="submitMilestoneButton">Confirm</button>
		</div>
	</div>

		</div>
	</div>

	<script>
		window.contractorProjects = @json($projects);
		@if(isset($existingMilestone) && $existingMilestone)
			window.existingMilestone = @json($existingMilestone);
			window.existingItems = @json($existingItems);
			window.isEditingMilestone = true;
		@else
			window.existingMilestone = null;
			window.existingItems = [];
			window.isEditingMilestone = false;
		@endif
	</script>
	<script src="{{ asset('js/contractor.js') }}"></script>
</body>
</html>
