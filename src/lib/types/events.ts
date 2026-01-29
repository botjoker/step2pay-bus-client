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
