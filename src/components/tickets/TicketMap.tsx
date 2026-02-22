"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ticketsApi, PublicTicketItem, PublicSector, PublicRow, TicketMapResponse } from "@/lib/api/tickets";

// ============================================================
// СТАТУСЫ МЕСТ
// ============================================================

const STATUS_STYLE: Record<string, string> = {
  available: "cursor-pointer hover:opacity-80 active:scale-95 transition-transform",
  reserved:  "opacity-40 cursor-not-allowed",
  sold:      "opacity-25 cursor-not-allowed",
  used:      "opacity-20 cursor-not-allowed",
  cancelled: "opacity-20 cursor-not-allowed",
};

const STATUS_LABEL: Record<string, string> = {
  available: "Свободно",
  reserved:  "Занято",
  sold:      "Продано",
  used:      "Использован",
  cancelled: "Отменён",
};

// ============================================================
// КНОПКА МЕСТА
// ============================================================

function SeatButton({
  item,
  sectorColor,
  isSelected,
  onClick,
}: {
  item: PublicTicketItem;
  sectorColor: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isAvailable = item.status === "available";

  let bg = sectorColor;
  if (!isAvailable) bg = "#94a3b8";
  if (isSelected) bg = "#22c55e";

  return (
    <button
      title={`Место ${item.seat_label} · ${STATUS_LABEL[item.status]} · ${item.price} ₽`}
      disabled={!isAvailable}
      onClick={onClick}
      className={`w-6 h-6 rounded-sm text-[9px] text-white font-semibold flex items-center justify-center flex-shrink-0 ${STATUS_STYLE[item.status]}`}
      style={{ backgroundColor: bg }}
    >
      {item.seat_label}
    </button>
  );
}

// ============================================================
// СТРОКА РЯДЯ
// ============================================================

function RowLine({
  row,
  sector,
  items,
  selected,
  onToggle,
}: {
  row: PublicRow;
  sector: PublicSector;
  items: PublicTicketItem[];
  selected: Set<string>;
  onToggle: (item: PublicTicketItem) => void;
}) {
  const color = sector.color ?? "#6366f1";
  const rowItems = items.filter(i => i.row_id === row.id)
    .sort((a, b) => Number(a.seat_label) - Number(b.seat_label));

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-8 text-right text-xs text-gray-400 font-mono flex-shrink-0">{row.label}</span>
      <div className="flex flex-wrap gap-0.5">
        {rowItems.map(item => (
          <SeatButton
            key={item.id}
            item={item}
            sectorColor={color}
            isSelected={selected.has(item.id)}
            onClick={() => onToggle(item)}
          />
        ))}
      </div>
      <span className="w-8 text-xs text-gray-400 font-mono flex-shrink-0">{row.label}</span>
    </div>
  );
}

// ============================================================
// МОДАЛКА ОФОРМЛЕНИЯ
// ============================================================

function CheckoutModal({
  items,
  onClose,
  onSuccess,
}: {
  items: PublicTicketItem[];
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = items.reduce((sum, i) => sum + parseFloat(i.price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Укажите email"); return; }
    setLoading(true);
    setError("");
    try {
      const result = await ticketsApi.checkout({
        ticket_ids: items.map(i => i.id),
        payer_email: email,
        buyer_name: name || undefined,
      });
      onSuccess(result.order_id);
    } catch (err: any) {
      setError(err.message ?? "Ошибка оформления");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Оформление заказа</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>

          {/* Список выбранных мест */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1 max-h-40 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">Место {item.seat_label}</span>
                <span className="font-medium">{item.price} ₽</span>
              </div>
            ))}
            <div className="border-t pt-1 mt-1 flex justify-between font-bold">
              <span>Итого</span>
              <span>{total.toLocaleString("ru-RU")} ₽</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Иван Иванов"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Билеты и чек придут на этот email</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Создание заказа..." : `Перейти к оплате · ${total.toLocaleString("ru-RU")} ₽`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ГЛАВНЫЙ КОМПОНЕНТ
// ============================================================

export function TicketMap({ configId }: { configId: string }) {
  const router = useRouter();
  const [map, setMap] = useState<TicketMapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Map<string, PublicTicketItem>>(new Map());
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    ticketsApi.getMap(configId)
      .then(setMap)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [configId]);

  const toggleSeat = (item: PublicTicketItem) => {
    setSelected(prev => {
      const next = new Map(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.set(item.id, item);
      }
      return next;
    });
  };

  const selectedItems = Array.from(selected.values());
  const total = selectedItems.reduce((sum, i) => sum + parseFloat(i.price), 0);
  const selectedIds = new Set(selected.keys());

  const handleCheckoutSuccess = (orderId: string) => {
    router.push(`/payment/${orderId}`);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-gray-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3" />
      Загрузка схемы зала...
    </div>
  );

  if (error) return (
    <div className="text-center py-10 text-red-500">{error}</div>
  );

  if (!map || map.sectors.length === 0) return (
    <div className="text-center py-10 text-gray-500">Схема зала недоступна</div>
  );

  return (
    <div className="relative">
      {/* Сцена */}
      <div className="flex justify-center mb-6">
        <div className="px-16 py-2 rounded-lg bg-gray-100 text-xs text-gray-500 tracking-widest uppercase font-medium">
          сцена
        </div>
      </div>

      {/* Секторы */}
      <div className="space-y-6">
        {map.sectors.map(sector => {
          const color = sector.color ?? "#6366f1";
          const sectorItems = map.items.filter(i => i.sector_id === sector.id);
          const availableCount = sectorItems.filter(i => i.status === "available").length;
          const soldCount = sectorItems.filter(i => i.status === "sold").length;

          return (
            <div key={sector.id} className="rounded-xl border overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-2"
                style={{ backgroundColor: color + "20" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-sm">{sector.name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {availableCount > 0 ? (
                    <span className="text-green-600 font-medium">{availableCount} своб.</span>
                  ) : (
                    <span className="text-gray-400">нет мест</span>
                  )}
                  {soldCount > 0 && <span className="ml-2 text-gray-400">{soldCount} продано</span>}
                </div>
              </div>

              <div className="p-4 space-y-1 overflow-x-auto">
                {sector.rows.map(row => (
                  <RowLine
                    key={row.id}
                    row={row}
                    sector={sector}
                    items={sectorItems}
                    selected={selectedIds}
                    onToggle={toggleSeat}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Легенда */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-indigo-500" />
          Свободно
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-green-500" />
          Выбрано
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-slate-300" />
          Занято
        </div>
      </div>

      {/* Плавающая корзина */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-gray-900">
                {selectedItems.length} {selectedItems.length === 1 ? "место" : selectedItems.length < 5 ? "места" : "мест"}
              </div>
              <div className="text-sm text-gray-500">
                {selectedItems.map(i => `${i.seat_label}`).join(", ")}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="font-bold text-lg">{total.toLocaleString("ru-RU")} ₽</span>
              <button
                onClick={() => setShowCheckout(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
              >
                Купить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка оформления */}
      {showCheckout && (
        <CheckoutModal
          items={selectedItems}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
}
