import api from '../api';
import { Warehouse, WarehouseDTO, WarehouseResponse } from '../types';

const ENDPOINT = '/warehouse';

export const WarehouseService = {
  getList: async (): Promise<Warehouse[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },

  getById: async (warehouseId: number): Promise<Warehouse> => {
    const response = await api.get(`${ENDPOINT}/${warehouseId}`);
    return response.data;
  },

  create: async (warehouse: WarehouseDTO): Promise<WarehouseResponse> => {
    const response = await api.post(ENDPOINT, warehouse);
    return response.data;
  },

  update: async (warehouseId: number, warehouse: WarehouseDTO): Promise<WarehouseResponse> => {
    const response = await api.put(`${ENDPOINT}/${warehouseId}`, warehouse);
    return response.data;
  },

  delete: async (warehouseId: number): Promise<WarehouseResponse> => {
    const response = await api.delete(`${ENDPOINT}/${warehouseId}`);
    return response.data;
  }
};
