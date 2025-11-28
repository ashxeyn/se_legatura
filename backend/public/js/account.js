// Global Variables
let currentUserType = '';
const csrfToken = document.querySelector('meta[name="csrf-token"]') ? document.querySelector('meta[name="csrf-token"]').getAttribute('content') : '';

// Role Switching Function for Dashboard
function switchRole(role, buttonElement) {
    console.log('switchRole called with role:', role);

    const target = buttonElement || (window.event ? window.event.target : null);

    // Show loading state if target exists
    if (target) {
        target.disabled = true;
        target.textContent = 'Switching...';
    }

    // Get CSRF token
    let csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
    let csrfTokenValue = csrfTokenMeta ? csrfTokenMeta.getAttribute('content') : '';

    console.log('CSRF token found:', !!csrfTokenValue);

    if (!csrfTokenValue) {
        console.error('CSRF token not found');
        alert('Security token not found. Please refresh the page.');
        // Reset button state
        if (target) {
            target.disabled = false;
            target.textContent = role === 'contractor' ? 'Switch to Contractor' : 'Switch to Property Owner';
        }
        return;
    }

    console.log('Making API call to /api/role/switch');

    // Make API call to switch role
    fetch('/api/role/switch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfTokenValue
        },
        body: JSON.stringify({
            role: role
        })
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            // Reload the page to update the role display
            window.location.reload();
        } else {
            alert('Failed to switch role: ' + data.message);
            // Reset button state
            if (target) {
                target.disabled = false;
                target.textContent = role === 'contractor' ? 'Switch to Contractor' : 'Switch to Property Owner';
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while switching roles');
        // Reset button state
        if (target) {
            target.disabled = false;
            target.textContent = role === 'contractor' ? 'Switch to Contractor' : 'Switch to Property Owner';
        }
    });
}

// Debug function to test if script is loaded
function testScriptLoaded() {
    console.log('account.js script loaded successfully');
    return true;
}

// Call debug function when script loads
testScriptLoaded();

// Utility Functions
function showError(message) {
    let errorDiv = document.getElementById('errorMessages');
    errorDiv.innerHTML = '<p>' + message + '</p>';
    errorDiv.style.display = 'block';
    document.getElementById('successMessages').style.display = 'none';
    window.scrollTo(0, 0);
}

function showSuccess(message) {
    let successDiv = document.getElementById('successMessages');
    successDiv.innerHTML = '<p>' + message + '</p>';
    successDiv.style.display = 'block';
    document.getElementById('errorMessages').style.display = 'none';
    window.scrollTo(0, 0);
}

function hideAllSteps() {
    let steps = document.querySelectorAll('.step-container');
    steps.forEach(function(step) {
        step.style.display = 'none';
    });
}

function showStep(stepId) {
    let targetStep = document.getElementById(stepId);
    if (!targetStep) {
        console.error('Step not found: ' + stepId);
        return;
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
    let inputDate = new Date(dateString);
    let today = new Date();
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
    const contractorTypeSelect = document.getElementById('contractor_type_id');
    const contractorTypeOtherContainer = document.getElementById('contractor_type_other_container');
    const contractorTypeOtherInput = document.getElementById('contractor_type_other');

    if (contractorTypeSelect) {
        contractorTypeSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const typeName = selectedOption.getAttribute('data-name');

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
    const occupationSelect = document.getElementById('occupation_id');
    const occupationOtherContainer = document.getElementById('occupation_other_container');
    const occupationOtherInput = document.getElementById('occupation_other');

    if (occupationSelect) {
        occupationSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const occupationName = selectedOption.getAttribute('data-name');

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
    const companyPhoneInput = document.getElementById('company_phone');
    if (companyPhoneInput) {
        companyPhoneInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '');
            if (this.value.length > 11) {
                this.value = this.value.slice(0, 11);
            }
        });
    }

    const ownerPhoneInput = document.getElementById('phone_number');
    if (ownerPhoneInput) {
        ownerPhoneInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '');
            if (this.value.length > 11) {
                this.value = this.value.slice(0, 11);
            }
        });
    }

