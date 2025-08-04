import api from '../api';
import { 
  ReserveStockDTO, 
  ReserveStockResponse, 
  ReleaseStockDTO, 
  ReleaseStockResponse 
} from '../types';

const ENDPOINT = '/stock';

export const StockService = {
  reserve: async (data: ReserveStockDTO): Promise<ReserveStockResponse> => {
    const response = await api.post(`${ENDPOINT}/reserve`, data);
    return response.data;
  },

  release: async (data: ReleaseStockDTO): Promise<ReleaseStockResponse> => {
    const response = await api.post(`${ENDPOINT}/release`, data);
    return response.data;
  }
};
