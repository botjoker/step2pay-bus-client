"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { publicEventsApi } from "@/lib/api/events";
import type { PublicEventRegistrationRequest, PublicNomination, RegistrationField } from "@/lib/types/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface EventRegistrationFormProps {
  eventId: string;
  eventSlug?: string;
  eventTitle: string;
}

export function EventRegistrationForm({ eventId, eventSlug, eventTitle }: EventRegistrationFormProps) {
  const [formData, setFormData] = useState<PublicEventRegistrationRequest>({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    custom_fields: {},
  });
  const [registered, setRegistered] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");

  // Nomination selection state
  const [selectedLevel1, setSelectedLevel1] = useState<string>("");
  const [selectedLevel2, setSelectedLevel2] = useState<string>("");
  const [selectedLevel3, setSelectedLevel3] = useState<string>("");

  // Получаем номинации
  const { data: nominationsData } = useQuery({
    queryKey: ["event-nominations", eventId],
    queryFn: () => publicEventsApi.getEventNominations(eventId),
  });

  // Получаем кастомные поля
  const { data: fieldsData } = useQuery({
    queryKey: ["event-registration-fields", eventId],
    queryFn: () => publicEventsApi.getEventRegistrationFields(eventId),
  });

  const nominations = Array.isArray(nominationsData) ? nominationsData : (nominationsData?.data || []);
  const customFields = fieldsData?.data || [];


  // Фильтруем номинации по уровням и parent_id
  const level1Nominations = nominations.filter((n) => n.level === 1);
  const level2Nominations = selectedLevel1
    ? nominations.filter((n) => n.level === 2 && n.parent_id === selectedLevel1)
    : [];
  const level3Nominations = selectedLevel2
    ? nominations.filter((n) => n.level === 3 && n.parent_id === selectedLevel2)
    : [];

  // Обновляем nomination_id при выборе
  useEffect(() => {
    let nominationId = "";

    // Определяем финальную выбранную номинацию
    if (selectedLevel3) {
      nominationId = selectedLevel3;
    } else if (selectedLevel2) {
      nominationId = selectedLevel2;
    } else if (selectedLevel1) {
      nominationId = selectedLevel1;
    }

    setFormData((prev) => ({ ...prev, nomination_id: nominationId || undefined }));
  }, [selectedLevel1, selectedLevel2, selectedLevel3]);

  // Сброс зависимых селектов
  useEffect(() => {
    setSelectedLevel2("");
    setSelectedLevel3("");
  }, [selectedLevel1]);

  useEffect(() => {
    setSelectedLevel3("");
  }, [selectedLevel2]);

  const registerMutation = useMutation({
    mutationFn: (data: PublicEventRegistrationRequest) => {
      if (eventSlug) {
        return publicEventsApi.registerForEventBySlug(eventSlug, data);
      }
      return publicEventsApi.registerForEvent(eventId, data);
    },
    onSuccess: (response) => {
      setRegistered(true);
      setQrCode(response.data.qr_code);
      // Сбросить форму
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        custom_fields: {},
      });
      setSelectedLevel1("");
      setSelectedLevel2("");
      setSelectedLevel3("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setFormData({
      ...formData,
      custom_fields: {
        ...formData.custom_fields,
        [fieldId]: value,
      },
    });
  };

  const renderCustomField = (field: RegistrationField) => {
    const value = formData.custom_fields?.[field.id] || "";

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && "*"}
            </Label>
            <Input
              id={field.id}
              value={value}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
              required={field.required}
              placeholder={field.placeholder}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && "*"}
            </Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
              required={field.required}
              placeholder={field.placeholder}
            />
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && "*"}
            </Label>
            <Input
              id={field.id}
              type="number"
              value={value}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
              required={field.required}
              placeholder={field.placeholder}
            />
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && "*"}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && "*"}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleCustomFieldChange(field.id, val)}
              required={field.required}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "Выберите..."} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value === true}
              onCheckedChange={(checked) => handleCustomFieldChange(field.id, checked)}
              required={field.required}
            />
            <Label htmlFor={field.id} className="cursor-pointer">
              {field.label} {field.required && "*"}
            </Label>
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label} {field.required && "*"}</Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${field.id}_${option}`}
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                    required={field.required}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={`${field.id}_${option}`} className="cursor-pointer font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case "multiselect":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label} {field.required && "*"}</Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}_${option}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, option]
                        : selectedValues.filter((v) => v !== option);
                      handleCustomFieldChange(field.id, newValues);
                    }}
                  />
                  <Label htmlFor={`${field.id}_${option}`} className="cursor-pointer font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (registered) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            Регистрация успешна!
          </CardTitle>
          <CardDescription>
            Вы успешно зарегистрированы на мероприятие &quot;{eventTitle}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <p className="font-medium mb-2">Ваш QR-код для регистрации:</p>
              <div className="bg-white p-4 rounded border inline-block">
                <p className="font-mono text-sm">{qrCode}</p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Сохраните этот код. Он понадобится для регистрации на мероприятии.
              </p>
            </AlertDescription>
          </Alert>

          <Button
            variant="outline"
            onClick={() => {
              setRegistered(false);
              setQrCode("");
            }}
          >
            Зарегистрировать еще одного участника
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Регистрация на мероприятие</CardTitle>
        <CardDescription>
          Заполните форму для регистрации на &quot;{eventTitle}&quot;
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Иван Иванов"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="ivan@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Компания</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="ООО &quot;Компания&quot;"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Должность</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Менеджер"
            />
          </div>

          {/* Номинации */}
          {nominations.length > 0 && (
            <div className="pt-4 space-y-4">
              <h3 className="font-medium text-xl">Номинация</h3>

              {/* Уровень 1 */}
              {level1Nominations.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="nomination-level-1">Категория *</Label>
                  <Select
                    value={selectedLevel1}
                    onValueChange={setSelectedLevel1}
                    required
                  >
                    <SelectTrigger id="nomination-level-1">
                      <SelectValue placeholder="Выберите категорию..." />
                    </SelectTrigger>
                    <SelectContent>
                      {level1Nominations.map((nom) => (
                        <SelectItem key={nom.id} value={nom.id}>
                          {nom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Уровень 2 */}
              {level2Nominations.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="nomination-level-2">Подкатегория *</Label>
                  <Select
                    value={selectedLevel2}
                    onValueChange={setSelectedLevel2}
                    required
                  >
                    <SelectTrigger id="nomination-level-2">
                      <SelectValue placeholder="Выберите подкатегорию..." />
                    </SelectTrigger>
                    <SelectContent>
                      {level2Nominations.map((nom) => (
                        <SelectItem key={nom.id} value={nom.id}>
                          {nom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Уровень 3 */}
              {level3Nominations.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="nomination-level-3">Номинация *</Label>
                  <Select
                    value={selectedLevel3}
                    onValueChange={setSelectedLevel3}
                    required
                  >
                    <SelectTrigger id="nomination-level-3">
                      <SelectValue placeholder="Выберите номинацию..." />
                    </SelectTrigger>
                    <SelectContent>
                      {level3Nominations.map((nom) => (
                        <SelectItem key={nom.id} value={nom.id}>
                          {nom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Кастомные поля */}
          {customFields.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-medium text-sm">Дополнительная информация</h3>
              {customFields.map((field) => renderCustomField(field))}
            </div>
          )}

          {registerMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ошибка регистрации</AlertTitle>
              <AlertDescription>
                {(() => {
                  const err = registerMutation.error as any;
                  return (
                    err?.response?.data?.error ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Попробуйте ещё раз."
                  );
                })()}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {registerMutation.isPending ? "Регистрация..." : "Зарегистрироваться"}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}
