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
    const response = await api.get(ENDPOINT);
    return response.data;
  },

  getById: async (productId: number): Promise<Product> => {
    const response = await api.get(`${ENDPOINT}/${productId}`);
    return response.data;
  },

  create: async (product: ProductDTO): Promise<ProductResponse> => {
    const response = await api.post(ENDPOINT, {
      name: product.name.trim(),
      description: product.description?.trim() || null,
      commonPurchasePrice: product.commonPurchasePrice,
      regularSalePrice: product.regularSalePrice,
      maxSalePrice: product.maxSalePrice,
      minSalePrice: product.minSalePrice,
      supplierId: product.supplierId,
      isActive: true
    });
    return response.data;
  },

  update: async (productId: number, product: ProductDTO): Promise<ProductResponse> => {
    const response = await api.put(`${ENDPOINT}/${productId}`, {
      name: product.name.trim(),
      description: product.description?.trim() || null,
      commonPurchasePrice: product.commonPurchasePrice,
      regularSalePrice: product.regularSalePrice,
      maxSalePrice: product.maxSalePrice,
      minSalePrice: product.minSalePrice,
      supplierId: product.supplierId,
      isActive: true
    });
    return response.data;
  },

  delete: async (productId: number): Promise<ProductResponse> => {
    const response = await api.delete(`${ENDPOINT}/${productId}`);
    return response.data;
  },

  getStock: async (productId: number): Promise<ProductStockResponse> => {
    const response = await api.get(`${ENDPOINT}/${productId}/stock`);
    return response.data;
  },

  getAvailability: async (): Promise<ProductAvailabilityResponse[]> => {
    const response = await api.get(`${ENDPOINT}/availability`);
    return response.data;
  }
};
