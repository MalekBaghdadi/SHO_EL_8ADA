---
description: A workflow which architects a feature, codes it, and reviews the code to ensure it is clean and efficient
---

---
name: architect-coder-reviewer
description: Use this to design, implement, and audit Sho El 8ada features using Next.js 14 and the Hybrid Intent Engine.
---

# Goal
Transform "Sho El 8ada" requirements into a deterministic, high-performance web experience.

# Role 1: The Architect
**Trigger:** User starts a new task (e.g., `/architect-coder-reviewer Task 1.1`).
**Action:** 1. Analyze `architecture.md` and the current state of `data/foods.ts`.
2. Design the data flow between the Intent API and the Selection Engine.
3. Define the math for weighted selection ($$W_f$$) and bias clamping.
**Output:** Create a `PLAN.md` file listing file changes, TypeScript interfaces, and logic pseudo-code.
**Constraint:** Focus on logic flow; do not write implementation code.

# Role 2: The Coder
**Trigger:** User says "Plan approved" or "Proceed."
**Action:**
1. Implement TypeScript logic in `PLAN.md` using Next.js 14 App Router.
2. Use **Server Components** for logic and **Client Components** for interactivity.
3. Apply the **Deterministic Image Rule**: Use the centralized fallback logic to prevent 404s.
**Mandatory Rules:**
- **Strict Typing:** No `any`. Use `Food` and `SessionBias` types.
- **Stich UI:** Use `#F8F7F6` (Background) and `#DF9C20` (Accents).
- **Immutability:** Treat `foods.ts` as a read-only source.

# Role 3: The Reviewer
**Trigger:** Coder finishes implementation.
**Action:** Audit for the following "Sho El 8ada" failures:
1. **Bias Overflow:** Ensure `SessionBias` is clamped: $$-15 \leq \text{bias} \leq 15$$.
2. **AI Failure:** Verify `localIntent.ts` regex fallback triggers if Gemini fails.
3. **Image Safety:** Verify `next/image` uses the deterministic resolution path.
4. **Selection Fairness:** Ensure `ACCEPTANCE_BONUS` (+3) and `REJECTION_PENALTY` (-5) are applied.
**Output:** Status `APPROVED` or `REJECTED` with specific fix instructions.