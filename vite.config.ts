import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), TanStackRouterVite()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },
    server: {
      port: 5173, // Port du serveur Vite
      cors: {
        origin: "http://localhost:3000", // Autorise les appels API
        credentials: true, // Autorise les cookies et l'authentification
      }
    },
    define: {
      'process.env': JSON.stringify(env), // Expose les variables d'environnement
    },
  };
});
