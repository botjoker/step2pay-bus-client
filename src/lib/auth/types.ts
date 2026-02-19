export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refresh_token: string;
}

export interface RefreshResponse {
  success: boolean;
  token: string;
  refresh_token: string;
}

export interface ClientUser {
  account_id: string;
  username?: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  tg?: string;
  profile_id: string;
  domain?: string;
  company_name?: string;
  entity_type?: "customer" | "specialist";

  // Данные customer
  customer_id?: string;
  customer_type?: string;
  display_name?: string;
  customer_phone?: string;
  customer_email?: string;
  address_city?: string;
  address_street?: string;

  // Данные specialist
  specialist_id?: string;
  specialist_first_name?: string;
  specialist_last_name?: string;
  specialist_phone?: string;
  specialist_email?: string;
  position?: string;
  specialization?: string;

  // Включённые модули тенанта
  enabled_modules?: string[];
}

export interface JWTPayload {
  sub: string;
  profile_id?: string;
  domain?: string;
  role?: string;
  exp?: number;
}
