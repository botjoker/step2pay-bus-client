"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Plus, Send, Trash2, Pencil, Music, Package,
  ChevronDown, ChevronUp, Upload, X, Clock, Users, Lightbulb,
  Volume2, FileText, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  submissionsApi,
  submissionPropsApi,
  submissionPhonogramsApi,
  type Submission,
  type SubmissionProp,
  type Phonogram,
} from "@/lib/api/cabinet-events";
import { clientEventsApi } from "@/lib/api/events";
import { publicEventsApi } from "@/lib/api/events";

// ── Статусы ──────────────────────────────────────────────────

const STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft:          { label: "Черновик",         color: "bg-gray-100 text-gray-600",    icon: <FileText className="h-3 w-3" /> },
  submitted:      { label: "На рассмотрении",  color: "bg-blue-100 text-blue-700",    icon: <Send className="h-3 w-3" /> },
  under_review:   { label: "Рассматривается",  color: "bg-yellow-100 text-yellow-700",icon: <Clock className="h-3 w-3" /> },
  needs_revision: { label: "Нужна доработка",  color: "bg-orange-100 text-orange-700",icon: <AlertCircle className="h-3 w-3" /> },
  approved:       { label: "Одобрено",          color: "bg-green-100 text-green-700",  icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected:       { label: "Отклонено",         color: "bg-red-100 text-red-600",      icon: <X className="h-3 w-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, color: "bg-gray-100 text-gray-600", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>
      {s.icon}{s.label}
    </span>
  );
}

// ── Форма заявки ─────────────────────────────────────────────

