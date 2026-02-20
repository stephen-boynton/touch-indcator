# Agent Guidelines for touch-indicator

This is a React library for receiving and displaying touch indicator data via WebSockets. The touch indicator mimics Apple's Magic Trackpad behavior on screen.

## Project Overview

- **Type**: React TypeScript library
- **Runtime**: Bun
- **Package Manager**: Bun
- **Testing**: Bun's built-in test runner
- **Linting**: ESLint 9 (flat config)
- **Formatting**: Prettier

> **Note:** If working on touch tracking logic, see [docs/TRACKING.md](./docs/TRACKING.md) for the tracking philosophy and implementation details.

## Commands

```bash
# Install dependencies
bun install

# Run all tests
bun test

# Run single test file
bun test src/hooks/useTouchIndicator.test.ts

# Run tests in watch mode
bun test --watch

# Lint source files
bun run lint

# Fix linting issues automatically
bun run lint:fix

# Format code
bun run format

# Check formatting without writing
bun run format:check

# Type check
bun run typecheck

# Build library
bun run build
```

## Project Structure

```
src/
├── components/       # React components (PascalCase)
│   └── TouchIndicator.tsx
├── hooks/           # Custom React hooks (camelCase, use prefix)
│   └── useTouchIndicator.ts
├── types/           # TypeScript interfaces and types
│   └── index.ts
├── lib/             # Utility functions (camelCase)
│   └── index.ts
└── index.ts         # Main exports
```

## Code Style

### General

- Use TypeScript with strict mode enabled
- Prefer explicit typing over `any` (warns in ESLint)
- Use absolute imports when possible (configured in tsconfig)
- Keep functions small and focused

### Naming Conventions

- **Components**: PascalCase (e.g., `TouchIndicator`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTouchIndicator`)
- **Types/Interfaces**: PascalCase (e.g., `TouchData`, `ConnectionState`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_WS_URL`)
- **Files**: kebab-case for non-component files, PascalCase for components/hooks

### Imports

- Use named exports/imports where possible
- Group imports in this order:
  1. External libraries (React, etc.)
  2. Internal modules (components, hooks, types)
  3. Type imports (use `import type`)
- Example:

```typescript
import { useState, useCallback, useEffect } from 'react';
import type { FC } from 'react';

import { useTouchIndicator } from './hooks/useTouchIndicator';
import type { TouchMessage, ConnectionState } from './types';
import { applySensitivity, clampPosition } from './lib';
```

### Formatting (Prettier)

- 2-space indentation
- Single quotes for strings
- Semicolons required
- Trailing commas (ES5 style)
- Print width: 100 characters
- Arrow functions: omit parentheses for single parameters when clear

### TypeScript Guidelines

- Enable strict mode for all new code
- Use interfaces for object shapes, types for unions/intersections
- Avoid `any` - use `unknown` when type is truly unknown
- Use `readonly` for immutable arrays/objects
- Export types alongside implementations when they're part of the public API

### React Patterns

- Use functional components with hooks
- Prefer composition over inheritance
- Memoize expensive computations with `useMemo`/`useCallback`
- Define prop types with interfaces
- Use `React.FC` or explicit return types for components

### Error Handling

- Use custom error classes for library-specific errors
- Throw descriptive errors with context
- Handle WebSocket errors with proper state management
- Example:

```typescript
export class TouchIndicatorError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'TouchIndicatorError';
  }
}
```

### WebSocket Handling

- Always handle connection states: `connecting`, `connected`, `disconnected`, `error`
- Implement reconnection logic with exponential backoff
- Clean up WebSocket connections in `useEffect` cleanup
- Never expose raw WebSocket to consumers - use the hook API

### Testing Guidelines

- Test files: `*.test.ts` or `*.test.tsx` in same directory as source
- Use Bun's test API: `describe`, `test`, `expect`
- Test user-facing behavior, not implementation details
- Mock WebSocket connections in tests
- Example:

```typescript
import { describe, test, expect, beforeEach } from 'bun:test';

describe('useTouchIndicator', () => {
  test('connects to WebSocket on mount', () => {
    // Test implementation
  });
});
```

## Common Tasks

### Adding a new hook

1. Create `src/hooks/useNewHook.ts`
2. Export from `src/index.ts`
3. Add tests in `src/hooks/useNewHook.test.ts`

### Adding a new component

1. Create `src/components/NewComponent.tsx`
2. Export from `src/index.ts`
3. Add tests in `src/components/NewComponent.test.tsx`

### Adding a new type

1. Add to `src/types/index.ts`
2. Export for public API if needed

## Pre-commit Checks

Before committing, run:

```bash
bun run typecheck && bun run lint && bun run format:check && bun test
```
