# Project Technical Standards: Sho El 8ada

These standards define the architectural and implementation rules for the project. **Strict adherence is required.**

## 1. Core Architecture
- **Framework:** Next.js 14 (App Router).
- **Styling:** Tailwind CSS (utility-first).
- **Language:** TypeScript (Strict Mode).
- **State Management:** React Context (for global state only) or URL State (for shareable filters).

## 2. Selection Logic (The "Brain")
- **Hybrid Intent Engine:**
  - MUST prioritize seamless transition between **Gemini AI** (primary) and **Local Regex Fallback** (secondary).
  - Logic must be robust: If Gemini fails/timeouts, Local Fallback matches keywords immediately.
- **Weighted Selection Math:**
  - Session Bias values MUST be clamped between **-15 and +15** to prevent runaway preference loops.
  - "Surprise Me" mode must bypass all filters/biases.
- **Deterministic Selection:**
  - Given the same seed/state, the selection logic should be predictable debugging.

## 3. UI/UX Standards
- **"Stich UI" Aesthetic:**
  - Visuals should be polished, modern, and high-quality.
  - No "Minimum Viable Product" look. Premium feel only.
- **Zero-Broken-Images:**
  - All image components MUST have a deterministic fallback (e.g., a placeholder pattern or generic food icon) if the main image fails to load.
- **Responsiveness:**
  - Mobile-first approach.
  - Touch targets must be at least 44x44px.

## 4. Component Architecture
- **Server vs. Client:**
  - Prefer **Server Components** by default for data fetching and layout.
  - Use **Client Components** (`"use client"`) only for interactivity (e.g., `ChatInput`, `FoodCard` interactions).
- **Data Fetching:**
  - Fetch data on the server where possible.
  - Pass data to client components via props.

## 5. Food Data Integrity
- **Immutability:** Food objects in `data/foods.ts` must be treated as immutable constants.
- **Typing:** All Food objects must strictly adhere to the `Food` interface. No `any` types allowed in food data processing.
