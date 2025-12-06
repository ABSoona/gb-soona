import { createFileRoute } from "@tanstack/react-router";

// Search validator
export const validateSearch = (search: Record<string, unknown>) => {
  return {
    from: search.from as string | undefined,
  };
};

// ⚠️ IMPORTANT : createFileRoute ICI, mais SANS component
// TanStack Router utilise cet objet pour le typage, update(), etc.
// mais le rendu viendra de index.lazy.tsx
export const Route = createFileRoute('/_authenticated/demandes/$id/')({});