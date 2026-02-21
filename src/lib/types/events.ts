export interface Event {
  id: string;
  profile_id: string;
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  event_type: string;
  category?: string;
  tags?: string[];
  start_date: string;
  end_date?: string;
  is_online: boolean;
  online_url?: string;
  venue_id?: string;
  address?: string;
  city?: string;
  coordinates?: string;
  registration_required?: boolean;
  registration_start?: string;
  registration_end?: string;
  max_participants?: number;
  current_participants: number;
  age_restriction?: string;
  cover_image?: string;
  status: string;
  stage?: string;
  custom_fields?: any;
  created_at: string;
  updated_at: string;
}

export interface EventScheduleBlock {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  speaker_name?: string;
  speaker_bio?: string;
  block_type?: string;
  order_index: number;
  custom_fields?: any;
}

export interface EventSponsor {
  id: string;
  event_id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  tier?: string;
  order_index: number;
  custom_fields?: any;
}

export interface EventStats {
  total_registrations: number;
  confirmed_registrations: number;
  attended: number;
}

export interface EventsListResponse {
  success: boolean;
  data: Event[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface EventResponse {
  success: boolean;
  data: Event;
}

export interface EventScheduleResponse {
  success: boolean;
  data: EventScheduleBlock[];
}

export interface EventSponsorsResponse {
  success: boolean;
  data: EventSponsor[];
}

export interface EventStatsResponse {
  success: boolean;
  data: EventStats;
}

// Публичная регистрация
export interface PublicEventRegistrationRequest {
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  nomination_id?: string;
  custom_fields?: Record<string, any>;
  team_size: number;
  reg_city: string;
  vk_contact?: string;
  contact2?: string;
}

export interface PublicEventRegistrationResponse {
  id: string;
  event_id: string;
  name: string;
  email: string;
  qr_code: string;
  status: string;
}

export interface EventRegistrationResponse {
  success: boolean;
  data: PublicEventRegistrationResponse;
}

// Nomination для публичного API (плоский список)
export interface PublicNomination {
  id: string;
  name: string;
  description?: string;
  level: number;
  sort_order: number;
  parent_id?: string;
  registration_fee?: string;
}

export interface PublicNominationsResponse {
  success: boolean;
  data: PublicNomination[];
}

// Registration fields
export interface RegistrationField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface RegistrationFieldsResponse {
  success: boolean;
  data: RegistrationField[];
}
