import axios from "axios";
import { config } from "../../local_config";

const publicClient = axios.create({
  baseURL: config.api,
  headers: { "Content-Type": "application/json" },
});

export interface FestivalStage {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  color?: string;
  order_index: number;
  is_active: boolean;
}

export interface FestivalPerformance {
  id: string;
  event_id: string;
  stage_id?: string;
  title: string;
  performer_name?: string;
  description?: string;
  status: "scheduled" | "preparing" | "performing" | "done" | "cancelled";
  order_index: number;
  start_time?: string;
  duration_minutes?: number;
  performers_count?: number;
}

export const festivalPublicApi = {
  getStages: async (eventId: string): Promise<FestivalStage[]> => {
    const res = await publicClient.get(`/public/events/${eventId}/festival/stages`);
    return res.data.data ?? [];
  },

  getPerformances: async (eventId: string): Promise<FestivalPerformance[]> => {
    const res = await publicClient.get(`/public/events/${eventId}/festival/performances`);
    return res.data.data ?? [];
  },
};
