// app/lib/rate-limit.ts
import { NextResponse } from "next/server";

// Map зберігає запити по IP
const requests = new Map<string, number[]>();

// Налаштування ліміту
const WINDOW_TIME = 60 * 1000; // 1 хвилина
const MAX_REQUESTS = 10;       // максимум 10 запитів на хвилину

export function rateLimit(req: Request) {
  // отримуємо IP користувача
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("host") || "unknown";

  const now = Date.now();
  const record = requests.get(ip) || [];

  // залишаємо тільки ті запити, що у межах часу WINDOW_TIME
  const newRecord = record.filter(timestamp => now - timestamp < WINDOW_TIME);

  if (newRecord.length >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  newRecord.push(now);
  requests.set(ip, newRecord);
  return null; // все ок, продовжуємо
}
