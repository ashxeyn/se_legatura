var csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
var selectedPaymentMode = '';
var startDateLimit = null;
var endDateLimit = null;
var milestoneItems = [];
var projectDetailsMap = {};
var step1State = null;
var step2State = null;

if (window.contractorProjects && Array.isArray(window.contractorProjects)) {
	window.contractorProjects.forEach(function(project) {
		if (project && project.project_id) {
			projectDetailsMap[String(project.project_id)] = project;
		}
	});
}

function showError(message) {
	var errorDiv = document.getElementById('milestoneErrorMessages');
	errorDiv.innerHTML = '<p>' + message + '</p>';
	errorDiv.style.display = 'block';
	document.getElementById('milestoneSuccessMessages').style.display = 'none';
}

function showSuccess(message) {
	var successDiv = document.getElementById('milestoneSuccessMessages');
	successDiv.innerHTML = '<p>' + message + '</p>';
	successDiv.style.display = 'block';
	document.getElementById('milestoneErrorMessages').style.display = 'none';
}

function hideAllSteps() {
	var steps = document.querySelectorAll('.step-container');
	steps.forEach(function(step) {
		step.style.display = 'none';
	});
}

function showStep(stepId) {
	var targetStep = document.getElementById(stepId);
	if (!targetStep) {
		return;
	}
	hideAllSteps();
	targetStep.style.display = 'block';
	document.getElementById('milestoneErrorMessages').style.display = 'none';
	document.getElementById('milestoneSuccessMessages').style.display = 'none';
}

function goBackFromFirstStep() {
	window.history.back();
}

function renderMilestoneItems() {
	var listContainer = document.getElementById('milestoneItemsList');
	var totalDisplay = document.getElementById('totalPercentageDisplay');
	listContainer.innerHTML = '';

	if (milestoneItems.length === 0) {
		totalDisplay.textContent = '0';
		return;
	}

	var total = 0;
	var list = document.createElement('div');

	milestoneItems.forEach(function(item, index) {
		total += item.percentage;
		var itemDiv = document.createElement('div');
		itemDiv.style.borderTop = '1px solid #ccc';
		itemDiv.style.padding = '8px 0';
		itemDiv.innerHTML = '<p><strong>Order ' + (index + 1) + ':</strong> ' + item.percentage + '% - ' + item.title + '</p>' +
			'<p>' + item.description + '</p>' +
			'<p>Finish by: ' + item.date_to_finish + '</p>' +
			'<button type="button" onclick="removeMilestoneItem(' + index + ')">Remove</button>';
		list.appendChild(itemDiv);
	});

	listContainer.appendChild(list);
	totalDisplay.textContent = total.toFixed(2).replace(/\.00$/, '');
}

function removeMilestoneItem(index) {
	milestoneItems.splice(index, 1);
	renderMilestoneItems();
}

function updateProjectDescription(projectId) {
	var container = document.getElementById('selectedProjectDetails');
	var descriptionText = document.getElementById('projectDescriptionText');
	if (!container || !descriptionText) {
		return;
	}

	var project = projectDetailsMap[String(projectId)] || null;
	if (project) {
		descriptionText.textContent = project.project_description || 'No description provided.';
		container.style.display = 'block';
	} else {
		descriptionText.textContent = '';
		container.style.display = 'none';
	}
}

