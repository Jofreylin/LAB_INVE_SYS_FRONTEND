import api from '../api';
import { Supplier, SupplierDTO, SupplierResponse } from '../types';

const ENDPOINT = '/supplier';

export const SupplierService = {
  getList: async (): Promise<Supplier[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },

  getById: async (supplierId: number): Promise<Supplier> => {
    const response = await api.get(`${ENDPOINT}/${supplierId}`);
    return response.data;
  },

  create: async (supplier: SupplierDTO): Promise<SupplierResponse> => {
    const response = await api.post(ENDPOINT, supplier);
    return response.data;
  },

  update: async (supplierId: number, supplier: SupplierDTO): Promise<SupplierResponse> => {
    const response = await api.put(`${ENDPOINT}/${supplierId}`, supplier);
    return response.data;
  },

  delete: async (supplierId: number): Promise<SupplierResponse> => {
    const response = await api.delete(`${ENDPOINT}/${supplierId}`);
    return response.data;
  }
};
