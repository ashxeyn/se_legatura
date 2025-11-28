import { api_config, api_request } from '../config/api';

// Type definitions based on Laravel backend forms
export interface login_data {
  username: string; // Username or Email from backend
  password: string;
}

export interface signup_form_data {
  contractor_types: contractor_type[];
  occupations: occupation[];
  valid_ids: valid_id[];
  provinces: province[];
  picab_categories: string[];
}

export interface contractor_type {
  type_id: number;
  type_name: string;
}

export interface occupation {
  id: number;
  occupation_name: string;
}

export interface valid_id {
  id: number;
  valid_id_name: string;
}

export interface province {
  code: string;
  name: string;
}

export interface city {
  code: string;
  name: string;
}

export interface barangay {
  code: string;
  name: string;
}

export interface api_response<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  status: number;
}

export class auth_service {
  // Get signup form data (contractor types, occupations, etc.)
  static async get_signup_form_data(): Promise<api_response<signup_form_data>> {
    return await api_request(api_config.endpoints.auth.signup_form, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
  }

  // Login functionality
  static async login(credentials: login_data): Promise<api_response> {
    return await api_request(api_config.endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Role selection for signup
  static async select_role(user_type: 'contractor' | 'property_owner'): Promise<api_response> {
    return await api_request('/api/role-select', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ user_type }),
    });
  }

  // Get provinces from PSGC API
  static async get_provinces(): Promise<api_response<province[]>> {
    return await api_request(api_config.endpoints.address.provinces);
  }

  // Get cities by province
  static async get_cities_by_province(province_code: string): Promise<api_response<city[]>> {
    return await api_request(api_config.endpoints.address.cities(province_code));
  }

  // Get barangays by city
  static async get_barangays_by_city(city_code: string): Promise<api_response<barangay[]>> {
    return await api_request(api_config.endpoints.address.barangays(city_code));
  }

  // Property Owner Registration Steps (using proper backend flow)
  static async property_owner_step1(personalInfo: any): Promise<api_response> {
    console.log('🔥 STEP 1 CALLED - Personal Info:', personalInfo);
    console.log('🔥 STEP 1 ENDPOINT:', api_config.endpoints.property_owner.step1);
    
    const result = await api_request(api_config.endpoints.property_owner.step1, {
      method: 'POST',
      body: JSON.stringify(personalInfo),
    });
    
    console.log('🔥 STEP 1 RESULT:', result);
    return result;
  }

