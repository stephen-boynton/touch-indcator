# Contributing

## Style Rules

### General

- Use TypeScript with strict mode
- Prefer explicit typing over `any`
- Use absolute imports when possible

### Types vs Interfaces

- **Prefer `type`** for object shapes, unions, and intersections
- Only use `interface` when extending or declaration merging is needed

### Component Architecture

- Abstract logic into custom hooks to keep components focused on rendering
- Extract complex style calculations into utility functions
- Keep components clean - they should primarily contain JSX and prop handling

### Naming

- Components: PascalCase (e.g., `TouchIndicator`)
- Hooks: camelCase with `use` prefix (e.g., `useTouchIndicator`)
- Types: PascalCase (e.g., `TouchMessage`, `ConnectionState`)
- Files: kebab-case for utilities, PascalCase for components/hooks

### Testing

- Test user-facing behavior, not implementation details
- Mock external dependencies (WebSocket, etc.)
