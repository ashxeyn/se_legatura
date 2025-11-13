// Global Variables
var currentUserType = '';
var csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// Role Switching Function for Dashboard
function switchRole(role) {
	event.target.disabled = true;
	event.target.textContent = 'Switching...';

	fetch('/api/role/switch', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
		},
		body: JSON.stringify({
			role: role
		})
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			window.location.reload();
		} else {
			alert('Failed to switch role: ' + data.message);
			event.target.disabled = false;
			event.target.textContent = role === 'contractor' ? 'Switch to Contractor' : 'Switch to Property Owner';
		}
	})
	.catch(error => {
		console.error('Error:', error);
		alert('An error occurred while switching roles');
		event.target.disabled = false;
		event.target.textContent = role === 'contractor' ? 'Switch to Contractor' : 'Switch to Property Owner';
	});
}

// Utility Functions
function showError(message) {
	var errorDiv = document.getElementById('errorMessages');
	errorDiv.innerHTML = '<p>' + message + '</p>';
	errorDiv.style.display = 'block';
	document.getElementById('successMessages').style.display = 'none';
	window.scrollTo(0, 0);
}

function showSuccess(message) {
	var successDiv = document.getElementById('successMessages');
	successDiv.innerHTML = '<p>' + message + '</p>';
	successDiv.style.display = 'block';
	document.getElementById('errorMessages').style.display = 'none';
	window.scrollTo(0, 0);
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
		console.error('Step not found: ' + stepId);
		return; // Don't hide all steps if target doesn't exist
	}
	hideAllSteps();
	targetStep.style.display = 'block';
	document.getElementById('errorMessages').style.display = 'none';
	document.getElementById('successMessages').style.display = 'none';
}

function goToStep(stepId) {
	showStep(stepId);
}

function goBackToRole() {
	showStep('stepRoleSelection');
	currentUserType = '';
}

function validatePassword(password) {
	if (password.length < 8) {
		return 'Password must be at least 8 characters';
	}
	if (!/[A-Z]/.test(password)) {
		return 'Password must contain at least one uppercase letter';
	}
	if (!/[0-9]/.test(password)) {
		return 'Password must contain at least one number';
	}
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		return 'Password must contain at least one special character';
	}
	return null;
}

function validateDateInFuture(dateString) {
	var inputDate = new Date(dateString);
	var today = new Date();
	today.setHours(0, 0, 0, 0);
	return inputDate > today;
}

function validatePhoneNumber(phoneNumber) {
	if (!/^09\d{9}$/.test(phoneNumber)) {
		return 'Phone number must be 11 digits starting with 09 (e.g., 09171234567)';
	}
	return null;
}

