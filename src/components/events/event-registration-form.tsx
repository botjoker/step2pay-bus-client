"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { publicEventsApi } from "@/lib/api/events";
import type { PublicEventRegistrationRequest } from "@/lib/types/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2 } from "lucide-react";

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
  });
  const [registered, setRegistered] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");

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
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
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

          {registerMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {registerMutation.error instanceof Error
                  ? registerMutation.error.message
                  : "Ошибка регистрации. Попробуйте еще раз."}
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
