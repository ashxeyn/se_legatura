// API configuration for connecting to Laravel backend
const API_BASE_URL = 'http://192.168.254.131:3000';

export const api_config = {
    base_url: API_BASE_URL,
    endpoints: {
        // Authentication endpoints
        auth: {
            login: '/accounts/login',
            signup_form: '/api/signup-form',
        },

        // Registration flow endpoints (using web routes - proper flow)
        contractor: {
            step1: '/accounts/signup/contractor/step1',
            step2: '/accounts/signup/contractor/step2',
            verify_otp: '/accounts/signup/contractor/step3/verify-otp',
            step4: '/accounts/signup/contractor/step4',
            final: '/accounts/signup/contractor/final',
        },

        property_owner: {
            step1: '/accounts/signup/owner/step1',
            step2: '/accounts/signup/owner/step2',
            verify_otp: '/accounts/signup/owner/step3/verify-otp',
            step4: '/accounts/signup/owner/step4',
            final: '/accounts/signup/owner/final',
        },

        // Address/Location endpoints (using API routes)
        address: {
            provinces: '/api/provinces',
            cities: (province_code: string) => `/api/provinces/${province_code}/cities`,
            barangays: (city_code: string) => `/api/cities/${city_code}/barangays`,
        },

        // Contractors endpoints (for property owner feed/homepage)
        // NOTE: This endpoint needs to be created in the backend
        // The backend should add: Route::get('/api/contractors', [projectsController::class, 'apiGetContractors'])
        // That method should call getActiveContractors() and return JSON
        contractors: {
            list: '/api/contractors', // Endpoint to fetch active contractors (needs to be created in backend)
        }
    }
};

// Helper function to get full URL
export const get_api_url = (endpoint: string) => {
    return `${API_BASE_URL}${endpoint}`;
};

// Simple CSRF token storage
let csrfToken: string | null = null;

// Get CSRF token from Laravel
export const getCsrfToken = async (): Promise<string | null> => {
    try {
        console.log('Fetching CSRF token from:', `${API_BASE_URL}/sanctum/csrf-cookie`);
        const response = await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
            method: 'GET',
            credentials: 'include', // This ensures cookies are sent and received
        });
        
        console.log('CSRF response status:', response.status);
        
        if (response.ok) {
            // Try to get from response headers
            const setCookieHeader = response.headers.get('set-cookie');
            console.log('Set-Cookie header:', setCookieHeader);
            
            if (setCookieHeader) {
                const tokenMatch = setCookieHeader.match(/XSRF-TOKEN=([^;]+)/);
                if (tokenMatch) {
                    csrfToken = decodeURIComponent(tokenMatch[1]);
                    console.log('CSRF token extracted from header:', csrfToken);
                    return csrfToken;
                }
            }
        }
        
        console.log('Failed to get CSRF token from response');
    } catch (error) {
        console.log('CSRF token fetch failed:', error);
    }
    return null;
};

// API request helper with proper headers and CSRF handling
export const api_request = async (
    endpoint: string,
    options: RequestInit = {}
) => {
    const url = get_api_url(endpoint);

    console.log(`Making API request to: ${url}`);

    // For web routes (non-API), get CSRF token if we don't have one
    // Don't refresh on every request to avoid interfering with session
    if (!endpoint.startsWith('/api/')) {
        if (!csrfToken) {
            console.log('Getting CSRF token for:', endpoint);
            await getCsrfToken();
        }
        console.log('Using CSRF token:', csrfToken ? 'Present' : 'Missing');
    }

    const default_headers: any = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // Laravel expects this for JSON responses
    };

    // Only set Content-Type for JSON requests (not for FormData)
    if (!(options.body instanceof FormData)) {
        default_headers['Content-Type'] = 'application/json';
    }

    // Add CSRF token if available
    if (csrfToken && !endpoint.startsWith('/api/')) {
        default_headers['X-XSRF-TOKEN'] = csrfToken;
    }

    const config: RequestInit = {
        ...options,
        credentials: 'include', // Include cookies for session management
        headers: {
            ...default_headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        console.log(`Response status: ${response.status}`);

        // Get response text first to check if it's valid JSON
        const response_text = await response.text();
        console.log('Raw response:', response_text.substring(0, 500));

        if (!response_text.trim()) {
            throw new Error('Empty response from server');
        }

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(response_text);
        } catch (json_error) {
            console.error('JSON parse error:', json_error);

            // If response looks like HTML (probably an error page)
            if (response_text.trim().startsWith('<')) {
                throw new Error('Server returned HTML instead of JSON. Check if Laravel backend is running correctly.');
            } else {
                throw new Error(`Invalid JSON response: ${json_error instanceof Error ? json_error.message : 'Unknown parsing error'}`);
            }
        }

        return {
            success: response.ok,
            data,
            status: response.status,
            message: data?.message,
        };
    } catch (error) {
        console.error('API Request Error:', error);
        return {
            success: false,
            data: null,
            status: 0,
            message: error instanceof Error ? error.message : 'Network error occurred',
        };
    }
};