document.addEventListener('DOMContentLoaded', function() {
	var step1Form = document.getElementById('milestoneStep1Form');
	var step2Form = document.getElementById('milestoneStep2Form');
	var addItemButton = document.getElementById('addMilestoneItemButton');
	var submitMilestoneButton = document.getElementById('submitMilestoneButton');
	var downpaymentContainer = document.getElementById('downpaymentContainer');
	var projectSelect = document.getElementById('project_id');

	if (projectSelect) {
		projectSelect.addEventListener('change', function() {
			updateProjectDescription(projectSelect.value);
		});
		updateProjectDescription(projectSelect.value);
	}

	if (step1Form) {
		step1Form.addEventListener('submit', function(e) {
			e.preventDefault();
			var projectId = document.getElementById('project_id').value;
			var milestoneName = document.getElementById('milestone_name').value.trim();
			var paymentMode = document.getElementById('payment_mode').value;

			if (!projectId || !milestoneName || !paymentMode) {
				showError('Please complete all required fields.');
				return;
			}

			var formData = new FormData(step1Form);

			fetch('/contractor/milestone/setup/step1', {
				method: 'POST',
				headers: {
					'X-CSRF-TOKEN': csrfToken
				},
				body: formData
			})
			.then(function(response) { return response.json(); })
			.then(function(data) {
				if (data.success) {
					var newStep1State = {
						project_id: projectId,
						milestone_name: milestoneName,
						payment_mode: paymentMode
					};

					var projectChanged = !step1State || step1State.project_id !== newStep1State.project_id;
					var paymentModeChanged = !step1State || step1State.payment_mode !== newStep1State.payment_mode;

					if (projectChanged || paymentModeChanged) {
						milestoneItems = [];
						renderMilestoneItems();
					}

					step1State = newStep1State;
					step2State = null;
					selectedPaymentMode = data.payment_mode;
					downpaymentContainer.style.display = selectedPaymentMode === 'downpayment' ? 'block' : 'none';
					showStep('milestoneStep2');
				} else {
					var errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : 'An error occurred.';
					showError(errorMessage);
				}
			})
			.catch(function() {
				showError('Network error. Please try again.');
			});
		});
	}

	if (step2Form) {
		step2Form.addEventListener('submit', function(e) {
			e.preventDefault();
			var startDate = document.getElementById('start_date').value;
			var endDate = document.getElementById('end_date').value;
			var totalCost = document.getElementById('total_project_cost').value;
			var downpaymentInput = document.getElementById('downpayment_amount');

			if (!startDate || !endDate || !totalCost) {
				showError('Please fill in the required fields.');
				return;
			}

			if (selectedPaymentMode === 'downpayment') {
				if (!downpaymentInput.value) {
					showError('Downpayment amount is required for downpayment plan.');
					return;
				}
				if (parseFloat(downpaymentInput.value) >= parseFloat(totalCost)) {
					showError('Downpayment must be less than the total project cost.');
					return;
				}
			}

			var formData = new FormData(step2Form);

			fetch('/contractor/milestone/setup/step2', {
				method: 'POST',
				headers: {
					'X-CSRF-TOKEN': csrfToken
				},
				body: formData
			})
			.then(function(response) { return response.json(); })
			.then(function(data) {
				if (data.success) {
					var downpaymentValue = downpaymentInput ? downpaymentInput.value : '';
					var parsedDownpayment = selectedPaymentMode === 'downpayment' ? parseFloat(downpaymentValue) : null;
					if (selectedPaymentMode === 'downpayment' && isNaN(parsedDownpayment)) {
						parsedDownpayment = null;
					}

					var newStep2State = {
						start_date: data.start_date,
						end_date: data.end_date,
						total_cost: parseFloat(totalCost),
						downpayment: parsedDownpayment
					};

					var shouldResetItems = true;
					if (step2State &&
						step2State.start_date === newStep2State.start_date &&
						step2State.end_date === newStep2State.end_date &&
						step2State.total_cost === newStep2State.total_cost &&
						((step2State.downpayment === null && newStep2State.downpayment === null) ||
							step2State.downpayment === newStep2State.downpayment)) {
						shouldResetItems = false;
					}

					step2State = newStep2State;
					startDateLimit = data.start_date;
					endDateLimit = data.end_date;

					if (shouldResetItems) {
						milestoneItems = [];
					}

					renderMilestoneItems();
					showStep('milestoneStep3');
				} else {
					var errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : 'An error occurred.';
					showError(errorMessage);
				}
			})
			.catch(function() {
				showError('Network error. Please try again.');
			});
		});
	}

	if (addItemButton) {
		addItemButton.addEventListener('click', function() {
			var percentageField = document.getElementById('item_percentage');
			var titleField = document.getElementById('item_title');
			var descriptionField = document.getElementById('item_description');
			var dateField = document.getElementById('item_date');

			var percentage = parseFloat(percentageField.value);
			var title = titleField.value.trim();
			var description = descriptionField.value.trim();
			var dateValue = dateField.value;

			if (!percentage || !title || !description || !dateValue) {
				showError('Please complete all milestone item fields before adding.');
				return;
			}

			if (percentage <= 0) {
				showError('Percentage must be greater than zero.');
				return;
			}

			var currentTotal = milestoneItems.reduce(function(total, item) {
				return total + item.percentage;
			}, 0);

			if (currentTotal + percentage > 100) {
				showError('Total percentage cannot exceed 100%.');
				return;
			}

			if (startDateLimit && dateValue < startDateLimit) {
				showError('Milestone item date cannot be before the project start date.');
				return;
			}

			if (endDateLimit && dateValue > endDateLimit) {
				showError('Milestone item date cannot be after the project end date.');
				return;
			}

			milestoneItems.push({
				percentage: percentage,
				title: title,
				description: description,
				date_to_finish: dateValue
			});

			percentageField.value = '';
			titleField.value = '';
			descriptionField.value = '';
			dateField.value = '';

			renderMilestoneItems();
			showSuccess('Milestone item added.');
		});
	}

	if (submitMilestoneButton) {
		submitMilestoneButton.addEventListener('click', function() {
			if (milestoneItems.length === 0) {
				showError('Please add at least one milestone item.');
				return;
			}

			var total = milestoneItems.reduce(function(total, item) {
				return total + item.percentage;
			}, 0);

			if (Math.round(total * 100) / 100 !== 100) {
				showError('Milestone percentages must add up to exactly 100%.');
				return;
			}

			var lastItem = milestoneItems[milestoneItems.length - 1];
			if (endDateLimit && lastItem.date_to_finish !== endDateLimit) {
				showError('The last milestone item must finish on the project end date.');
				return;
			}

			var formData = new FormData();
			formData.append('items', JSON.stringify(milestoneItems));

			fetch('/contractor/milestone/setup/submit', {
				method: 'POST',
				headers: {
					'X-CSRF-TOKEN': csrfToken
				},
				body: formData
			})
			.then(function(response) { return response.json(); })
			.then(function(data) {
				if (data.success) {
					showSuccess(data.message);
					setTimeout(function() {
						window.location.href = data.redirect || '/dashboard';
					}, 1500);
				} else {
					var errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : 'An error occurred.';
					showError(errorMessage);
				}
			})
			.catch(function() {
				showError('Network error. Please try again.');
			});
		});
	}
});
