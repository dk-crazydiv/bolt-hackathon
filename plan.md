
# React Data‑Explorer – Implementation Plan

**Goal**: Build a **100 % open‑source, cost‑free** React web‑app that lets users drag‑and‑drop very large Google Takeout ZIPs or raw JSON files (≥ 100 MB) and then explore, debug‑view and graph the data.

---

## 1  Project Bootstrap

| Step | Command / Notes |
|------|-----------------|
| Init repo | `npm create vite@latest data-explorer -- --template react-ts` |
| Tooling  | **TypeScript**, **ESLint**, **Prettier**, **Vitest** + `happy-dom` for component tests |
| Git hooks | `husky` + `lint-staged` (all MIT‑licensed) |

---

## 2  Tech Stack (100 % FOSS)

| Concern | Library (license) | Why |
|---------|-------------------|-----|
| UI kit | **@mui/material** (MIT) – free core only | Rich, accessible components |
| Drag‑&‑drop | **react‑dropzone** (MIT) | Lightweight, battle‑tested |
| Routing | **react‑router‑dom** (MIT) | Tabs & deep links |
| State | **zustand** (MIT) | Tiny, SSR‑friendly store |
| Large‑file unzip | **fflate** (MIT) | Pure‑JS, stream‑friendly |
| Streaming JSON parse | **oboe** (MIT) or **jsonparse** (MIT) | Incremental parsing to avoid blocking the main thread |
| Background work | **Comlink** (MIT) + Web Workers | Isolate heavy parsing |
| IndexedDB cache | **dexie** (MIT) | Persist parsed chunks |
| Virtualized list | **react‑window** (MIT) | Smooth scrolling of huge arrays |
| Charts | **Recharts** (MIT) | Simple, composable |
| Debug JSON viewer | **react‑json‑view** (MIT) (wrapped in `react-window`) | Collapsible tree |

_No paid or dual‑license packages required._

---

## 3  Folder Layout

```
src/
 ├─ components/
 │   ├─ DropZone.tsx
 │   ├─ JsonDebugView/
 │   ├─ Charts/
 │   └─ layout/
 ├─ hooks/
 ├─ parsers/
 │   ├─ takeoutParser.worker.ts
 │   └─ jsonStreamParser.worker.ts
 ├─ store/          # zustand slices
 ├─ utils/
 ├─ App.tsx
 └─ main.tsx
public/
```

---

## 4  UI Skeleton

1. **AppBar** – title + theme toggle  
2. **TabBar** (MUI `Tabs`)  
   - **Upload** (default)  
   - **Debug JSON**  
   - **Charts** (dynamic tabs per question)  
3. **Upload Tab**  
   - `DropZone` → immediately starts streaming parse in a Web Worker  
   - Progress bar + cancel button  
4. **Debug JSON Tab**  
   - Virtualized `react-json-view` for quick inspection  
5. **Charts Tabs**  
   - Each question renders a reusable `<InsightCard>` with a Recharts graph + textual summary

---

## 5  Data‑Flow & Performance

```text
File → DropZone → Web Worker
      ├─ unzip (fflate streams)  [Takeout ZIP only]
      └─ stream‑JSON parse (oboe)
             ↓
        IndexedDB (Dexie)   ←→   UI Components
```

* Key optimizations  
  * **Stream everything** – never hold the full 100 MB in memory.  
  * **Back‑pressure** – pause worker if UI queue > N records.  
  * **Chunked writes** – batch Dexie `bulkPut`.  
  * **Memoized selectors** – `zustand` + `useMemo` in charts.  
  * **Code‑splitting** – lazy‑load Debug & Charts routes.

---

## 6  Implementation Milestones

| # | Deliverable |
|---|-------------|
| 0 | Repo + Vite + CI (GitHub Actions) |
| 1 | Upload & parsing worker (ZIP + raw JSON) |
| 2 | IndexedDB persistence layer |
| 3 | Debug JSON virtual viewer |
| 4 | Base chart components with one sample question |
| 5 | Question registry & dynamic chart tabs |
| 6 | Polishing & responsive design |
| 7 | Unit + E2E tests (Vitest + Playwright) |
| 8 | Deploy to GitHub Pages / Netlify |

---

## 7  NPM Scripts

```jsonc
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest",
  "lint": "eslint . --ext .ts,.tsx"
}
```

---

## 8  Deployment (Free)

* **GitHub Pages** – `vite build --base=/data-explorer/` + `actions/upload-pages-artifact`  
* **Netlify** – auto‑detect Vite build; set `--base=/` if root path.

---

## 9  Future Enhancements

* **Offline PWA** via Vite Plugin PWA.  
* **User‑defined questions** – YAML or JMESPath expressions stored in LocalStorage.  
* **CSV export** of filtered views (use `papaparse`, MIT).  

---

*Everything above uses MIT‑licensed or Apache‑2.0 libraries – no hidden fees.*  
