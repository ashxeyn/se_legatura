// API configuration for connecting to Laravel backend
// Using localhost tunnel for testing - bypass firewall issues
const API_BASE_URL = 'http://192.168.254.105:3000'; // Laravel server on available port 9000

export const api = {
    baseUrl: API_BASE_URL,
    endpoints: {
        auth: {
            login: '/api/login',
            register: '/api/register',
            logout: '/api/logout',
            user: '/api/user'
        },
        contractors: {
            list: '/api/contractors',
            create: '/api/contractors',
            update: (id: number) => `/api/contractors/${id}`,
            delete: (id: number) => `/api/contractors/${id}`
        },
        accounts: {
            list: '/api/accounts',
            create: '/api/accounts',
            update: (id: number) => `/api/accounts/${id}`,
            delete: (id: number) => `/api/accounts/${id}`
        }
    }
};

// Helper function to get full URL
export const getApiUrl = (endpoint: string) => {
    return `${API_BASE_URL}${endpoint}`;
};
