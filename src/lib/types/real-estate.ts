// Типы для модуля недвижимости

export interface Project {
  id: string;
  name: string;
  description: string | null;
  developer_id: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "planning" | "construction" | "completed" | "suspended";
  total_units: number | null;
  sold_units: number | null;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  project_id: string;
  property_type: string;
  area_sqm: number | null;
  rooms: number | null;
  floor: number | null;
  price: number | null;
  status: "available" | "reserved" | "sold" | "unavailable";
  images: string[];
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Developer {
  id: string;
  business_id: string;
  company_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}
