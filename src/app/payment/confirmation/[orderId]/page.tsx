"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { config } from "@/local_config";

interface TicketData {
  id: string;
  seat_label?: string;
  status: string;
  qr_code?: string;
  price: string;
  buyer_name?: string;
  buyer_email?: string;
  sector_name?: string;
  sector_color?: string;
  row_label?: string;
}

interface OrderData {
  order_id: string;
  status: string;
  amount: string;
  description: string;
  tickets: TicketData[];
}

function QRImage({ value }: { value: string }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(value, { width: 200, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [value]);

  if (!dataUrl) return (
    <div className="w-[200px] h-[200px] mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
    </div>
  );

  return (
    <img
      src={dataUrl}
      alt={`QR: ${value}`}
      width={200}
      height={200}
      className="mx-auto rounded-lg"
    />
  );
}

function TicketCard({ ticket }: { ticket: TicketData }) {
  const color = ticket.sector_color ?? "#6366f1";

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      {/* Цветная шапка */}
      <div className="px-5 py-3" style={{ backgroundColor: color + "20" }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="font-semibold text-sm">{ticket.sector_name}</span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {ticket.row_label && `Ряд ${ticket.row_label}`}
          {ticket.seat_label && ` · Место ${ticket.seat_label}`}
        </div>
      </div>

      {/* QR код */}
      <div className="px-5 py-4">
        {ticket.qr_code ? (
          <QRImage value={ticket.qr_code} />
        ) : (
          <div className="w-[200px] h-[200px] mx-auto bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            QR ещё не готов
          </div>
        )}
        <div className="text-center mt-3">
          <div className="text-xs font-mono text-gray-400 break-all">{ticket.qr_code}</div>
        </div>
      </div>

      {/* Цена и статус */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <span className="font-bold text-lg">{parseFloat(ticket.price).toLocaleString("ru-RU")} ₽</span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          ticket.status === "sold" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        }`}>
          {ticket.status === "sold" ? "Оплачен" : ticket.status}
        </span>
      </div>

      {ticket.buyer_name && (
        <div className="px-5 pb-4 text-sm text-gray-500 border-t pt-3">
          {ticket.buyer_name}
          {ticket.buyer_email && <span className="block text-xs">{ticket.buyer_email}</span>}
        </div>
      )}
    </div>
  );
}

export default function PaymentConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`${config.api}/public/tickets/order/${orderId}`);
      if (!res.ok) throw new Error("Заказ не найден");
      const data: OrderData = await res.json();
      setOrder(data);
      return data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    fetchOrder().then(data => {
      // Если заказ ещё не оплачен — поллим каждые 3 секунды (до 60 сек)
      if (data && data.status !== "completed") {
        setPolling(true);
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          const updated = await fetchOrder();
          if (updated?.status === "completed" || attempts >= 20) {
            clearInterval(interval);
            setPolling(false);
          }
        }, 3000);
        return () => clearInterval(interval);
      }
    });
  }, [orderId, fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Загрузка билетов...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-700">Заказ не найден</h2>
          <p className="text-gray-500 mt-1">Проверьте ссылку или обратитесь в поддержку</p>
        </div>
      </div>
    );
  }

  const isPaid = order.status === "completed";
  const soldTickets = order.tickets.filter(t => t.status === "sold");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Статус */}
        <div className={`rounded-2xl p-6 mb-8 text-center shadow-sm ${
          isPaid ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"
        }`}>
          <div className="text-4xl mb-3">{isPaid ? "✅" : "⏳"}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isPaid ? "Оплата прошла!" : "Ожидаем подтверждение..."}
          </h1>
          <p className="text-gray-600 text-sm">{order.description}</p>
          <div className="mt-3 text-3xl font-bold text-gray-900">
            {parseFloat(order.amount).toLocaleString("ru-RU")} ₽
          </div>
          {polling && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-yellow-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500" />
              Проверяем статус оплаты...
            </div>
          )}
        </div>

        {/* Билеты */}
        {soldTickets.length > 0 ? (
          <>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Ваши билеты ({soldTickets.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {soldTickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-6">
              Покажите QR-код на входе. Билеты также отправлены на email.
            </p>
          </>
        ) : (
          !polling && (
            <div className="text-center text-gray-500 py-8">
              {isPaid
                ? "Билеты формируются, обновите страницу через несколько секунд"
                : "Билеты появятся здесь после оплаты"}
            </div>
          )
        )}

      </div>
    </div>
  );
}