  static async property_owner_step2(accountInfo: any): Promise<api_response> {
    // Transform confirmPassword to password_confirmation for Laravel validation
    const requestData = {
      ...accountInfo,
      password_confirmation: accountInfo.confirmPassword,
    };
    // Remove the confirmPassword field since Laravel expects password_confirmation
    delete requestData.confirmPassword;
    
    return await api_request(api_config.endpoints.property_owner.step2, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  static async property_owner_verify_otp(otp: string): Promise<api_response> {
    return await api_request(api_config.endpoints.property_owner.verify_otp, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  }

  static async property_owner_step4(verificationInfo: any): Promise<api_response> {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Map idType string to valid_id_id based on the database valid_ids table
    const idTypeMapping: { [key: string]: number } = {
      "Philippine Passport": 1,
      "Driver's License": 2,
      "SSS ID/UMID": 3,
      "Social Security ID (SSS)": 3,
      "PhilHealth ID": 4,
      "Voter's ID": 6,
      "Voter's ID/Certification": 6,
      "Postal ID": 7,
      "PRC ID": 8,
      "Professional Regulation Commission (PRC) ID": 8,
      "National ID": 9,
      "National ID (PhilSys)": 9,
      "Senior Citizen ID": 10,
      "OFW/OWWA ID": 11,
      "PWD ID": 12,
      "NBI Clearance": 14,
      "Barangay ID": 17,
      "GSIS eCard": 18,
      "Government Service Insurance System (GSIS) ID": 18,
      // Fallback mappings
      "Passport": 1,
      "Tax Identification Number (TIN)": 3,
      "Unified Multi-Purpose ID (UMID)": 3,
      "Police Clearance": 14,
      "Cedula": 17,
      "Other Government-Issued ID": 9,
      "School ID": 17,
      "Company ID": 17,
    };
    
    const validIdId = idTypeMapping[verificationInfo.idType] || 9;
    formData.append('valid_id_id', validIdId.toString());
    
    // Add image files with proper React Native format
    if (verificationInfo.idFrontImage) {
      formData.append('valid_id_photo', {
        uri: verificationInfo.idFrontImage,
        type: 'image/jpeg',
        name: 'id_front.jpg',
      } as any);
    }
    
    if (verificationInfo.idBackImage) {
      formData.append('valid_id_back_photo', {
        uri: verificationInfo.idBackImage,
        type: 'image/jpeg',
        name: 'id_back.jpg',
      } as any);
    }
    
    if (verificationInfo.policeClearanceImage) {
      formData.append('police_clearance', {
        uri: verificationInfo.policeClearanceImage,
        type: 'image/jpeg',
        name: 'police_clearance.jpg',
      } as any);
    }
    
    return await api_request(api_config.endpoints.property_owner.step4, {
      method: 'POST',
      body: formData,
    });
  }

  static async property_owner_final(profileInfo: any = {}): Promise<api_response> {
    console.log('🔥 PROPERTY OWNER FINAL - Profile Info:', profileInfo);
    
    try {
      // Don't refresh CSRF token here - we should already have it from previous steps
      // Refreshing might create a new session and lose the session data
      console.log('🔥 Using existing CSRF token for final step');
      
      // Create FormData for file upload if profile picture exists
      const formData = new FormData();
      
      if (profileInfo.profileImageUri) {
        console.log('🔥 Adding profile picture to FormData');
        formData.append('profile_pic', {
          uri: profileInfo.profileImageUri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);
      } else {
        console.log('🔥 No profile picture - sending empty FormData');
        // Add a dummy field to ensure FormData is not completely empty
        formData.append('skip_profile', 'true');
      }

      console.log('🔥 Calling endpoint:', api_config.endpoints.property_owner.final);
      
      // If no profile picture, just send empty form data
      const result = await api_request(api_config.endpoints.property_owner.final, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type for FormData - let the browser set it with boundary
      });
      
      console.log('🔥 PROPERTY OWNER FINAL RESULT:', result);
      return result;
    } catch (error) {
      console.error('🔥 PROPERTY OWNER FINAL ERROR:', error);
      return {
        success: false,
        data: null,
        status: 0,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Contractor Registration Steps
  static async contractor_step1(companyInfo: any): Promise<api_response> {
    // Transform camelCase to snake_case to match Laravel backend expectations
    // Clean phone number: remove spaces, dashes, and ensure it's exactly 11 digits starting with 09
    let cleanedPhone = companyInfo.companyPhone.replace(/\s+/g, '').replace(/-/g, '');
    
    const requestData: any = {
      company_name: companyInfo.companyName,
      company_phone: cleanedPhone,
      years_of_experience: parseInt(companyInfo.yearsOfExperience) || 0, // Convert to integer as required by backend
      contractor_type_id: parseInt(companyInfo.contractorTypeId) || 0, // Convert to integer as required by backend
      contractor_type_other_text: companyInfo.contractorTypeOtherText || null,
      services_offered: companyInfo.servicesOffered,
      business_address_street: companyInfo.businessAddressStreet,
      business_address_province: companyInfo.businessAddressProvince,
      business_address_city: companyInfo.businessAddressCity,
      business_address_barangay: companyInfo.businessAddressBarangay,
      business_address_postal: companyInfo.businessAddressPostal,
    };
    
    // Only include company_website if it's a valid URL or empty (backend expects nullable|url)
    if (companyInfo.companyWebsite && companyInfo.companyWebsite.trim() !== '') {
      // Ensure URL has protocol
      let websiteUrl = companyInfo.companyWebsite.trim();
      if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        websiteUrl = 'https://' + websiteUrl;
      }
      requestData.company_website = websiteUrl;
    }
    
    // Only include company_social_media if it has a value
    if (companyInfo.companySocialMedia && companyInfo.companySocialMedia.trim() !== '') {
      requestData.company_social_media = companyInfo.companySocialMedia.trim();
    }
    
    return await api_request(api_config.endpoints.contractor.step1, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  static async contractor_step2(accountInfo: any): Promise<api_response> {
    // Transform camelCase to snake_case to match Laravel backend expectations
    const requestData = {
      first_name: accountInfo.firstName,
      middle_name: accountInfo.middleName || null,
      last_name: accountInfo.lastName,
      username: accountInfo.username,
      company_email: accountInfo.companyEmail,
      password: accountInfo.password,
      password_confirmation: accountInfo.confirmPassword, // Laravel expects password_confirmation for 'confirmed' validation
    };
    
    return await api_request(api_config.endpoints.contractor.step2, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  static async contractor_verify_otp(otp: string): Promise<api_response> {
    return await api_request(api_config.endpoints.contractor.verify_otp, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  }

  static async contractor_step4(documentsInfo: any): Promise<api_response> {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add all the business document fields based on backend requirements
    formData.append('picab_number', documentsInfo.picabNumber || '');
    formData.append('picab_category', documentsInfo.picabCategory || '');
    formData.append('picab_expiration_date', documentsInfo.picabExpirationDate || '');
    formData.append('business_permit_number', documentsInfo.businessPermitNumber || '');
    formData.append('business_permit_city', documentsInfo.businessPermitCity || '');
    formData.append('business_permit_expiration', documentsInfo.businessPermitExpiration || '');
    formData.append('tin_business_reg_number', documentsInfo.tinBusinessRegNumber || '');
    
    // Add DTI/SEC registration photo (required file upload)
    if (documentsInfo.dtiSecRegistrationPhoto) {
      formData.append('dti_sec_registration_photo', {
        uri: documentsInfo.dtiSecRegistrationPhoto,
        type: 'image/jpeg',
        name: 'dti_sec_registration.jpg',
      } as any);
    }
    
    return await api_request(api_config.endpoints.contractor.step4, {
      method: 'POST',
      body: formData,
    });
  }

  static async contractor_final(profileInfo: any = {}): Promise<api_response> {
    console.log('🔥 CONTRACTOR FINAL - Profile Info:', profileInfo);
    
    try {
      // Don't refresh CSRF token here - we should already have it from previous steps
      // Refreshing might create a new session and lose the session data
      console.log('🔥 Using existing CSRF token for final step');
      
      // Create FormData for file upload if profile picture exists
      const formData = new FormData();
      
      if (profileInfo.profileImageUri) {
        console.log('🔥 Adding profile picture to FormData');
        formData.append('profile_pic', {
          uri: profileInfo.profileImageUri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);
      } else {
        console.log('🔥 No profile picture - sending empty FormData');
        // Add a dummy field to ensure FormData is not completely empty
        formData.append('skip_profile', 'true');
      }

      console.log('🔥 Calling endpoint:', api_config.endpoints.contractor.final);
      
      const result = await api_request(api_config.endpoints.contractor.final, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type for FormData - let the browser set it with boundary
      });
      
      console.log('🔥 CONTRACTOR FINAL RESULT:', result);
      return result;
    } catch (error) {
      console.error('🔥 CONTRACTOR FINAL ERROR:', error);
      return {
        success: false,
        data: null,
        status: 0,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }
}