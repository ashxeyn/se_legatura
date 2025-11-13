<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>{{ isset($isSwitchMode) && $isSwitchMode ? 'Switch Role' : 'Sign Up' }} - Legatura</title>
	<meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
	<h1>{{ isset($isSwitchMode) && $isSwitchMode ? 'Switch Role' : 'Sign Up' }}</h1>
	@if(isset($isSwitchMode) && $isSwitchMode)
		<p>Add {{ $currentRole === 'contractor' ? 'Property Owner' : 'Contractor' }} role to your account</p>
	@endif

	<div id="errorMessages" style="display:none; color:red;"></div>
	<div id="successMessages" style="display:none; color:green;"></div>

	@if(!isset($isSwitchMode) || !$isSwitchMode)
	<div id="stepRoleSelection" class="step-container">
		<h2>Select Your Role</h2>
		<form id="roleSelectionForm" onsubmit="return false;">
			<div>
				<label>
					<input type="radio" name="user_type" value="contractor" required>
					Contractor
				</label>
			</div>
			<div>
				<label>
					<input type="radio" name="user_type" value="property_owner" required>
					Property Owner
				</label>
			</div>
			<div>
				<button type="submit">Next</button>
			</div>
		</form>
	</div>
	@endif

	<!-- CONTRACTOR -->
	<div id="stepContractor1" class="step-container" style="{{ (isset($isSwitchMode) && $isSwitchMode && isset($currentRole) && $currentRole === 'property_owner') ? '' : 'display:none;' }}">
		<h2>Company Information</h2>
		<form id="contractorStep1Form">
			<div>
				<label for="company_name">Company Name *</label>
				<input type="text" id="company_name" name="company_name" required maxlength="200">
			</div>

			<div>
				<label for="company_phone">Company Phone *</label>
				<input type="text" id="company_phone" name="company_phone" required maxlength="11" pattern="09[0-9]{9}" placeholder="09171234567" inputmode="numeric">
			</div>

			<div>
				<label for="years_of_experience">Years of Experience *</label>
				<input type="number" id="years_of_experience" name="years_of_experience" required min="0">
			</div>

			<div>
				<label for="contractor_type_id">Contractor Type *</label>
				<select id="contractor_type_id" name="contractor_type_id" required>
					<option value="">Select Type</option>
					@foreach($contractorTypes as $type)
						<option value="{{ $type->type_id }}" data-name="{{ $type->type_name }}">{{ $type->type_name }}</option>
					@endforeach
				</select>
			</div>

			<div id="contractor_type_other_container" style="display: none;">
				<label for="contractor_type_other">Specify Contractor Type *</label>
				<input type="text" id="contractor_type_other" name="contractor_type_other" placeholder="Enter your contractor type">
			</div>

		<div>
			<label for="services_offered">Services Offered *</label>
			<textarea id="services_offered" name="services_offered" required rows="3"></textarea>
		</div>

		<h3>Business Address</h3>
		<div>
			<label for="business_address_street">Street/Building No. *</label>
			<input type="text" id="business_address_street" name="business_address_street" required placeholder="e.g., 123 Main Street">
		</div>

		<div>
			<label for="business_address_province">Province *</label>
			<select id="business_address_province" name="business_address_province" required>
				<option value="">Select Province</option>
				@foreach($provinces as $province)
					<option value="{{ $province['code'] }}" data-name="{{ $province['name'] }}">{{ $province['name'] }}</option>
				@endforeach
			</select>
		</div>

		<div>
			<label for="business_address_city">City/Municipality *</label>
			<select id="business_address_city" name="business_address_city" required disabled>
				<option value="">Select Province First</option>
			</select>
		</div>

		<div>
			<label for="business_address_barangay">Barangay *</label>
			<select id="business_address_barangay" name="business_address_barangay" required disabled>
				<option value="">Select City First</option>
			</select>
		</div>

		<div>
			<label for="business_address_postal">Postal Code *</label>
			<input type="text" id="business_address_postal" name="business_address_postal" required placeholder="e.g., 1000">
		</div>

		<div>
			<label for="company_website">Company Website (Optional)</label>
			<input type="url" id="company_website" name="company_website" maxlength="255">
		</div>

		<div>
			<label for="company_social_media">Company Social Media (Optional)</label>
			<input type="text" id="company_social_media" name="company_social_media" maxlength="255">
		</div>			<div>
				@if(!isset($isSwitchMode) || !$isSwitchMode)
					<button type="button" onclick="goBackToRole()">Back</button>
				@endif
				<button type="submit">Next</button>
			</div>
		</form>
	</div>

	<div id="stepContractor2" class="step-container" style="display:none;">
		<h2>Account Setup</h2>
		<form id="contractorStep2Form">
			@if(isset($isSwitchMode) && $isSwitchMode)
				<h3>Authorized Representative (from your Property Owner account)</h3>
			@endif
			<div>
				<label for="c_first_name">First Name *</label>
				<input type="text" id="c_first_name" name="first_name"
					value="{{ isset($isSwitchMode) && $isSwitchMode && isset($existingData['property_owner']) ? $existingData['property_owner']->first_name : '' }}"
					{{ isset($isSwitchMode) && $isSwitchMode ? 'readonly' : '' }}
					required maxlength="100">
				@if(isset($isSwitchMode) && $isSwitchMode)
					<small>Pre-filled from your Property Owner account</small>
				@endif
			</div>

			<div>
				<label for="c_middle_name">Middle Name (Optional)</label>
				<input type="text" id="c_middle_name" name="middle_name"
					value="{{ isset($isSwitchMode) && $isSwitchMode && isset($existingData['property_owner']) ? $existingData['property_owner']->middle_name : '' }}"
					{{ isset($isSwitchMode) && $isSwitchMode ? 'readonly' : '' }}
					maxlength="100">
				@if(isset($isSwitchMode) && $isSwitchMode)
					<small>Pre-filled from your Property Owner account</small>
				@endif
			</div>

			<div>
				<label for="c_last_name">Last Name *</label>
				<input type="text" id="c_last_name" name="last_name"
					value="{{ isset($isSwitchMode) && $isSwitchMode && isset($existingData['property_owner']) ? $existingData['property_owner']->last_name : '' }}"
					{{ isset($isSwitchMode) && $isSwitchMode ? 'readonly' : '' }}
					required maxlength="100">
				@if(isset($isSwitchMode) && $isSwitchMode)
					<small>Pre-filled from your Property Owner account</small>
				@endif
			</div>

			<div>
				<label for="c_username">Username *</label>
				<input type="text" id="c_username" name="username"
					value="{{ isset($isSwitchMode) && $isSwitchMode && isset($existingData['user']) ? $existingData['user']->username : '' }}"
					{{ isset($isSwitchMode) && $isSwitchMode ? 'readonly' : '' }}
					required maxlength="50">
				@if(isset($isSwitchMode) && $isSwitchMode)
					<small>Pre-filled from your account (cannot be changed)</small>
				@endif
			</div>

			<div>
				<label for="company_email">{{ isset($isSwitchMode) && $isSwitchMode ? 'Personal Email' : 'Company Email' }} *</label>
				<input type="email" id="company_email" name="company_email"
					value="{{ isset($isSwitchMode) && $isSwitchMode && isset($existingData['user']) ? $existingData['user']->email : '' }}"
					{{ isset($isSwitchMode) && $isSwitchMode ? 'readonly' : '' }}
					required maxlength="100">
				@if(isset($isSwitchMode) && $isSwitchMode)
					<small>Pre-filled from your account (cannot be changed)</small>
				@endif
			</div>

			@if(!isset($isSwitchMode) || !$isSwitchMode)
			<div>
				<label for="c_password">Password *</label>
				<input type="password" id="c_password" name="password" required minlength="8">
				<small>Min 8 chars, at least 1 uppercase, 1 number, 1 special character</small>
			</div>

			<div>
				<label for="c_password_confirmation">Confirm Password *</label>
				<input type="password" id="c_password_confirmation" name="password_confirmation" required>
			</div>
			@endif

			<div>
				<button type="button" onclick="goToStep('stepContractor1')">Back</button>
				<button type="submit">{{ isset($isSwitchMode) && $isSwitchMode ? 'Next' : 'Next (Send OTP)' }}</button>
			</div>
		</form>
	</div>

	@if(!isset($isSwitchMode) || !$isSwitchMode)
	<div id="stepContractor3" class="step-container" style="display:none;">
		<h2>Step 3: Email Verification</h2>
		<p>An OTP has been sent to your email. Please enter it below to verify your email address.</p>
		<form id="contractorStep3Form">
			<div>
				<label for="c_otp">OTP Code *</label>
				<input type="text" id="c_otp" name="otp" required maxlength="6" pattern="[0-9]{6}">
			</div>

			<div>
				<button type="button" onclick="goToStep('stepContractor2')">Back</button>
				<button type="submit">Verify OTP</button>
			</div>
		</form>
	</div>
	@endif

	<div id="stepContractor4" class="step-container" style="display:none;">
		<h2>{{ isset($isSwitchMode) && $isSwitchMode ? 'Step 2' : 'Step 4' }}: Verification Documents</h2>
		<form id="contractorStep4Form">
			<div>
				<label for="picab_number">PICAB Number *</label>
				<input type="text" id="picab_number" name="picab_number" required maxlength="100">
			</div>

			<div>
				<label for="picab_category">PICAB Category *</label>
				<select id="picab_category" name="picab_category" required>
					<option value="">Select PICAB Category</option>
					@foreach($picabCategories as $category)
						<option value="{{ $category }}">{{ $category }}</option>
					@endforeach
				</select>
			</div>

			<div>
				<label for="picab_expiration_date">PICAB Expiration Date *</label>
				<input type="date" id="picab_expiration_date" name="picab_expiration_date" required>
			</div>

			<div>
				<label for="business_permit_number">Business Permit Number *</label>
				<input type="text" id="business_permit_number" name="business_permit_number" required maxlength="100">
			</div>

			<div>
				<label for="business_permit_city">Business Permit City *</label>
				<select id="business_permit_city" name="business_permit_city" required>
					<option value="">Loading cities...</option>
				</select>
			</div>

			<div>
				<label for="business_permit_expiration">Business Permit Expiration *</label>
				<input type="date" id="business_permit_expiration" name="business_permit_expiration" required>
			</div>

			<div>
				<label for="tin_business_reg_number">TIN/Business Registration Number *</label>
				<input type="text" id="tin_business_reg_number" name="tin_business_reg_number" required maxlength="100">
			</div>

			<div>
				<label for="dti_sec_registration_photo">DTI/SEC Registration Photo *</label>
				<input type="file" id="dti_sec_registration_photo" name="dti_sec_registration_photo" required accept=".jpg,.jpeg,.png,.pdf">
				<small>JPG, PNG, or PDF (Max 5MB)</small>
			</div>

			<div>
				<button type="button" onclick="goToStep('{{ isset($isSwitchMode) && $isSwitchMode ? 'stepContractor2' : 'stepContractor3' }}')">Back</button>
				<button type="submit">Next</button>
			</div>
		</form>
	</div>

	<div id="stepContractorFinal" class="step-container" style="display:none;">
		<h2>{{ isset($isSwitchMode) && $isSwitchMode ? 'Step 3' : 'Step 5' }}: Profile Picture</h2>
		<form id="contractorFinalForm">
			<div>
				<label for="c_profile_pic">Profile Picture (Optional)</label>
				<input type="file" id="c_profile_pic" name="profile_pic" accept=".jpg,.jpeg,.png">
				<small>JPG or PNG (Max 2MB)</small>
			</div>

			<div>
				<button type="button" onclick="goToStep('stepContractor4')">Back</button>
				<button type="submit">{{ isset($isSwitchMode) && $isSwitchMode ? 'Complete Role Switch' : 'Complete Registration' }}</button>
			</div>
		</form>
	</div>

	<!-- PROPERTY OWNER -->
	<div id="stepOwner1" class="step-container" style="{{ (isset($isSwitchMode) && $isSwitchMode && isset($currentRole) && $currentRole === 'contractor') ? '' : 'display:none;' }}">
		<h2>Personal Information</h2>
		<form id="ownerStep1Form">
			@if(isset($isSwitchMode) && $isSwitchMode)
				<h3>Personal Information (from your Contractor account)</h3>
			@endif
			<div>
				<label for="o_first_name">First Name *</label>
				<input type="text" id="o_first_name" name="first_name"
					value="{{ isset($isSwitchMode) && $isSwitchMode && isset($existingData['contractor_user']) ? $existingData['contractor_user']->authorized_rep_fname : '' }}"
					{{ isset($isSwitchMode) && $isSwitchMode ? 'readonly' : '' }}
					required maxlength="100">
				@if(isset($isSwitchMode) && $isSwitchMode)
					<small>Pre-filled from your Contractor account</small>
				@endif
			</div>

			<div>
				<label for="o_middle_name">Middle Name (Optional)</label>
				<input type="text" id="o_middle_name" name="middle_name"
					value="{{ isset($isSwitchMode) && $isSwitchMode && isset($existingData['contractor_user']) ? $existingData['contractor_user']->authorized_rep_mname : '' }}"
					{{ isset($isSwitchMode) && $isSwitchMode ? 'readonly' : '' }}
					maxlength="100">
				@if(isset($isSwitchMode) && $isSwitchMode)
					<small>Pre-filled from your Contractor account</small>
				@endif
			</div>

			<div>
				<label for="o_last_name">Last Name *</label>
				<input type="text" id="o_last_name" name="last_name"
					value="{{ isset($isSwitchMode) && $isSwitchMode && isset($existingData['contractor_user']) ? $existingData['contractor_user']->authorized_rep_lname : '' }}"
					{{ isset($isSwitchMode) && $isSwitchMode ? 'readonly' : '' }}
					required maxlength="100">
				@if(isset($isSwitchMode) && $isSwitchMode)
					<small>Pre-filled from your Contractor account</small>
				@endif
			</div>

			<div>
				<label for="occupation_id">Occupation *</label>
				<select id="occupation_id" name="occupation_id" required>
					<option value="">Select Occupation</option>
					@foreach($occupations as $occupation)
						<option value="{{ $occupation->id }}" data-name="{{ $occupation->occupation_name }}">{{ $occupation->occupation_name }}</option>
					@endforeach
				</select>
			</div>

			<div id="occupation_other_container" style="display: none;">
				<label for="occupation_other">Specify Occupation *</label>
				<input type="text" id="occupation_other" name="occupation_other" placeholder="Enter your occupation">
			</div>

			<div>
				<label for="date_of_birth">Date of Birth *</label>
				<input type="date" id="date_of_birth" name="date_of_birth" required>
			</div>

			<div>
			<label for="phone_number">Phone Number *</label>
			<input type="text" id="phone_number" name="phone_number"
				value="{{ isset($isSwitchMode) && $isSwitchMode && isset($existingData['contractor_user']) ? $existingData['contractor_user']->phone_number : '' }}"
				{{ isset($isSwitchMode) && $isSwitchMode ? 'readonly' : '' }}
				required maxlength="11" pattern="09[0-9]{9}" placeholder="09171234567" inputmode="numeric">
			@if(isset($isSwitchMode) && $isSwitchMode)
				<small>Pre-filled from your Contractor account</small>
			@else
				<small>11 digits starting with 09</small>
			@endif
		</div>

		<h3>Address</h3>
		<div>
			<label for="owner_address_street">Street/Building No. *</label>
			<input type="text" id="owner_address_street" name="owner_address_street" required placeholder="e.g., 456 Oak Avenue">
		</div>

		<div>
			<label for="owner_address_province">Province *</label>
			<select id="owner_address_province" name="owner_address_province" required>
				<option value="">Select Province</option>
				@foreach($provinces as $province)
					<option value="{{ $province['code'] }}" data-name="{{ $province['name'] }}">{{ $province['name'] }}</option>
				@endforeach
			</select>
		</div>

		<div>
			<label for="owner_address_city">City/Municipality *</label>
			<select id="owner_address_city" name="owner_address_city" required disabled>
				<option value="">Select Province First</option>
			</select>
		</div>

		<div>
			<label for="owner_address_barangay">Barangay *</label>
			<select id="owner_address_barangay" name="owner_address_barangay" required disabled>
				<option value="">Select City First</option>
			</select>
		</div>

		<div>
			<label for="owner_address_postal">Postal Code *</label>
			<input type="text" id="owner_address_postal" name="owner_address_postal" required placeholder="e.g., 1000">
		</div>

		<div>
			@if(!isset($isSwitchMode) || !$isSwitchMode)
				<button type="button" onclick="goBackToRole()">Back</button>
			@endif
			<button type="submit">Next</button>
		</div>
	</form>
