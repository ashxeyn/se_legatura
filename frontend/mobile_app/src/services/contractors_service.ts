import { api_config, api_request } from '../config/api';

/**
 * Backend contractor data structure from getActiveContractors()
 * This matches the structure returned by backend/app/Models/owner/projectsClass.php
 */
export interface BackendContractor {
  contractor_id: number;
  company_name: string;
  years_of_experience: number;
  services_offered: string | null;
  business_address: string | null;
  company_website: string | null;
  company_social_media: string | null;
  company_description: string | null;
  picab_number: string | null;
  picab_category: string | null;
  business_permit_number: string | null;
  completed_projects: number;
  created_at: string;
  type_name: string; // Contractor type name
  user_id: number;
  username: string;
  profile_pic: string | null;
  cover_photo: string | null;
}

/**
 * Frontend contractor interface for display
 * Matches the data structure used in dashboard.blade.php (lines 322-393)
 */
export interface Contractor {
  contractor_id: number;
  company_name: string;
  company_description?: string;
  location?: string;
  rating?: number;
  reviews_count?: number;
  distance?: string;
  contractor_type?: string;
  logo_url?: string;
  image_url?: string;
  cover_photo?: string; // Cover photo path for feed display
  years_of_experience?: number;
  services_offered?: string;
  completed_projects?: number;
  user_id?: number; // Needed for color generation (matching backend logic)
  created_at?: string; // For "Joined" date display
}

/**
 * API response wrapper
 */
export interface api_response<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  status: number;
}

/**
 * Contractors Service
 * Handles fetching contractor data from the backend API
 */
export class contractors_service {
  /**
   * Fetch all active contractors from the backend
   * This calls the backend endpoint that uses getActiveContractors() method
   * 
   * IMPORTANT: The backend endpoint /api/contractors needs to be created.
   * The backend should add this route in routes/api.php:
   *   Route::get('/contractors', [projectsController::class, 'apiGetContractors']);
   * 
   * And create a method in projectsController:
   *   public function apiGetContractors(Request $request) {
   *     $excludeUserId = $request->query('exclude_user_id');
   *     $contractors = $this->projectsClass->getActiveContractors($excludeUserId);
   *     return response()->json($contractors);
   *   }
   * 
   * @param excludeUserId - Optional user ID to exclude from results (for 'both' users)
   * @returns Promise with API response containing array of contractors
   */
  static async get_active_contractors(excludeUserId?: number): Promise<api_response<BackendContractor[]>> {
    try {
      // Build query parameters if excludeUserId is provided
      const params = excludeUserId ? `?exclude_user_id=${excludeUserId}` : '';
      const endpoint = `${api_config.endpoints.contractors.list}${params}`;
      
      const response = await api_request(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      return response;
    } catch (error) {
      console.error('Error fetching contractors:', error);
      return {
        success: false,
        data: undefined,
        status: 0,
        message: error instanceof Error ? error.message : 'Failed to fetch contractors',
      };
    }
  }

  /**
   * Transform backend contractor data to frontend format
   * Maps the backend structure to the frontend Contractor interface
   * 
   * @param backendContractor - Contractor data from backend
   * @param baseUrl - Base URL for image assets (defaults to API base URL)
   * @returns Transformed contractor data for frontend display
   */
  /**
   * Transform backend contractor data to frontend format
   * Maps the backend structure to the frontend Contractor interface
   * This matches the exact data structure used in dashboard.blade.php
   * 
   * @param backendContractor - Contractor data from backend
   * @param baseUrl - Base URL for image assets (defaults to API base URL)
   * @returns Transformed contractor data for frontend display
   */
  static transform_contractor(
    backendContractor: BackendContractor,
    baseUrl: string = api_config.base_url
  ): Contractor {
    // Build image URL from profile_pic if available
    // Backend uses: asset('storage/' . $profilePic) - so we need to construct the full URL
    let logoUrl: string | undefined;
    let imageUrl: string | undefined;
    
    if (backendContractor.profile_pic) {
      // Profile pic is stored in storage, construct full URL matching Laravel's asset() helper
      // Backend: asset('storage/' . $profilePic) becomes: baseUrl/storage/profile_pic_path
      const profilePicPath = backendContractor.profile_pic.startsWith('http')
        ? backendContractor.profile_pic
        : `${baseUrl}/storage/${backendContractor.profile_pic}`;
      logoUrl = profilePicPath;
      imageUrl = profilePicPath; // Use same image for both logo and card image
    } else {
      // Use placeholder if no profile pic (matching backend fallback behavior)
      imageUrl = 'https://via.placeholder.com/400x200';
    }

    return {
      contractor_id: backendContractor.contractor_id,
      company_name: backendContractor.company_name,
      company_description: backendContractor.company_description || undefined,
      location: backendContractor.business_address || undefined,
      rating: 5.0, // Default rating (not available in backend yet)
      reviews_count: 0, // Default reviews count (not available in backend yet)
      distance: undefined, // Would need location calculation
      contractor_type: backendContractor.type_name,
      logo_url: logoUrl,
      image_url: imageUrl,
      cover_photo: backendContractor.cover_photo || undefined, // Cover photo for feed display
      years_of_experience: backendContractor.years_of_experience,
      services_offered: backendContractor.services_offered || undefined,
      completed_projects: backendContractor.completed_projects,
      user_id: backendContractor.user_id, // Include for color generation (matching backend logic)
      created_at: backendContractor.created_at, // For "Joined" date display
    };
  }

  /**
   * Transform array of backend contractors to frontend format
   * 
   * @param backendContractors - Array of contractor data from backend
   * @param baseUrl - Base URL for image assets
   * @returns Array of transformed contractor data
   */
  static transform_contractors(
    backendContractors: BackendContractor[],
    baseUrl: string = api_config.base_url
  ): Contractor[] {
    return backendContractors.map(contractor => 
      this.transform_contractor(contractor, baseUrl)
    );
  }
}

