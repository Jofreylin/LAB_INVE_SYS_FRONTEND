import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7178/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Add these settings for better CORS and error handling
  withCredentials: false,
  timeout: 30000
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Log detailed error information for debugging
    console.log('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      requestData: error.config?.data,
    });
    
    // Extract the most meaningful error message with more detail
    let errorMessage = '';
    
    if (error.response) {
      // Error from server with response
      if (error.response.status === 400) {
        // Handle validation errors specially
        if (error.response.data?.errors) {
          // Combine validation errors into a single message
          const validationErrors = [];
          for (const field in error.response.data.errors) {
            validationErrors.push(`${field}: ${error.response.data.errors[field].join(', ')}`);
          }
          if (validationErrors.length > 0) {
            errorMessage = `Errores de validación: ${validationErrors.join('; ')}`;
          } else {
            errorMessage = 'Datos inválidos en la solicitud';
          }
        } else {
          errorMessage = error.response.data?.message ||
                         error.response.data?.title ||
                         'Petición inválida';
        }
      } else if (error.response.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.response.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else {
        errorMessage = error.response.data?.message ||
                     error.response.data?.title ||
                     error.response.data?.error ||
                     `Error ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      // Request made but no response received
      errorMessage = 'No se recibió respuesta del servidor. Verifique su conexión.';
    } else {
      // Error setting up the request
      errorMessage = error.message || 'Error al configurar la solicitud';
    }
    
    // Show toast notification for API errors
    toast.error(errorMessage);
    
    return Promise.reject({ ...error, message: errorMessage });
  }
);

export default api;
