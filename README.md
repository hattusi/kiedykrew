# KiedyKrew – MVP

Publiczny agregator punktów krwiodawstwa w Polsce.  
**Nie jest oficjalnym systemem RCKiK.** Dane są agregowane z publicznych źródeł.

## Stack

| | |
|--|--|
| Framework | Next.js 14 App Router |
| Język | TypeScript |
| Baza danych | PostgreSQL |
| ORM | Prisma |
| UI | Tailwind CSS |
| Walidacja | Zod |
| Scraping | Cheerio |
| Scheduler | node-cron / Vercel Cron |

---

## Quickstart

### 1. Zależności

```bash
npm install
```

### 2. Baza danych

Uruchom PostgreSQL lokalnie (np. przez Docker):

```bash
docker run -d --name kiedykrew-pg -e POSTGRES_DB=kiedykrew   -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password   -p 5432:5432 postgres:16
```

### 3. Zmienne środowiskowe

```bash
cp .env.example .env
# Edytuj .env – ustaw DATABASE_URL, ADMIN_PASSWORD, CRON_SECRET
```

### 4. Migracja i seed

```bash
npm run db:push      # utwórz tabele
npm run db:seed      # załaduj przykładowe dane (8 polskich RCKiK)
```

### 5. Uruchomienie

```bash
npm run dev          # http://localhost:3000
```

Panel admina: **http://localhost:3000/admin**  
Login: `admin` / hasło z `ADMIN_PASSWORD` w `.env`

---

## Architektura

```
src/
├── app/
│   ├── page.tsx                  # Strona główna – wyszukiwarka
│   ├── stations/
│   │   ├── page.tsx              # Katalog punktów
│   │   └── [id]/page.tsx        # Szczegóły stacji
│   ├── admin/                   # Panel admina (HTTP Basic Auth)
│   │   ├── page.tsx             # Dashboard ze statystykami
│   │   ├── stations/            # CRUD stacji
│   │   ├── adapters/            # Przegląd adapterów
│   │   └── logs/                # Logi uruchomień
│   └── api/
│       ├── stations/            # Publiczne API stacji
│       ├── search/              # Alias wyszukiwarki
│       ├── admin/               # API panelu admina
│       │   ├── stations/
│       │   ├── sources/
│       │   │   └── [id]/run/   # Ręczne uruchomienie adaptera
│       │   └── logs/
│       └── cron/               # Endpoint dla Vercel Cron / cURL
├── lib/
│   ├── prisma.ts               # Singleton klienta Prisma
│   ├── runner.ts               # Uruchamianie adapterów + zapis wyników
│   ├── scheduler.ts            # node-cron (dla serwera Node.js)
│   ├── scoring.ts              # Algorytm rekomendacji
│   ├── utils.ts                # Etykiety, kolory, helpers
│   └── adapters/
│       ├── base.ts             # Interfejs BaseAdapter
│       ├── mock.ts             # Generator losowych slotów
│       ├── static.ts           # Dane zakodowane w JSON
│       ├── manual.ts           # Sloty z bazy (dodane przez admina)
│       ├── html.ts             # Szkielet scrapera HTML (Cheerio)
│       ├── json-adapter.ts     # Szkielet klienta JSON API
│       ├── blood-demand.ts     # Szkielet adaptera zapotrzebowania
│       └── registry.ts         # Rejestr adapterów
├── components/
│   ├── search/                 # SearchBar, SearchFilters
│   ├── stations/               # StationCard, BloodDemandGrid, SlotsList
│   └── admin/                  # AdminNav, StationForm, SourcesManager
├── types/index.ts              # Typy TypeScript
└── middleware.ts               # HTTP Basic Auth dla /admin
```

---

## System adapterów

Każda stacja może mieć wiele **Source** (źródeł). Każde Source ma przypisany typ adaptera:

| Adapter | Działanie |
|---------|-----------|
| `MOCK` | Generuje losowe sloty na N dni do przodu. Tylko do testów. |
| `STATIC` | Zwraca dane zakodowane w polu `config` JSON. |
| `MANUAL` | Czyta sloty dodane ręcznie przez admina przez panel. |
| `HTML` | Szkielet: pobiera stronę WWW, parsuje przez Cheerio. Wymaga implementacji selektorów. |
| `JSON` | Szkielet: odpytuje JSON endpoint, mapuje odpowiedź. |
| `BLOOD_DEMAND` | Szkielet: parsuje tabelę zapotrzebowania na krew ze strony RCKiK. |

Adaptery uruchamia się przez:
- **Panel admina** – przycisk "▶ Uruchom" przy każdym Source
- **Cron** – `POST /api/cron` z nagłówkiem `Authorization: Bearer <CRON_SECRET>`
- **node-cron** – `import "@/lib/scheduler"` w custom serwerze

---

## Scoring rekomendacji

Stacje w wynikach wyszukiwania są sortowane przez algorytm scoringowy (`src/lib/scoring.ts`):

| Czynnik | Punkty |
|---------|--------|
| Obsługa rezerwacji online | +20 |
| Dostępne sloty w ciągu 3 dni | +15..+35 |
| CRITICAL zapotrzebowanie na szukaną grupę krwi | +30 |
| LOW zapotrzebowanie na szukaną grupę krwi | +20 |
| HIGH zapotrzebowanie | +10 |
| Odległość < 1 km (wymaga geolokalizacji) | +25 (degresywnie) |
| Stacja INACTIVE / TEST | -100 |

---

## Modele danych

```
Station        – punkt krwiodawstwa
  └── Source   – źródło danych / adapter
       └── Log – historia uruchomień adaptera
  └── Slot     – dostępny termin wizyty
  └── BloodDemand – zapotrzebowanie na grupę krwi
```

---

## Deploy

### Vercel

1. Podłącz repo do Vercel
2. Ustaw zmienne środowiskowe (`DATABASE_URL`, `ADMIN_PASSWORD`, `CRON_SECRET`)
3. Dodaj Vercel Cron w `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron", "schedule": "0 */6 * * *" }
  ]
}
```

### Własny serwer (Node.js)

Włącz scheduler w `src/app/layout.tsx`:

```ts
import { startScheduler } from "@/lib/scheduler";
if (process.env.NODE_ENV === "production") startScheduler();
```

---

## Co NIE jest w MVP

- Konta użytkowników / logowanie
- SMS / powiadomienia
- Automatyczna rezerwacja terminów
- Logowanie do systemów zewnętrznych
- CAPTCHA solving
- Kwalifikacja medyczna dawcy
- Dane zdrowotne użytkownika
- Oficjalna integracja z systemami RCKiK