</div>

	<div id="stepOwner2" class="step-container" style="display:none;">
		<h2>Account Setup</h2>
		<form id="ownerStep2Form">
			<div>
				<label for="o_username">Username *</label>
				<input type="text" id="o_username" name="username"
					value="{{ isset($isSwitchMode) && $isSwitchMode && isset($existingData['user']) ? $existingData['user']->username : '' }}"
					{{ isset($isSwitchMode) && $isSwitchMode ? 'readonly' : '' }}
					required maxlength="50">
				@if(isset($isSwitchMode) && $isSwitchMode)
					<small>Pre-filled from your account (cannot be changed)</small>
				@endif
			</div>

			<div>
				<label for="o_email">Email *</label>
				<input type="email" id="o_email" name="email"
					value="{{ isset($isSwitchMode) && $isSwitchMode && isset($existingData['user']) ? $existingData['user']->email : '' }}"
					{{ isset($isSwitchMode) && $isSwitchMode ? 'readonly' : '' }}
					required maxlength="100">
				@if(isset($isSwitchMode) && $isSwitchMode)
					<small>Pre-filled from your account (cannot be changed)</small>
				@endif
			</div>

			@if(!isset($isSwitchMode) || !$isSwitchMode)
			<div>
				<label for="o_password">Password *</label>
				<input type="password" id="o_password" name="password" required minlength="8">
				<small>Min 8 chars, at least 1 uppercase, 1 number, 1 special character</small>
			</div>

			<div>
				<label for="o_password_confirmation">Confirm Password *</label>
				<input type="password" id="o_password_confirmation" name="password_confirmation" required>
			</div>
			@endif

			<div>
				<button type="button" onclick="goToStep('stepOwner1')">Back</button>
				<button type="submit">{{ isset($isSwitchMode) && $isSwitchMode ? 'Next' : 'Next (Send OTP)' }}</button>
			</div>
		</form>
	</div>

	@if(!isset($isSwitchMode) || !$isSwitchMode)
	<div id="stepOwner3" class="step-container" style="display:none;">
		<h2>Step 3: Email Verification</h2>
		<p>An OTP has been sent to your email. Please enter it below to verify your email address.</p>
		<form id="ownerStep3Form">
			<div>
				<label for="o_otp">OTP Code *</label>
				<input type="text" id="o_otp" name="otp" required maxlength="6" pattern="[0-9]{6}">
			</div>

			<div>
				<button type="button" onclick="goToStep('stepOwner2')">Back</button>
				<button type="submit">Verify OTP</button>
			</div>
		</form>
	</div>
	@endif

	<div id="stepOwner4" class="step-container" style="display:none;">
		<h2>{{ isset($isSwitchMode) && $isSwitchMode ? 'Step 2' : 'Step 4' }}: Verification Documents</h2>
		<form id="ownerStep4Form">
			<div>
				<label for="valid_id_id">Valid ID Type *</label>
				<select id="valid_id_id" name="valid_id_id" required>
					<option value="">Select ID Type</option>
					@foreach($validIds as $validId)
						<option value="{{ $validId->id }}">{{ $validId->valid_id_name }}</option>
					@endforeach
				</select>
			</div>

			<div>
				<label for="valid_id_photo">Valid ID Front Photo *</label>
				<input type="file" id="valid_id_photo" name="valid_id_photo" required accept=".jpg,.jpeg,.png">
				<small>JPG or PNG (Max 5MB)</small>
			</div>

			<div>
				<label for="valid_id_back_photo">Valid ID Back Photo *</label>
				<input type="file" id="valid_id_back_photo" name="valid_id_back_photo" required accept=".jpg,.jpeg,.png">
				<small>JPG or PNG (Max 5MB)</small>
			</div>

			<div>
				<label for="police_clearance">Police Clearance *</label>
				<input type="file" id="police_clearance" name="police_clearance" required accept=".jpg,.jpeg,.png,.pdf">
				<small>JPG, PNG, or PDF (Max 5MB)</small>
			</div>

			<div>
				<button type="button" onclick="goToStep('{{ isset($isSwitchMode) && $isSwitchMode ? 'stepOwner2' : 'stepOwner3' }}')">Back</button>
				<button type="submit">Next</button>
			</div>
		</form>
	</div>

	<div id="stepOwnerFinal" class="step-container" style="display:none;">
		<h2>{{ isset($isSwitchMode) && $isSwitchMode ? 'Step 3' : 'Step 5' }}: Profile Picture</h2>
		<form id="ownerFinalForm">
			<div>
				<label for="o_profile_pic">Profile Picture (Optional)</label>
				<input type="file" id="o_profile_pic" name="profile_pic" accept=".jpg,.jpeg,.png">
				<small>JPG or PNG (Max 2MB)</small>
			</div>

			<div>
				<button type="button" onclick="goToStep('stepOwner4')">Back</button>
				<button type="submit">{{ isset($isSwitchMode) && $isSwitchMode ? 'Complete Role Switch' : 'Complete Registration' }}</button>
			</div>
		</form>
	</div>

	@if(!isset($isSwitchMode) || !$isSwitchMode)
	<p>Already have an account? <a href="/accounts/login">Login here</a></p>
	@endif

@if(isset($isSwitchMode) && $isSwitchMode)
<script>
	window.isSwitchMode = true;
	window.currentRole = '{{ $currentRole }}';
</script>
@endif
<script src="{{ asset('js/account.js') }}"></script>
</body>
</html>
