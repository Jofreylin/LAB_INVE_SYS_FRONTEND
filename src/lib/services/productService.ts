import api from '../api';
import {
  Product,
  ProductDTO,
  ProductResponse,
  ProductStockResponse,
  ProductAvailabilityResponse,
} from '../types';

const ENDPOINT = '/product';

export const ProductService = {
  getList: async (): Promise<Product[]> => {
    try {
      const response = await api.get(ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error en ProductService.getList:', error);
      throw error;
    }
  },

  getById: async (productId: number): Promise<Product> => {
    try {
      const response = await api.get(`${ENDPOINT}/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error en ProductService.getById para productId=${productId}:`, error);
      throw error;
    }
  },

  create: async (product: ProductDTO): Promise<ProductResponse> => {
    try {
      // Validación previa de datos
      if (!product.name || product.name.trim() === '') {
        throw new Error('El nombre del producto es obligatorio');
      }
      
      // Asegurar que los datos estén en el formato correcto
      const cleanProduct = {
        name: product.name.trim(),
        description: product.description?.trim() || null,
        isActive: true
      };
      
      const response = await api.post(ENDPOINT, cleanProduct);
      return response.data;
    } catch (error) {
      console.error('Error en ProductService.create:', error);
      throw error;
    }
  },

  update: async (productId: number, product: ProductDTO): Promise<ProductResponse> => {
    try {
      // Validación previa de datos
      if (!product.name || product.name.trim() === '') {
        throw new Error('El nombre del producto es obligatorio');
      }
      
      // Asegurar que los datos estén en el formato correcto
      const cleanProduct = {
        name: product.name.trim(),
        description: product.description?.trim() || null,
        isActive: true
      };
      
      const response = await api.put(`${ENDPOINT}/${productId}`, cleanProduct);
      return response.data;
    } catch (error) {
      console.error(`Error en ProductService.update para productId=${productId}:`, error);
      throw error;
    }
  },

  delete: async (productId: number): Promise<ProductResponse> => {
    try {
      const response = await api.delete(`${ENDPOINT}/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error en ProductService.delete para productId=${productId}:`, error);
      throw error;
    }
  },

  getStock: async (productId: number): Promise<ProductStockResponse> => {
    try {
      const response = await api.get(`${ENDPOINT}/${productId}/stock`);
      return response.data;
    } catch (error) {
      console.error(`Error en ProductService.getStock para productId=${productId}:`, error);
      throw error;
    }
  },

  getAvailability: async (): Promise<ProductAvailabilityResponse[]> => {
    try {
      const response = await api.get(`${ENDPOINT}/availability`);
      return response.data;
    } catch (error) {
      console.error('Error en ProductService.getAvailability:', error);
      throw error;
    }
  }
};
