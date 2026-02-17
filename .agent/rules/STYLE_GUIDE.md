# Code Style Guide: Sho El 8ada

This guide defines the improved coding conventions for the project.

## 1. TypeScript & Typing
- **Strict Typing:** All variables and function returns must be explicitly typed where inference is ambiguous.
- **Interfaces over Types:** Use `interface` for defining object shapes (like `Food`, `SessionBias`) to allow for better extension and readability.
- **No `any`:** Avoid `any` at all costs. Use `unknown` if the type is truly uncertain, and narrow it down.

## 2. Immutability
- **Prefer `const`:** logic should rely on immutability. Avoid `let` unless you strictly need a counter or accumulator.
- **"Val" Concept:** Treat data as values.
  - **Do:** `const activeFood = { ...food, selected: true };`
  - **Don't:** `food.selected = true;` (Mutation)

## 3. Naming Conventions
- **Components:** PascalCase (e.g., `ChatInput.tsx`, `FoodCard.tsx`).
- **Functions & Variables:** camelCase (e.g., `selectFood`, `sessionBias`).
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_BIAS_VALUE`).
- **Files:**
  - Components: PascalCase (`components/FoodCard.tsx`).
  - Utilities/Lib: camelCase (`lib/foodSelector.ts`).

## 4. Import Ordering
1. **React/Next.js:** `import { useState } from "react";`
2. **Third-Party Libraries:** `import { motion } from "framer-motion";`
3. **Internal - Components:** `import { FoodCard } from "@/components/FoodCard";`
4. **Internal - Libs/Utils:** `import { selectFood } from "@/lib/foodSelector";`
5. **Internal - Types:** `import { Food } from "@/types/food";`
6. **Styles:** `import "./styles.css";`

## 5. Comments & Documentation
- **JSDoc:** critical functions (like the selection engine) must have JSDoc comments explaining parameters and return values.
- **"Why", not "What":** granular comments should explain *why* a decision was made (e.g., "Clamping bias to prevent runaway loops"), not just what the code is doing.
