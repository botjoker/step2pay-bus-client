import { config } from "@/local_config";

const API_URL = config.api;

// ============================================================
// ТИПЫ
// ============================================================

export interface PublicTicketItem {
  id: string;
  sector_id?: string;
  row_id?: string;
  seat_label?: string;
  price: string;
  status: "available" | "reserved" | "sold" | "used" | "cancelled";
}

export interface PublicRow {
  id: string;
  label: string;
  seats_count?: number;
  order_index?: number;
}

export interface PublicSector {
  id: string;
  name: string;
  color?: string;
  order_index?: number;
  rows: PublicRow[];
}

export interface TicketMapResponse {
  config_id: string;
  config_name: string;
  sectors: PublicSector[];
  items: PublicTicketItem[];
}

export interface CheckoutRequest {
  ticket_ids: string[];
  payer_email: string;
  buyer_name?: string;
}

export interface CheckoutResponse {
  order_id: string;
  amount: string;
  payment_url_path: string;
}

// ============================================================
// API ФУНКЦИИ
// ============================================================

export const ticketsApi = {
  // Получить схему зала с билетами
  getMap: async (configId: string): Promise<TicketMapResponse> => {
    const res = await fetch(`${API_URL}/public/tickets/${configId}/map`);
    if (!res.ok) throw new Error("Не удалось загрузить схему зала");
    const json = await res.json();
    return json;
  },

  // Оформить покупку (резервирование + создание заказа)
  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    const res = await fetch(`${API_URL}/public/tickets/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || err?.message || "Ошибка оформления заказа");
    }
    const json = await res.json();
    return json.data;
  },

  // Получить данные заказа (QR коды после оплаты)
  getOrderItems: async (orderId: string) => {
    const res = await fetch(`${API_URL}/public/payment-order/${orderId}`);
    if (!res.ok) throw new Error("Заказ не найден");
    return res.json();
  },
};
