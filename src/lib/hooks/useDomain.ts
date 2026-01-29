import { useEffect, useState } from "react";

/**
 * Хук для получения domain (slug) тенанта
 * Поддерживает:
 * - Query параметр: localhost:3000?domain=xxx -> "xxx"
 * - Поддомен: aaa.sambacrm.online -> "aaa"
 */
export function useDomain() {
  const [domain, setDomain] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    
    // Проверяем query параметр ?domain=xxx (для localhost)
    const domainParam = urlParams.get("domain");
    if (domainParam) {
      setDomain(domainParam);
      return;
    }

    // Извлекаем поддомен из hostname (для продакшена)
    const hostname = window.location.hostname;
    
    // Для localhost - без домена
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      setDomain(null);
      return;
    }

    // Для продакшена - извлекаем поддомен
    // Например: aaa.sambacrm.online -> aaa
    const parts = hostname.split(".");
    if (parts.length > 2) {
      setDomain(parts[0]);
    }
  }, []);

  return domain;
}
