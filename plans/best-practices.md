# Best Practices for Data Visualization Components

A list of distilled best practices and observations from our development process.

### 1. Data Handling & Validation

-   **🛡️ Always validate incoming data.** Never assume the data structure passed to a component is perfect. Add checks for `null`, `undefined`, or incorrect data types before processing.
-   **🔍 Defensively access nested properties.** Before accessing a nested property like `item.properties.location`, always check if the parent objects (`item`, `item.properties`) exist.
-   **🧬 Handle multiple data structures.** Data can be nested unexpectedly (e.g., a `FeatureCollection` inside an array: `[ {features: [...]} ]`). Write data extraction logic that can handle multiple potential structures gracefully.
-   **🔧 Pre-process data for the chart.** Transform raw data into the exact, clean format the charting library expects. This includes grouping (e.g., by month, by country), averaging, or counting.

### 2. Component Design

-   **🧩 Keep components modular.** Isolate each chart's logic into its own component file. This makes them easier to manage, debug, and reuse.
-   **🎨 Create a shared theme.** For consistent styling across multiple charts (colors, fonts, etc.), define a shared theme object and import it where needed, rather than defining styles in each component.
-   **✅ Verify UI components exist.** Before importing a UI component (like a Checkbox or Label), verify it exists in your project's component library to avoid build errors. If it doesn't, use native HTML elements as a fallback.

### 3. Debugging

-   **🐛 Use descriptive console logs.** Add logs with emojis and clear descriptions at key stages of your data processing pipeline:
    -   `📊 [ComponentName] Received raw data:`
    -   `📊 [ComponentName] Extracted X features for processing.`
    -   `📊 [ComponentName] Processed data into Y aggregates.`
-   **🤔 Leave logs for complex components.** For components with complex data transformations, it's often wise to leave these concise logs in the codebase to simplify future debugging.
-   **❌ Log failures.** When filtering or validating data, log *why* a specific data item was rejected. This is invaluable for tracing issues with unexpected data formats.

### 4. TypeScript & Tooling

-   ** 경로(Path)에 주의하세요 (Be careful with paths).** When using path aliases (`@/components`), ensure your build tool (Vite, Webpack) and `tsconfig.json` are correctly configured. If you face persistent resolution issues, falling back to relative paths (`../../../`) is a reliable solution.
-   **✍️ Define clear types.** For complex data objects, define a TypeScript `interface` for better type safety and code completion, avoiding the overuse of `any`.
-   **🗂️ Use index signatures correctly.** When a chart library expects a data object with arbitrary keys (like Nivo's `BarDatum`), ensure your `interface` includes an index signature (e.g., `[key: string]: number | string;`).