interface SubmissionFormProps {
  eventId: string;
  initial?: Partial<Submission>;
  onSave: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

function SubmissionForm({ eventId, initial, onSave, onCancel, loading }: SubmissionFormProps) {
  const [form, setForm] = useState({
    title:            initial?.title ?? "",
    description:      initial?.description ?? "",
    performers_count: initial?.performers_count?.toString() ?? "",
    duration_minutes: initial?.duration_minutes?.toString() ?? "",
    lighting_notes:   initial?.lighting_notes ?? "",
    sound_notes:      initial?.sound_notes ?? "",
    stage_notes:      initial?.stage_notes ?? "",
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      performers_count: form.performers_count ? Number(form.performers_count) : undefined,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Название номера *</label>
        <Input value={form.title} onChange={set("title")} required placeholder="Например: Танцевальный коллектив «Весна»" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Описание / концепция</label>
        <Textarea value={form.description} onChange={set("description")} rows={3} placeholder="Кратко о номере..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> Участников на сцене
          </label>
          <Input type="number" min={1} value={form.performers_count} onChange={set("performers_count")} placeholder="3" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Длительность, мин
          </label>
          <Input type="number" min={1} value={form.duration_minutes} onChange={set("duration_minutes")} placeholder="10" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <Lightbulb className="h-3.5 w-3.5" /> Пожелания по свету
        </label>
        <Textarea value={form.lighting_notes} onChange={set("lighting_notes")} rows={2} placeholder="Тёплый свет, следящий прожектор..." />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <Volume2 className="h-3.5 w-3.5" /> Пожелания по звуку
        </label>
        <Textarea value={form.sound_notes} onChange={set("sound_notes")} rows={2} placeholder="Микрофон на стойке, громкость фонограммы..." />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Прочие пожелания к сцене</label>
        <Textarea value={form.stage_notes} onChange={set("stage_notes")} rows={2} placeholder="Нужен стул, особые требования к сцене..." />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Сохранение..." : initial?.id ? "Сохранить" : "Создать черновик"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Отмена</Button>
      </div>
    </form>
  );
}

// ── Пропсы (реквизит) ────────────────────────────────────────

function PropsSection({ eventId, submission }: { eventId: string; submission: Submission }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const editable = submission.status !== "approved" && submission.status !== "rejected";

  const addMutation = useMutation({
    mutationFn: () => submissionPropsApi.create(eventId, submission.id, { name, quantity: Number(qty) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submission-props", submission.id] });
      setName(""); setQty("1"); setAdding(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (propId: string) => submissionPropsApi.delete(eventId, submission.id, propId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["submission-props", submission.id] }),
  });

  const { data: props = [] } = useQuery<SubmissionProp[]>({
    queryKey: ["submission-props", submission.id],
    queryFn: () => submissionPropsApi.list(eventId, submission.id),
  });

  return (
    <div className="space-y-2">
      {props.length === 0 && !adding && (
        <p className="text-xs text-gray-400">Реквизит не указан</p>
      )}
      {props.map((p) => (
        <div key={p.id} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-1.5">
          <span>{p.name}{p.quantity && p.quantity > 1 ? <span className="text-gray-400 ml-1">×{p.quantity}</span> : null}</span>
          {editable && (
            <button onClick={() => deleteMutation.mutate(p.id)} className="text-gray-400 hover:text-red-500">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
      {editable && (
        adding ? (
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название реквизита" className="h-8 text-sm" />
            <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" min={1} className="h-8 w-16 text-sm" />
            <Button size="sm" className="h-8" onClick={() => name && addMutation.mutate()} disabled={!name || addMutation.isPending}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={() => setAdding(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            <Plus className="h-3 w-3" /> Добавить реквизит
          </button>
        )
      )}
    </div>
  );
}

// ── Фонограммы ───────────────────────────────────────────────

function PhonogramsSection({ eventId, submission }: { eventId: string; submission: Submission }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ title: "", artist: "", notes: "" });
  const [showMeta, setShowMeta] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const editable = submission.status !== "approved" && submission.status !== "rejected";

  const MAX_SIZE_MB = 50;
  const ALLOWED_TYPES = ["audio/mpeg", "audio/wav", "audio/flac", "audio/aac", "audio/ogg", "audio/mp4", "audio/x-m4a"];

  const { data: phonograms = [] } = useQuery<Phonogram[]>({
    queryKey: ["submission-phonograms", submission.id],
    queryFn: () => submissionPhonogramsApi.list(eventId, submission.id),
  });

  const detachMutation = useMutation({
    mutationFn: (phId: string) => submissionPhonogramsApi.detach(eventId, submission.id, phId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["submission-phonograms", submission.id] }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`Файл слишком большой. Максимум ${MAX_SIZE_MB} МБ.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav|flac|aac|ogg|m4a)$/i)) {
      setUploadError("Неподдерживаемый формат. Загружайте MP3, WAV, FLAC, AAC, OGG или M4A.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setPendingFile(file);
    setMeta((m) => ({ ...m, title: file.name.replace(/\.[^.]+$/, "") }));
    setShowMeta(true);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      await submissionPhonogramsApi.upload(eventId, submission.id, pendingFile, meta);
      qc.invalidateQueries({ queryKey: ["submission-phonograms", submission.id] });
      setPendingFile(null);
      setShowMeta(false);
      setMeta({ title: "", artist: "", notes: "" });
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      setUploadError(err?.response?.data?.message ?? "Ошибка загрузки. Попробуйте ещё раз.");
    } finally {
      setUploading(false);
    }
  };

  const formatDur = (s?: number) => {
    if (!s) return "";
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) =>
    bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} МБ` : `${(bytes / 1000).toFixed(0)} КБ`;

  return (
    <div className="space-y-3">
      {/* Предупреждение об ограничениях */}
      <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          Поддерживаются форматы <strong>MP3, WAV, FLAC, AAC, OGG, M4A</strong>.
          Максимальный размер файла — <strong>50 МБ</strong>.
          Файл будет воспроизведён звукорежиссёром во время выступления.
        </span>
      </div>

      {phonograms.length === 0 && (
        <p className="text-xs text-gray-400">Фонограммы не загружены</p>
      )}

      {phonograms.map((ph) => (
        <div key={ph.id} className="border rounded-lg overflow-hidden bg-gray-50">
          {/* Заголовок трека */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <Music className="h-4 w-4 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{ph.title}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {ph.artist && <span className="text-xs text-gray-500">{ph.artist}</span>}
                  {ph.duration_seconds && (
                    <span className="text-xs text-gray-400">{formatDur(ph.duration_seconds)}</span>
                  )}
                </div>
                {ph.notes && <p className="text-xs text-gray-500 italic mt-0.5">{ph.notes}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2 shrink-0">
              {ph.s3_url && (
                <button
                  onClick={() => setPlayingId(playingId === ph.id ? null : ph.id)}
                  className="p-1.5 rounded hover:bg-blue-100 text-blue-500"
                  title={playingId === ph.id ? "Остановить" : "Прослушать"}
                >
                  {playingId === ph.id ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                  )}
                </button>
              )}
              {editable && (
                <button onClick={() => detachMutation.mutate(ph.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Встроенный плеер */}
          {ph.s3_url && playingId === ph.id && (
            <div className="px-3 pb-3">
              <audio
                key={ph.s3_url}
                controls
                autoPlay
                className="w-full h-8"
                onEnded={() => setPlayingId(null)}
              >
                <source src={ph.s3_url} />
                Ваш браузер не поддерживает аудио.
              </audio>
            </div>
          )}
        </div>
      ))}

      {editable && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a"
            className="hidden"
            onChange={handleFileChange}
          />

          {uploadError && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1.5 mb-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {uploadError}
            </div>
          )}

          {!showMeta ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <Upload className="h-3 w-3" /> Загрузить фонограмму
            </button>
          ) : (
            <div className="border rounded-lg p-3 space-y-2 bg-blue-50">
              <p className="text-xs font-medium text-blue-700 flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5" />
                {pendingFile?.name}
                <span className="text-blue-400 font-normal">
                  {pendingFile && formatFileSize(pendingFile.size)}
                </span>
              </p>
              <Input
                value={meta.title}
                onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
                placeholder="Название трека"
                className="h-8 text-sm"
              />
              <Input
                value={meta.artist}
                onChange={(e) => setMeta((m) => ({ ...m, artist: e.target.value }))}
                placeholder="Исполнитель / композитор (необязательно)"
                className="h-8 text-sm"
              />
              <Input
                value={meta.notes}
                onChange={(e) => setMeta((m) => ({ ...m, notes: e.target.value }))}
                placeholder="Инструкции для звукорежиссёра (необязательно)"
                className="h-8 text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-8" onClick={handleUpload} disabled={uploading || !meta.title}>
                  {uploading ? "Загрузка..." : "Загрузить"}
                </Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={() => {
                  setShowMeta(false); setPendingFile(null); setUploadError(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}>
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Карточка заявки ──────────────────────────────────────────

function SubmissionCard({
  submission,
  eventId,
  onEdit,
  onDelete,
  onSubmit,
}: {
  submission: Submission;
  eventId: string;
  onEdit: () => void;
  onDelete: () => void;
  onSubmit: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const editable = submission.status !== "approved" && submission.status !== "rejected";
  const canSubmit = submission.status === "draft" || submission.status === "needs_revision";
  const canDelete = submission.status === "draft" || submission.status === "submitted" || submission.status === "needs_revision";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{submission.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <StatusBadge status={submission.status} />
              {submission.duration_minutes && (
                <span className="text-xs text-gray-500 flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />{submission.duration_minutes} мин
                </span>
              )}
              {submission.performers_count && (
                <span className="text-xs text-gray-500 flex items-center gap-0.5">
                  <Users className="h-3 w-3" />{submission.performers_count} чел.
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {editable && (
              <button onClick={onEdit} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {submission.reviewer_notes && (
          <div className="mt-2 text-sm bg-orange-50 border border-orange-200 rounded p-2 text-orange-800">
            <strong>Комментарий организатора:</strong> {submission.reviewer_notes}
          </div>
        )}

        {submission.description && (
          <p className="text-sm text-gray-600 mt-2">{submission.description}</p>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Технический райдер */}
        {(submission.lighting_notes || submission.sound_notes || submission.stage_notes) && (
          <div className="text-sm space-y-1.5 bg-gray-50 rounded p-3">
            {submission.lighting_notes && (
              <p><Lightbulb className="inline h-3.5 w-3.5 mr-1 text-yellow-500" /><span className="text-gray-500">Свет:</span> {submission.lighting_notes}</p>
            )}
            {submission.sound_notes && (
              <p><Volume2 className="inline h-3.5 w-3.5 mr-1 text-blue-500" /><span className="text-gray-500">Звук:</span> {submission.sound_notes}</p>
            )}
            {submission.stage_notes && (
              <p><FileText className="inline h-3.5 w-3.5 mr-1 text-gray-400" /><span className="text-gray-500">Сцена:</span> {submission.stage_notes}</p>
            )}
          </div>
        )}

        {/* Фонограммы и реквизит (раскрываются) */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-700"
        >
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Music className="h-3.5 w-3.5" /> Фонограммы</span>
            <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Реквизит</span>
          </span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expanded && (
          <div className="space-y-4 border-t pt-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Фонограммы</p>
              <PhonogramsSection eventId={eventId} submission={submission} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Реквизит</p>
              <PropsSection eventId={eventId} submission={submission} />
            </div>
          </div>
        )}

        {/* Кнопка "Отправить на рассмотрение" */}
        {canSubmit && (
          <Button
            size="sm"
            className="w-full"
            onClick={onSubmit}
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Отправить на рассмотрение
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Главная страница ─────────────────────────────────────────

export default function CabinetEventPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Получаем данные мероприятия
  const { data: eventData } = useQuery({
    queryKey: ["public-event", eventId],
    queryFn: () => publicEventsApi.getEventById(eventId),
  });
  const event = eventData?.data;

  // Список заявок
  const { data: submissions = [], isLoading } = useQuery<Submission[]>({
    queryKey: ["my-submissions", eventId],
    queryFn: () => submissionsApi.list(eventId),
  });

  const editingSubmission = submissions.find((s) => s.id === editingId);

  const createMutation = useMutation({
    mutationFn: (data: any) => submissionsApi.create(eventId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-submissions", eventId] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      submissionsApi.update(eventId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-submissions", eventId] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => submissionsApi.delete(eventId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-submissions", eventId] }),
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => submissionsApi.submit(eventId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-submissions", eventId] }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/cabinet/events")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {event?.title ?? "Мероприятие"}
          </h2>
          {event?.start_date && (
            <p className="text-sm text-gray-500">
              {new Date(event.start_date).toLocaleDateString("ru-RU", {
                day: "numeric", month: "long", year: "numeric",
              })}
              {event.address ? ` · ${event.address}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Мои заявки */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Мои выступления</h3>
          {!showForm && !editingId && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Добавить
            </Button>
          )}
        </div>

        {/* Форма создания */}
        {showForm && (
          <Card className="mb-4 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Новое выступление</CardTitle>
            </CardHeader>
            <CardContent>
              <SubmissionForm
                eventId={eventId}
                onSave={(data) => createMutation.mutate(data)}
                onCancel={() => setShowForm(false)}
                loading={createMutation.isPending}
              />
            </CardContent>
          </Card>
        )}

        {isLoading && <p className="text-sm text-gray-500">Загрузка...</p>}

        {!isLoading && submissions.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
            <Music className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="font-medium">Вы ещё не добавили выступления</p>
            <p className="text-sm mt-1">Опишите свой номер и отправьте его на рассмотрение</p>
            <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Добавить выступление
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {submissions.map((sub) =>
            editingId === sub.id ? (
              <Card key={sub.id} className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Редактировать выступление</CardTitle>
                </CardHeader>
                <CardContent>
                  <SubmissionForm
                    eventId={eventId}
                    initial={sub}
                    onSave={(data) => updateMutation.mutate({ id: sub.id, data })}
                    onCancel={() => setEditingId(null)}
                    loading={updateMutation.isPending}
                  />
                </CardContent>
              </Card>
            ) : (
              <SubmissionCard
                key={sub.id}
                submission={sub}
                eventId={eventId}
                onEdit={() => setEditingId(sub.id)}
                onDelete={() => {
                  if (confirm("Удалить черновик?")) deleteMutation.mutate(sub.id);
                }}
                onSubmit={() => submitMutation.mutate(sub.id)}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
