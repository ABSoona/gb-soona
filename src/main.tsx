import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { AxiosError } from 'axios';
import { ApolloProvider } from '@apollo/client';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { handleServerError } from '@/utils/handle-server-error';
import { toast } from '@/hooks/use-toast';
import { FontProvider } from './context/font-context';
import { ThemeProvider } from './context/theme-context';
import { client } from '@/lib/apollo-client'; // ✅ Import correct du client Apollo
import './index.css';
import { routeTree } from './routeTree.gen';

// Configuration de QueryClient avec gestion des erreurs
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        console.log({ failureCount, error });

        // Ne pas réessayer pour certaines erreurs spécifiques
        if (
          (error instanceof AxiosError && [401, 403].includes(error.response?.status ?? 0))
        ) {
          return false;
        }

        return failureCount < 3;
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // Cache pendant 10 secondes
    },
    mutations: {
      onError: (error) => {
        handleServerError(error);
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      handleServerError(error);
    },
  }),
});

// Créer le routeur avec le contexte QueryClient
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

// Type Safety pour le routeur
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ✅ Ajout de `ApolloProvider`
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ApolloProvider client={client}> {/* ✅ Apollo Client est maintenant disponible */}
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <FontProvider>
              <RouterProvider router={router} />
            </FontProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ApolloProvider>
    </StrictMode>
  );
}
