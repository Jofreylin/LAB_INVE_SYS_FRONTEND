import api from '../api';
import { 
  InventoryMovement, 
  InboundDTO, 
  OutboundDTO, 
  InventoryMovementResponse,
  ProductMovementStats
} from '../types';

const ENDPOINT = '/inventory';

export const InventoryService = {
  inbound: async (data: InboundDTO): Promise<InventoryMovementResponse> => {
    const response = await api.post(`${ENDPOINT}/inbound`, data);
    return response.data;
  },

  outbound: async (data: OutboundDTO): Promise<InventoryMovementResponse> => {
    const response = await api.post(`${ENDPOINT}/outbound`, data);
    return response.data;
  },

  getMovements: async (): Promise<InventoryMovement[]> => {
    const response = await api.get(`${ENDPOINT}/movements`);
    return response.data;
  },

  getMonthlyStats: async (year?: number): Promise<ProductMovementStats> => {
    const url = year ? `${ENDPOINT}/monthly-stats?year=${year}` : `${ENDPOINT}/monthly-stats`;
    const response = await api.get(url);
    return response.data;
  }
};
