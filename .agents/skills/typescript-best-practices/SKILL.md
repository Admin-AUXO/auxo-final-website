---
name: TypeScript Best Practices (2026)
description: Guidelines for high-performing, well-architected, and strictly typed TypeScript applications in 2026.
---

# TypeScript Best Practices & Architecture (2026)

This skill outlines the standard practices and architectural patterns for writing TypeScript in 2026. It focuses on taking full advantage of the type system, ensuring high quality, readability, and compiler performance optimizations.

## 1. Type Safety & Strict Architecture

- **Always Enable Strict Mode**: Ensure your `tsconfig.json` has `"strict": true`.
- **Zero `any` Policy**: Avoid using the `any` type altogether. Use `unknown` or create discriminated unions.
- **Architectural Constraints with Types**: Use TS to model domains at the type-level:
  - **Discriminated Unions**: Model state machines and eliminate impossible states at compile time (instead of relying on optional properties).
  - **Template Literal Types**: Use structured strings for enforcing analytics event names, structured configurations, or design tokens natively.

## 2. Advanced Typing Techniques

- **Type-Level Programming**: Rely heavily on Type Predicates (custom type guards) and Conditional Types. These allow for robust compile-time error catching with zero runtime overhead.
- **Utility Types**: Master `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, and `Record<K, V>`.
- **Enums vs. Const Assertions**: Prefer "Const Assertions" (`as const`) over enums for creating literal types, to prevent emitting unnecessary JavaScript payload.

## 3. Writing Easy-to-Compile & Fast-Building Code

With TS 7.0 improvements utilizing parallel checking and go-based engines, you should write code the compiler can easily parse to keep build times under a second:

- **Explicit Return Types**: While TS inference is strong, ALWAYS provide explicit return types for exported functions. This massively reduces the compiler's signature-gathering workload.
- **Interfaces over Intersections**: `interface A extends B` is inherently quicker to compile and resolve in IDEs than massive `type A = B & C & D` intersections.
- **Break up huge Unions**: Avoid union types that comprise 50+ members if you can break them down or group them, minimizing type-checking overhead.

## 4. `tsconfig.json` Optimization

- **Narrow `include`**: Ensure you explicitly define `include` to ignore `node_modules`, `dist`, and massive JSON dumps.
- **Incremental Builds**: Make sure `"incremental": true` is enabled to rebuild only changed files.
- **Project References**: For large monoliths or monorepos, use `"composite": true` with project references to separate boundaries and avoid a single monolithic compilation cycle.
- **Module Resolution**: Utilize `"moduleResolution": "bundler"` and `"verbatimModuleSyntax": true` to accurately reflect modern tree-shakable ES modules.

## 5. Code Architecture & Scalability

- **Feature-First Organization**: Group code by feature (e.g., `src/features/authentication/`) rather than technical role (`src/controllers/`, `src/services/`). This improves scaling and maintainability.
- **Immutability Focus**: Default to using `const` and embrace pure functions that don't produce side effects.
- **Robust Error Handling**: Create custom Error classes for different scenarios (e.g., `NetworkError`, `ValidationError`).
