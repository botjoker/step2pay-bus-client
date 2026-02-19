import { apiClient } from "@/lib/api";

// ── Типы ──────────────────────────────────────────────────────

export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "needs_revision"
  | "approved"
  | "rejected";

export interface Submission {
  id: string;
  event_id: string;
  registration_id: string;
  title: string;
  description?: string;
  performers_count?: number;
  requested_stage_id?: string;
  preferred_start_time?: string;
  duration_minutes?: number;
  lighting_notes?: string;
  sound_notes?: string;
  stage_notes?: string;
  technical_rider?: Record<string, unknown>;
  status: SubmissionStatus;
  reviewer_notes?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubmissionProp {
  id: string;
  submission_id: string;
  name: string;
  description?: string;
  quantity?: number;
  order_index?: number;
  created_at: string;
}

export interface Phonogram {
  id: string;
  event_id: string;
  media_id?: string;
  title: string;
  artist?: string;
  duration_seconds?: number;
  notes?: string;
  s3_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  s3_url: string;
}

// ── Submission CRUD ───────────────────────────────────────────

export const submissionsApi = {
  list: async (eventId: string): Promise<Submission[]> => {
    const { data } = await apiClient.get(`/api/client/events/${eventId}/submissions`);
    return data.data;
  },

  create: async (eventId: string, payload: {
    title: string;
    description?: string;
    performers_count?: number;
    requested_stage_id?: string;
    preferred_start_time?: string;
    duration_minutes?: number;
    lighting_notes?: string;
    sound_notes?: string;
    stage_notes?: string;
  }): Promise<Submission> => {
    const { data } = await apiClient.post(`/api/client/events/${eventId}/submissions`, payload);
    return data.data;
  },

  update: async (eventId: string, id: string, payload: Partial<{
    title: string;
    description: string;
    performers_count: number;
    requested_stage_id: string;
    preferred_start_time: string;
    duration_minutes: number;
    lighting_notes: string;
    sound_notes: string;
    stage_notes: string;
  }>): Promise<Submission> => {
    const { data } = await apiClient.put(`/api/client/events/${eventId}/submissions/${id}`, payload);
    return data.data;
  },

  delete: async (eventId: string, id: string): Promise<void> => {
    await apiClient.delete(`/api/client/events/${eventId}/submissions/${id}`);
  },

  submit: async (eventId: string, id: string): Promise<Submission> => {
    const { data } = await apiClient.post(`/api/client/events/${eventId}/submissions/${id}/submit`);
    return data.data;
  },
};

// ── Props (реквизит) ─────────────────────────────────────────

export const submissionPropsApi = {
  list: async (eventId: string, submissionId: string): Promise<SubmissionProp[]> => {
    const { data } = await apiClient.get(
      `/api/client/events/${eventId}/submissions/${submissionId}/props`
    );
    return data;
  },

  create: async (eventId: string, submissionId: string, payload: {
    name: string;
    description?: string;
    quantity?: number;
  }): Promise<SubmissionProp> => {
    const { data } = await apiClient.post(
      `/api/client/events/${eventId}/submissions/${submissionId}/props`,
      payload
    );
    return data.data;
  },

  delete: async (eventId: string, submissionId: string, propId: string): Promise<void> => {
    await apiClient.delete(
      `/api/client/events/${eventId}/submissions/${submissionId}/props/${propId}`
    );
  },
};

// ── Phonograms ────────────────────────────────────────────────

export const submissionPhonogramsApi = {
  list: async (eventId: string, submissionId: string): Promise<Phonogram[]> => {
    const { data } = await apiClient.get(
      `/api/client/events/${eventId}/submissions/${submissionId}/phonograms`
    );
    return data.data;
  },

  // Загружает файл в media, затем создаёт и прикрепляет фонограмму
  upload: async (
    eventId: string,
    submissionId: string,
    file: File,
    meta: { title?: string; artist?: string; notes?: string }
  ): Promise<Phonogram> => {
    // Шаг 1: загрузить файл
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entity_type", "event_phonogram");
    formData.append("entity_id", eventId);

    const uploadRes = await apiClient.post<{ success: boolean; media: MediaFile }>(
      "/api/media",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const mediaId = uploadRes.data.media.id;

    // Шаг 2: создать фонограмму и прикрепить к заявке
    const { data } = await apiClient.post(
      `/api/client/events/${eventId}/submissions/${submissionId}/phonograms`,
      {
        media_id: mediaId,
        title: meta.title || file.name.replace(/\.[^.]+$/, ""),
        artist: meta.artist,
        notes: meta.notes,
      }
    );
    return data.data;
  },

  detach: async (eventId: string, submissionId: string, phonogramId: string): Promise<void> => {
    await apiClient.delete(
      `/api/client/events/${eventId}/submissions/${submissionId}/phonograms/${phonogramId}`
    );
  },
};