// Cities for business permit
    const businessPermitCitySelect = document.getElementById('business_permit_city');
    if (businessPermitCitySelect) {
        // Get all provinces first
        fetch('/api/psgc/provinces')
            .then(response => response.json())
            .then(provinces => {
                // Fetch cities from all provinces
                const cityPromises = provinces.map(province =>
                    fetch('/api/psgc/provinces/' + province.code + '/cities')
                        .then(response => response.json())
                );

                Promise.all(cityPromises)
                    .then(citiesArrays => {
                        const allCities = citiesArrays.flat();
                        allCities.sort((a, b) => a.name.localeCompare(b.name));

                        businessPermitCitySelect.innerHTML = '<option value="">Select City/Municipality</option>';
                        allCities.forEach(city => {
                            const option = document.createElement('option');
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
    const contractorProvince = document.getElementById('business_address_province');
    if (contractorProvince) {
        contractorProvince.addEventListener('change', function() {
            const provinceCode = this.value;
            const citySelect = document.getElementById('business_address_city');
            const barangaySelect = document.getElementById('business_address_barangay');

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
                            const option = document.createElement('option');
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

    const contractorCity = document.getElementById('business_address_city');
    if (contractorCity) {
        contractorCity.addEventListener('change', function() {
            const cityCode = this.value;
            const barangaySelect = document.getElementById('business_address_barangay');

            barangaySelect.innerHTML = '<option value="">Loading...</option>';
            barangaySelect.disabled = true;

            if (cityCode) {
                fetch('/api/psgc/cities/' + cityCode + '/barangays')
                    .then(response => response.json())
                    .then(data => {
                        barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
                        data.forEach(function(barangay) {
                            const option = document.createElement('option');
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
    const ownerProvince = document.getElementById('owner_address_province');
    if (ownerProvince) {
        ownerProvince.addEventListener('change', function() {
            const provinceCode = this.value;
            const citySelect = document.getElementById('owner_address_city');
            const barangaySelect = document.getElementById('owner_address_barangay');

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
                            const option = document.createElement('option');
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

    const ownerCity = document.getElementById('owner_address_city');
    if (ownerCity) {
        ownerCity.addEventListener('change', function() {
            const cityCode = this.value;
            const barangaySelect = document.getElementById('owner_address_barangay');

            barangaySelect.innerHTML = '<option value="">Loading...</option>';
            barangaySelect.disabled = true;

            if (cityCode) {
                fetch('/api/psgc/cities/' + cityCode + '/barangays')
                    .then(response => response.json())
                    .then(data => {
                        barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
                        data.forEach(function(barangay) {
                            const option = document.createElement('option');
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
    const roleSelectionForm = document.getElementById('roleSelectionForm');
    if (roleSelectionForm) {
        roleSelectionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const userType = document.querySelector('input[name="user_type"]:checked').value;
            currentUserType = userType;

            if (userType === 'contractor') {
                showStep('stepContractor1');
            } else {
                showStep('stepOwner1');
            }
        });
    }

    // If Contractor: Step 1
    const contractorStep1Form = document.getElementById('contractorStep1Form');
    if (contractorStep1Form) {
        contractorStep1Form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);

            const companyPhone = document.getElementById('company_phone').value;
            const phoneError = validatePhoneNumber(companyPhone);
            if (phoneError) {
                showError(phoneError);
                return;
            }

            const contractorTypeSelect = document.getElementById('contractor_type_id');
            const selectedTypeOption = contractorTypeSelect.options[contractorTypeSelect.selectedIndex];
        const typeName = selectedTypeOption.getAttribute('data-name');

        if (typeName && typeName.toLowerCase() === 'others') {
            const otherTypeValue = document.getElementById('contractor_type_other').value.trim();
            if (!otherTypeValue) {
                showError('Please specify your contractor type');
                return;
            }
            formData.append('contractor_type_other_text', otherTypeValue);
        }            const provinceSelect = document.getElementById('business_address_province');
            const citySelect = document.getElementById('business_address_city');
            const barangaySelect = document.getElementById('business_address_barangay');

            if (provinceSelect.selectedIndex > 0) {
                formData.set('business_address_province', provinceSelect.options[provinceSelect.selectedIndex].getAttribute('data-name'));
            }
            if (citySelect.selectedIndex > 0) {
                formData.set('business_address_city', citySelect.options[citySelect.selectedIndex].getAttribute('data-name'));
            }
            if (barangaySelect.selectedIndex > 0) {
                formData.set('business_address_barangay', barangaySelect.options[barangaySelect.selectedIndex].getAttribute('data-name'));
            }

            // Use signup endpoint for company info (first step)
            const endpoint = '/accounts/signup/contractor/step1';

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
    const contractorStep2Form = document.getElementById('contractorStep2Form');
    if (contractorStep2Form) {
        contractorStep2Form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Skip password validation in switch mode
            if (!window.isSwitchMode) {
                const password = document.getElementById('c_password').value;
                const passwordConfirmation = document.getElementById('c_password_confirmation').value;

                const passwordError = validatePassword(password);
                if (passwordError) {
                    showError(passwordError);
                    return;
                }

                if (password !== passwordConfirmation) {
                    showError('Passwords do not match');
                    return;
                }
            }

            const formData = new FormData(this);

            // Use switch endpoint in switch mode
            const endpoint = window.isSwitchMode
                ? '/accounts/switch/contractor/step1'
                : '/accounts/signup/contractor/step2';

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
                    if (window.isSwitchMode) {
                        // Skip OTP, go directly to step 4 (documents)
                        showSuccess(data.message || 'Account information saved!');
                        showStep('stepContractor4');
                    } else {
                        showSuccess(data.message || 'OTP sent successfully!');
                        showStep('stepContractor3');
                    }
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
    const contractorStep3Form = document.getElementById('contractorStep3Form');
    if (contractorStep3Form) {
        contractorStep3Form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);

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
    const contractorStep4Form = document.getElementById('contractorStep4Form');
    if (contractorStep4Form) {
        contractorStep4Form.addEventListener('submit', function(e) {
            e.preventDefault();

            const picabExpiration = document.getElementById('picab_expiration_date').value;
            const permitExpiration = document.getElementById('business_permit_expiration').value;

            if (!validateDateInFuture(picabExpiration)) {
                showError('PICAB expiration date must be in the future');
                return;
            }

            if (!validateDateInFuture(permitExpiration)) {
                showError('Business permit expiration date must be in the future');
                return;
            }

            const formData = new FormData(this);

            // Use switch endpoint in switch mode
            const endpoint = window.isSwitchMode
                ? '/accounts/switch/contractor/step2'
                : '/accounts/signup/contractor/step4';

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
                    showSuccess(data.message || 'Documents uploaded successfully!');
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
    const contractorFinalForm = document.getElementById('contractorFinalForm');
    if (contractorFinalForm) {
        contractorFinalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);

            // Use switch endpoint in switch mode
            const endpoint = window.isSwitchMode
                ? '/accounts/switch/contractor/final'
                : '/accounts/signup/contractor/final';

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
    const ownerStep1Form = document.getElementById('ownerStep1Form');
    if (ownerStep1Form) {
        ownerStep1Form.addEventListener('submit', function(e) {
            e.preventDefault();

            const dob = document.getElementById('date_of_birth').value;
            if (!dob || new Date(dob) >= new Date()) {
                showError('Please enter a valid date of birth');
                return;
            }

            const phoneNumber = document.getElementById('phone_number').value;
            const phoneError = validatePhoneNumber(phoneNumber);
            if (phoneError) {
                showError(phoneError);
                return;
            }

            const formData = new FormData(this);

            const occupationSelect = document.getElementById('occupation_id');
            const selectedOccupationOption = occupationSelect.options[occupationSelect.selectedIndex];
            const occupationName = selectedOccupationOption.getAttribute('data-name');

            if (occupationName && occupationName.toLowerCase() === 'others') {
                const otherOccupationValue = document.getElementById('occupation_other').value.trim();
                if (!otherOccupationValue) {
                    showError('Please specify your occupation');
                    return;
                }
                formData.append('occupation_other_text', otherOccupationValue);
            }

            // Get the text names for province, city, barangay
            const provinceSelect = document.getElementById('owner_address_province');
            const citySelect = document.getElementById('owner_address_city');
            const barangaySelect = document.getElementById('owner_address_barangay');

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
    const ownerStep2Form = document.getElementById('ownerStep2Form');
    if (ownerStep2Form) {
        ownerStep2Form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Skip password validation in switch mode
            if (!window.isSwitchMode) {
                const password = document.getElementById('o_password').value;
                const passwordConfirmation = document.getElementById('o_password_confirmation').value;

                const passwordError = validatePassword(password);
                if (passwordError) {
                    showError(passwordError);
                    return;
                }

                if (password !== passwordConfirmation) {
                    showError('Passwords do not match');
                    return;
                }
            }

            const formData = new FormData(this);

            // Use switch endpoint
            const endpoint = window.isSwitchMode
                ? '/accounts/switch/owner/step1'
                : '/accounts/signup/owner/step2';

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
                    if (window.isSwitchMode) {
                        // Skip OTP, go directly to step 4 (documents)
                        showSuccess(data.message || 'Account information saved!');
                        showStep('stepOwner4');
                    } else {
                        showStep('stepOwner3');
                    }
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
    const ownerStep3Form = document.getElementById('ownerStep3Form');
    if (ownerStep3Form) {
        ownerStep3Form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);

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
    const ownerStep4Form = document.getElementById('ownerStep4Form');
    if (ownerStep4Form) {
        ownerStep4Form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);

            // Use switch endpoint in switch mode
            const endpoint = window.isSwitchMode
                ? '/accounts/switch/owner/step2'
                : '/accounts/signup/owner/step4';

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
                    showSuccess(data.message || 'Documents uploaded successfully!');
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
    const ownerFinalForm = document.getElementById('ownerFinalForm');
    if (ownerFinalForm) {
        ownerFinalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);

            // Use switch endpoint in switch mode
            const endpoint = window.isSwitchMode
                ? '/accounts/switch/owner/final'
                : '/accounts/signup/owner/final';

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
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

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
