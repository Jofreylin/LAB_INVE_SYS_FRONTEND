import api from '../api';
import { 
  InventoryMovement, 
  InboundDTO, 
  OutboundDTO, 
  InventoryMovementResponse 
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
  }
};
