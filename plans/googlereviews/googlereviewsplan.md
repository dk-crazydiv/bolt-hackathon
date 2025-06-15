
# Google Map Reviews Explorer – **Nivo / Chart.js Plan (2025‑ready)**

> **TL;DR** – Re‑implement the charting layer with **Nivo** (primary) and optional **Chart.js 5.0** adapters.  
> All other architecture remains the same; only the visualization stack and component wrappers change.

---

## 1 Dataset Quick‑Look (unchanged)

```ts
interface ReviewFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [lon, lat] };
  properties: {
    date: string;                             // ISO 8601
    five_star_rating_published: number;       // 1–5
    google_maps_url: string;
    location?: { name: string; country_code?: string };
    review_text_published?: string;
    questions?: Array<{ question: string; /* dynamic shape */ }>;
    [k: string]: unknown;
  };
}
```

* Re‑use stream‑parser + Dexie cache from previous plan.  
* Data size (≤ 2 MB) still trivial for client memory; stream‑parse for future‑proofing.

---

## 2 10 Insight‑Driving Questions (same targets)

1. Rating trend over time  
2. Reviews per city/country  
3. Best vs worst locations on a heatmap  
4. Price ↔ rating correlation  
5. Meal type vs rating  
6. Sub‑ratings influence  
7. 1★ vs 5★ word clouds  
8. Most‑mentioned dishes  
9. Review length vs rating  
10. Travel group impact

---

## 3 Charting Stack (2025)

| Need | **Nivo** Variant | Alt (Chart.js 5 plug‑in) |
|------|------------------|--------------------------|
| Line / Area / Bar | `@nivo/line`, `@nivo/bar` | `chart.js/auto` |
| Scatter + density | `@nivo/scatterplot` | `chartjs-chart-matrix` |
| Violin / Box | `@nivo/violin` | `chartjs-chart-box-and-violin-plot` |
| Radar / Polar | `@nivo/radar` | built‑in polar area |
| Word clouds | `@nivo/wordcloud` | `chartjs-chart-wordcloud` |
| Geo (choropleth) | `@nivo/geo` | *use Mapbox GL, not Chart.js* |

### Why Nivo?  
* **Designer-grade defaults** – subtle gradients, shadows, and motion.  
* **SVG *and* Canvas** renderers → swap to Canvas for > 10 k points.  
* **Theme tokens** – hook Nivo theme to your Tailwind/Shadcn design‑system.  
* **Composable** – each chart is just a React component; SSR‑safe.

### Why keep Chart.js?  
Chart.js 5 (Jan 2025) introduces **web‑components mode** and **GPU‑accelerated Geo plots**. Including a slim adapter lets you cherry‑pick exotic chart types (e.g., **matrix heat‑map** for Q4) without bloating bundle size.

```ts
// src/lib/chartjs/index.ts
import { Chart } from 'chart.js/auto';
export const renderChart = (ctx: HTMLCanvasElement, cfg: Chart.ChartConfiguration) =>
  new Chart(ctx, cfg);
```

---

## 4 Component Library Changes

| Old Component | New (Nivo) | Props |
|---------------|------------|-------|
| `<LineChartEcharts>` | `<LineChartNivo>` | `{ data: Series[]; xScale?: object; yScale?: object }` |
| `<WordCloudEcharts>` | `<WordCloudNivo>` | `{ words: { text: string; value: number }[] }` |
| `<RadarEcharts>` | `<RadarNivo>` | same axis schema |
| **Generic `<InsightCard>` stays identical** – only internal renderer swaps.

```tsx
// Example InsightCard body
import { ResponsiveLine } from '@nivo/line';
export default function RatingTrend({ data }) {
  return (
    <ResponsiveLine
      data={data}
      margin={{ top: 20, right: 40, bottom: 50, left: 50 }}
      colors={{ scheme: 'purple_blue_green' }}
      theme={nivoTheme}    // mapped from Tailwind tokens
      enableArea
      areaOpacity={0.25}
      animate
    />
  );
}
```

**Theme bridging**  

```ts
import { useTheme } from 'next-themes';
export const nivoTheme = (mode: 'light' | 'dark') => ({
  fontFamily: 'Inter var, sans-serif',
  textColor: mode === 'dark' ? '#e2e8f0' : '#1e293b',
  tooltip: { container: { background: mode === 'dark' ? '#0f172a' : '#ffffff' } },
  grid: { line: { stroke: '#33415533' } },
});
```

---

## 5 Custom Components & Interactivity

| Component | Purpose | Nivo hook |
|-----------|---------|-----------|
| **`<GeoHeatmap>`** | Mapbox GL heat‑intensity layer | none (Mapbox native) |
| **`<NivoScatterMatrix>`** | 4‑quadrant scatter w/ density layer | compose `ResponsiveScatterPlot` & `violin` in group |
| **`<WordCloudCompare>`** | dual 1★ vs 5★ clouds with slider | use `motion.div` + two `ResponsiveWordCloud`s with clip‑mask |
| **`<ViolinBoxCombo>`** | renders violin & box on same axes | overlay two Nivo components w/ absolute positioning |

---

## 6 Performance Notes

* Import **only** the Nivo packages you need (each is tree‑shakable).  
  ```bash
  npm i @nivo/line @nivo/bar @nivo/scatterplot @nivo/wordcloud
  ```  
* Switch to Canvas renderer (`*Canvas` components) when `dataset.length > 5 k`.  
* Lazy‑load heavy charts with `React.lazy` + `<Suspense>`.

---

## 7 Implementation Milestones (delta)

| Phase | Extra Tasks vs previous plan |
|-------|-----------------------------|
| P1 | Install Nivo + Chart.js deps; configure Tailwind‑to‑Nivo theme bridge |
| P2 | Rewrite InsightCard renderers (Line, Bar, Radar, WordCloud) |
| P3 | Implement Canvas fallback logic |
| P4 | Integrate Chart.js Matrix plugin for Q4 price/rating heat‑map |
| P5 | Visual QA & animation tuning |

---

## 8 Bundle Size Estimate

| Stack | gzip | Notes |
|-------|------|-------|
| Nivo core libs (4–5 families) | ~90 kB | All SVG; Canvas adds +5 kB |
| Chart.js core + matrix/box plugins | ~70 kB | Loaded only on demand |
| Mapbox GL | 250 kB | Peer dep; already needed |

Total interactive payload ≈ **420 kB gzip** (well below 500 kB target).

---

## 9 Design‑System Touches

* **Typography** – Tailwind `text-balance`, `leading-tight`, `tracking-tight`.  
* **Card shadows** – `shadow-2xl/10` with `backdrop-blur-sm`.  
* **Gradients** – Nivo `colors={{ scheme: 'spectral' }}`, dark‑mode swap to `purple_green` palette.  
* **Motion** – Framer Motion layout spring for card reflows; Nivo built‑in transitions.

---

## 10 Testing the New Layer

* Unit snapshot each Nivo chart config (`toMatchSnapshot()`).  
* Playwright visual regression using `--screenshot` per InsightCard.  
* Chart.js instances: verify `.toBase64Image()` output for deterministic hashes.

---

### 🚀 Outcome

A **striking**, Tailwind‑styled dashboard where Nivo’s crisp SVG animations, Canvas fallbacks, and designer palettes make every insight pop — while Chart.js plugs gaps for exotic plots without sacrificing bytes or theme consistency.
