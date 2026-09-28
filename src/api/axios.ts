// src/api/axiosInstance.js
import { setLogout } from '@/state/auth';
import axios from 'axios';

declare module 'axios' {
	interface AxiosRequestConfig {
		/** Handle a 401 at the call site instead of clearing storage and redirecting to login. */
		skipAuthRedirect?: boolean;
	}
}

// Create an instance
const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_SERVER_HEAD, // Base URL for the API
	withCredentials: true, // if you're using cookies
});


// Response interceptor
axiosInstance.interceptors.response.use(
	response => response,
	error => {
		const status = error.response?.status;

		if (status === 401 && !error.config?.skipAuthRedirect) {
			localStorage.clear();
			if (window.location.pathname !== '/auth' && window.location.pathname !== '/merchant/login') {
				const next = window.location.pathname + window.location.search;
				if (window.location.pathname.startsWith('/merchant')) {
					window.location.href = '/merchant/login' + `?next=${encodeURIComponent(next)}`;
				} else {
					window.location.href = '/auth?page=login' + `&next=${encodeURIComponent(next)}`;
				}
			}
		}
		// } else if (status === 403) {
		// 	// Handle Forbidden
		// 	alert('You do not have permission to perform this action.');
		// 	window.location.href = '/me';
		// }

		// Optionally rethrow or return a custom error object
		return Promise.reject(error);
	}
);

export default axiosInstance;