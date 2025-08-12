import api from '../api';
import { 
  ReserveStockDTO, 
  ReserveStockResponse, 
  ReleaseStockDTO, 
  ReleaseStockResponse,
  ReservationListResponse
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
  },

  getReservations: async (): Promise<ReservationListResponse[]> => {
    const response = await api.get(`${ENDPOINT}/reservations`);
    return response.data;
  }
};