document.addEventListener('DOMContentLoaded', function() {
	// Condition if el contractor type is others
	var contractorTypeSelect = document.getElementById('contractor_type_id');
	var contractorTypeOtherContainer = document.getElementById('contractor_type_other_container');
	var contractorTypeOtherInput = document.getElementById('contractor_type_other');

	if (contractorTypeSelect) {
		contractorTypeSelect.addEventListener('change', function() {
			var selectedOption = this.options[this.selectedIndex];
			var typeName = selectedOption.getAttribute('data-name');

			if (typeName && typeName.toLowerCase() === 'others') {
				contractorTypeOtherContainer.style.display = 'block';
				contractorTypeOtherInput.setAttribute('required', 'required');
			} else {
				contractorTypeOtherContainer.style.display = 'none';
				contractorTypeOtherInput.removeAttribute('required');
				contractorTypeOtherInput.value = '';
			}
		});
	}

	// Condition if el occupation is others
	var occupationSelect = document.getElementById('occupation_id');
	var occupationOtherContainer = document.getElementById('occupation_other_container');
	var occupationOtherInput = document.getElementById('occupation_other');

	if (occupationSelect) {
		occupationSelect.addEventListener('change', function() {
			var selectedOption = this.options[this.selectedIndex];
			var occupationName = selectedOption.getAttribute('data-name');

			if (occupationName && occupationName.toLowerCase() === 'others') {
				occupationOtherContainer.style.display = 'block';
				occupationOtherInput.setAttribute('required', 'required');
			} else {
				occupationOtherContainer.style.display = 'none';
				occupationOtherInput.removeAttribute('required');
				occupationOtherInput.value = '';
			}
		});
	}

	// Restrict phone number inputs to digits only
	var companyPhoneInput = document.getElementById('company_phone');
	if (companyPhoneInput) {
		companyPhoneInput.addEventListener('input', function(e) {
			this.value = this.value.replace(/\D/g, '');
			if (this.value.length > 11) {
				this.value = this.value.slice(0, 11);
			}
		});
	}

	var ownerPhoneInput = document.getElementById('phone_number');
	if (ownerPhoneInput) {
		ownerPhoneInput.addEventListener('input', function(e) {
			this.value = this.value.replace(/\D/g, '');
			if (this.value.length > 11) {
				this.value = this.value.slice(0, 11);
			}
		});
	}

// Cities for business permit
	var businessPermitCitySelect = document.getElementById('business_permit_city');
	if (businessPermitCitySelect) {
		// Get all provinces first
		fetch('/api/psgc/provinces')
			.then(response => response.json())
			.then(provinces => {
				// Fetch cities from all provinces
				var cityPromises = provinces.map(province =>
					fetch('/api/psgc/provinces/' + province.code + '/cities')
						.then(response => response.json())
				);

				Promise.all(cityPromises)
					.then(citiesArrays => {
						var allCities = citiesArrays.flat();
						allCities.sort((a, b) => a.name.localeCompare(b.name));

						businessPermitCitySelect.innerHTML = '<option value="">Select City/Municipality</option>';
						allCities.forEach(city => {
							var option = document.createElement('option');
							option.value = city.name;
							option.textContent = city.name;
							businessPermitCitySelect.appendChild(option);
						});
					})
					.catch(error => {
						businessPermitCitySelect.innerHTML = '<option value="">Error loading cities</option>';
					});
			})
			.catch(error => {
				businessPermitCitySelect.innerHTML = '<option value="">Error loading cities</option>';
			});
	}

	// Contractor Add
	var contractorProvince = document.getElementById('business_address_province');
	if (contractorProvince) {
		contractorProvince.addEventListener('change', function() {
			var provinceCode = this.value;
			var citySelect = document.getElementById('business_address_city');
			var barangaySelect = document.getElementById('business_address_barangay');

			citySelect.innerHTML = '<option value="">Loading...</option>';
			citySelect.disabled = true;
			barangaySelect.innerHTML = '<option value="">Select City First</option>';
			barangaySelect.disabled = true;

			if (provinceCode) {
				fetch('/api/psgc/provinces/' + provinceCode + '/cities')
					.then(response => response.json())
					.then(data => {
						citySelect.innerHTML = '<option value="">Select City/Municipality</option>';
						data.forEach(function(city) {
							var option = document.createElement('option');
							option.value = city.code;
							option.setAttribute('data-name', city.name);
							option.textContent = city.name;
							citySelect.appendChild(option);
						});
						citySelect.disabled = false;
					})
					.catch(error => {
						citySelect.innerHTML = '<option value="">Error loading cities</option>';
					});
			} else {
				citySelect.innerHTML = '<option value="">Select Province First</option>';
			}
		});
	}

	var contractorCity = document.getElementById('business_address_city');
	if (contractorCity) {
		contractorCity.addEventListener('change', function() {
			var cityCode = this.value;
			var barangaySelect = document.getElementById('business_address_barangay');

			barangaySelect.innerHTML = '<option value="">Loading...</option>';
			barangaySelect.disabled = true;

			if (cityCode) {
				fetch('/api/psgc/cities/' + cityCode + '/barangays')
					.then(response => response.json())
					.then(data => {
						barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
						data.forEach(function(barangay) {
							var option = document.createElement('option');
							option.value = barangay.code;
							option.setAttribute('data-name', barangay.name);
							option.textContent = barangay.name;
							barangaySelect.appendChild(option);
						});
						barangaySelect.disabled = false;
					})
					.catch(error => {
						barangaySelect.innerHTML = '<option value="">Error loading barangays</option>';
					});
			} else {
				barangaySelect.innerHTML = '<option value="">Select City First</option>';
			}
		});
	}

	// Property Owner Add
	var ownerProvince = document.getElementById('owner_address_province');
	if (ownerProvince) {
		ownerProvince.addEventListener('change', function() {
			var provinceCode = this.value;
			var citySelect = document.getElementById('owner_address_city');
			var barangaySelect = document.getElementById('owner_address_barangay');

			citySelect.innerHTML = '<option value="">Loading...</option>';
			citySelect.disabled = true;
			barangaySelect.innerHTML = '<option value="">Select City First</option>';
			barangaySelect.disabled = true;

			if (provinceCode) {
				fetch('/api/psgc/provinces/' + provinceCode + '/cities')
					.then(response => response.json())
					.then(data => {
						citySelect.innerHTML = '<option value="">Select City/Municipality</option>';
						data.forEach(function(city) {
							var option = document.createElement('option');
							option.value = city.code;
							option.setAttribute('data-name', city.name);
							option.textContent = city.name;
							citySelect.appendChild(option);
						});
						citySelect.disabled = false;
					})
					.catch(error => {
						citySelect.innerHTML = '<option value="">Error loading cities</option>';
					});
			} else {
				citySelect.innerHTML = '<option value="">Select Province First</option>';
			}
		});
	}

	var ownerCity = document.getElementById('owner_address_city');
	if (ownerCity) {
		ownerCity.addEventListener('change', function() {
			var cityCode = this.value;
			var barangaySelect = document.getElementById('owner_address_barangay');

			barangaySelect.innerHTML = '<option value="">Loading...</option>';
			barangaySelect.disabled = true;

			if (cityCode) {
				fetch('/api/psgc/cities/' + cityCode + '/barangays')
					.then(response => response.json())
					.then(data => {
						barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
						data.forEach(function(barangay) {
							var option = document.createElement('option');
							option.value = barangay.code;
							option.setAttribute('data-name', barangay.name);
							option.textContent = barangay.name;
							barangaySelect.appendChild(option);
						});
						barangaySelect.disabled = false;
					})
					.catch(error => {
						barangaySelect.innerHTML = '<option value="">Error loading barangays</option>';
					});
			} else {
				barangaySelect.innerHTML = '<option value="">Select City First</option>';
			}
		});
	}

    // SIGN UP
	// Role Selection
	var roleSelectionForm = document.getElementById('roleSelectionForm');
	if (roleSelectionForm) {
		roleSelectionForm.addEventListener('submit', function(e) {
			e.preventDefault();
			var userType = document.querySelector('input[name="user_type"]:checked').value;
			currentUserType = userType;

			if (userType === 'contractor') {
				showStep('stepContractor1');
			} else {
				showStep('stepOwner1');
			}
		});
	}

	// If Contractor: Step 1
	var contractorStep1Form = document.getElementById('contractorStep1Form');
	if (contractorStep1Form) {
		contractorStep1Form.addEventListener('submit', function(e) {
			e.preventDefault();
			var formData = new FormData(this);

			var companyPhone = document.getElementById('company_phone').value;
			var phoneError = validatePhoneNumber(companyPhone);
			if (phoneError) {
				showError(phoneError);
				return;
			}

			var contractorTypeSelect = document.getElementById('contractor_type_id');
			var selectedTypeOption = contractorTypeSelect.options[contractorTypeSelect.selectedIndex];
			var typeName = selectedTypeOption.getAttribute('data-name');

			if (typeName && typeName.toLowerCase() === 'others') {
				var otherTypeValue = document.getElementById('contractor_type_other').value.trim();
				if (!otherTypeValue) {
					showError('Please specify your contractor type');
					return;
				}
				formData.append('contractor_type_other_text', otherTypeValue);
			}

			var provinceSelect = document.getElementById('business_address_province');
			var citySelect = document.getElementById('business_address_city');
			var barangaySelect = document.getElementById('business_address_barangay');

			if (provinceSelect.selectedIndex > 0) {
				formData.set('business_address_province', provinceSelect.options[provinceSelect.selectedIndex].getAttribute('data-name'));
			}
			if (citySelect.selectedIndex > 0) {
				formData.set('business_address_city', citySelect.options[citySelect.selectedIndex].getAttribute('data-name'));
			}
			if (barangaySelect.selectedIndex > 0) {
				formData.set('business_address_barangay', barangaySelect.options[barangaySelect.selectedIndex].getAttribute('data-name'));
			}

			fetch('/accounts/signup/contractor/step1', {
				method: 'POST',
				headers: {
					'X-CSRF-TOKEN': csrfToken
				},
				body: formData
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					showStep('stepContractor2');
				} else {
					showError(data.errors ? Object.values(data.errors).flat().join(', ') : 'An error occurred');
				}
			})
			.catch(error => {
				showError('Network error. Please try again.');
			});
		});
	}

	//  Step 2
	var contractorStep2Form = document.getElementById('contractorStep2Form');
	if (contractorStep2Form) {
		contractorStep2Form.addEventListener('submit', function(e) {
			e.preventDefault();

			var password = document.getElementById('c_password').value;
			var passwordConfirmation = document.getElementById('c_password_confirmation').value;

			var passwordError = validatePassword(password);
			if (passwordError) {
				showError(passwordError);
				return;
			}

			if (password !== passwordConfirmation) {
				showError('Passwords do not match');
				return;
			}

			var formData = new FormData(this);

			fetch('/accounts/signup/contractor/step2', {
				method: 'POST',
				headers: {
					'X-CSRF-TOKEN': csrfToken
				},
				body: formData
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					showSuccess(data.message || 'OTP sent successfully!');
					showStep('stepContractor3');
				} else {
					showError(data.errors ? Object.values(data.errors).flat().join(', ') : 'An error occurred');
				}
			})
			.catch(error => {
				showError('Network error. Please try again.');
			});
		});
	}

	//  Step 3
	var contractorStep3Form = document.getElementById('contractorStep3Form');
	if (contractorStep3Form) {
		contractorStep3Form.addEventListener('submit', function(e) {
			e.preventDefault();
			var formData = new FormData(this);

			fetch('/accounts/signup/contractor/step3/verify-otp', {
				method: 'POST',
				headers: {
					'X-CSRF-TOKEN': csrfToken
				},
				body: formData
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					showSuccess('OTP verified successfully!');
					showStep('stepContractor4');
				} else {
					showError(data.errors ? Object.values(data.errors).flat().join(', ') : 'Invalid OTP');
				}
			})
			.catch(error => {
				showError('Network error. Please try again.');
			});
		});
	}

	//  Step 4
	var contractorStep4Form = document.getElementById('contractorStep4Form');
	if (contractorStep4Form) {
		contractorStep4Form.addEventListener('submit', function(e) {
			e.preventDefault();

			var picabExpiration = document.getElementById('picab_expiration_date').value;
			var permitExpiration = document.getElementById('business_permit_expiration').value;

			if (!validateDateInFuture(picabExpiration)) {
				showError('PICAB expiration date must be in the future');
				return;
			}

			if (!validateDateInFuture(permitExpiration)) {
				showError('Business permit expiration date must be in the future');
				return;
			}

			var formData = new FormData(this);

			fetch('/accounts/signup/contractor/step4', {
				method: 'POST',
				headers: {
					'X-CSRF-TOKEN': csrfToken
				},
				body: formData
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					showStep('stepContractorFinal');
				} else {
					showError(data.errors ? Object.values(data.errors).flat().join(', ') : 'An error occurred');
				}
			})
			.catch(error => {
				showError('Network error. Please try again.');
			});
		});
	}

	//  Final
	var contractorFinalForm = document.getElementById('contractorFinalForm');
	if (contractorFinalForm) {
		contractorFinalForm.addEventListener('submit', function(e) {
			e.preventDefault();
			var formData = new FormData(this);

			// Use different endpoint for switch mode
			var endpoint = window.isSwitchMode ? '/accounts/switch/contractor/final' : '/accounts/signup/contractor/final';

			fetch(endpoint, {
				method: 'POST',
				headers: {
					'X-CSRF-TOKEN': csrfToken
				},
				body: formData
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					showSuccess(data.message);
					setTimeout(function() {
						window.location.href = data.redirect || '/dashboard';
					}, 2000);
				} else {
					showError(data.errors ? Object.values(data.errors).flat().join(', ') : 'An error occurred');
				}
			})
			.catch(error => {
				showError('Network error. Please try again.');
			});
		});
	}

	// Property Owner: Step 1
	var ownerStep1Form = document.getElementById('ownerStep1Form');
	if (ownerStep1Form) {
		ownerStep1Form.addEventListener('submit', function(e) {
			e.preventDefault();

			var dob = document.getElementById('date_of_birth').value;
			if (!dob || new Date(dob) >= new Date()) {
				showError('Please enter a valid date of birth');
				return;
			}

			var phoneNumber = document.getElementById('phone_number').value;
			var phoneError = validatePhoneNumber(phoneNumber);
			if (phoneError) {
				showError(phoneError);
				return;
			}

			var formData = new FormData(this);

			var occupationSelect = document.getElementById('occupation_id');
			var selectedOccupationOption = occupationSelect.options[occupationSelect.selectedIndex];
			var occupationName = selectedOccupationOption.getAttribute('data-name');

			if (occupationName && occupationName.toLowerCase() === 'others') {
				var otherOccupationValue = document.getElementById('occupation_other').value.trim();
				if (!otherOccupationValue) {
					showError('Please specify your occupation');
					return;
				}
				formData.append('occupation_other_text', otherOccupationValue);
			}

			// Get the text names for province, city, barangay
			var provinceSelect = document.getElementById('owner_address_province');
			var citySelect = document.getElementById('owner_address_city');
			var barangaySelect = document.getElementById('owner_address_barangay');

			if (provinceSelect.selectedIndex > 0) {
				formData.set('owner_address_province', provinceSelect.options[provinceSelect.selectedIndex].getAttribute('data-name'));
			}
			if (citySelect.selectedIndex > 0) {
				formData.set('owner_address_city', citySelect.options[citySelect.selectedIndex].getAttribute('data-name'));
			}
			if (barangaySelect.selectedIndex > 0) {
				formData.set('owner_address_barangay', barangaySelect.options[barangaySelect.selectedIndex].getAttribute('data-name'));
			}

			fetch('/accounts/signup/owner/step1', {
				method: 'POST',
				headers: {
					'X-CSRF-TOKEN': csrfToken
				},
				body: formData
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					showStep('stepOwner2');
				} else {
					showError(data.errors ? Object.values(data.errors).flat().join(', ') : 'An error occurred');
				}
			})
			.catch(error => {
				showError('Network error. Please try again.');
			});
		});
	}

	//   Step 2
	var ownerStep2Form = document.getElementById('ownerStep2Form');
	if (ownerStep2Form) {
		ownerStep2Form.addEventListener('submit', function(e) {
			e.preventDefault();

			var password = document.getElementById('o_password').value;
			var passwordConfirmation = document.getElementById('o_password_confirmation').value;

			var passwordError = validatePassword(password);
			if (passwordError) {
				showError(passwordError);
				return;
			}

			if (password !== passwordConfirmation) {
				showError('Passwords do not match');
				return;
			}

			var formData = new FormData(this);

			fetch('/accounts/signup/owner/step2', {
				method: 'POST',
				headers: {
					'X-CSRF-TOKEN': csrfToken
				},
				body: formData
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					showStep('stepOwner3');
				} else {
					showError(data.errors ? Object.values(data.errors).flat().join(', ') : 'An error occurred');
				}
			})
			.catch(error => {
				showError('Network error. Please try again.');
			});
		});
	}

	//   Step 3
	var ownerStep3Form = document.getElementById('ownerStep3Form');
	if (ownerStep3Form) {
		ownerStep3Form.addEventListener('submit', function(e) {
			e.preventDefault();
			var formData = new FormData(this);

			fetch('/accounts/signup/owner/step3/verify-otp', {
				method: 'POST',
				headers: {
					'X-CSRF-TOKEN': csrfToken
				},
				body: formData
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					showSuccess('OTP verified successfully!');
					showStep('stepOwner4');
				} else {
					showError(data.errors ? Object.values(data.errors).flat().join(', ') : 'Invalid OTP');
				}
			})
			.catch(error => {
				showError('Network error. Please try again.');
			});
		});
	}

	//  Step 4
	var ownerStep4Form = document.getElementById('ownerStep4Form');
	if (ownerStep4Form) {
		ownerStep4Form.addEventListener('submit', function(e) {
			e.preventDefault();
			var formData = new FormData(this);

			fetch('/accounts/signup/owner/step4', {
				method: 'POST',
				headers: {
					'X-CSRF-TOKEN': csrfToken
				},
				body: formData
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					showStep('stepOwnerFinal');
				} else {
					showError(data.errors ? Object.values(data.errors).flat().join(', ') : 'An error occurred');
				}
			})
			.catch(error => {
				showError('Network error. Please try again.');
			});
		});
	}

	//  Final
	var ownerFinalForm = document.getElementById('ownerFinalForm');
	if (ownerFinalForm) {
		ownerFinalForm.addEventListener('submit', function(e) {
			e.preventDefault();
			var formData = new FormData(this);

			// Use different endpoint for switch mode
			var endpoint = window.isSwitchMode ? '/accounts/switch/owner/final' : '/accounts/signup/owner/final';

			fetch(endpoint, {
				method: 'POST',
				headers: {
					'X-CSRF-TOKEN': csrfToken
				},
				body: formData
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					showSuccess(data.message);
					setTimeout(function() {
						window.location.href = data.redirect || '/dashboard';
					}, 2000);
				} else {
					showError(data.errors ? Object.values(data.errors).flat().join(', ') : 'An error occurred');
				}
			})
			.catch(error => {
				showError('Network error. Please try again.');
			});
		});
	}

	// LOGIN
	var loginForm = document.getElementById('loginForm');
	if (loginForm) {
		loginForm.addEventListener('submit', function(e) {
			var username = document.getElementById('username').value.trim();
			var password = document.getElementById('password').value;

			if (username === '') {
				alert('Please enter username or email');
				e.preventDefault();
				return false;
			}

			if (password === '') {
				alert('Please enter password');
				e.preventDefault();
				return false;
			}

			// Ensure form submits in same tab
			this.target = '_self';
			return true;
		});
	}
});
