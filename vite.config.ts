import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          // changeOrigin must be FALSE so Express sees Host: localhost:3000.
          // Auth.js constructs the OAuth redirect_uri from req.get('host').
          // With changeOrigin:true, host becomes "127.0.0.1:3001" → redirect_uri
          // uses 127.0.0.1, Google redirects there directly (bypassing Vite), and
          // the PKCE verifier cookie (which was set on the localhost domain) is
          // missing → InvalidCheck → error=Configuration.
          // With changeOrigin:false, host stays "localhost:3000" → redirect_uri uses
          // localhost:3000, Google redirects through Vite, the PKCE cookie is present,
          // and all post-auth error redirects also land on Vite (not Express 404).
          //
          // ⚠️  Google Cloud Console: Authorized redirect URI must be:
          //     http://localhost:3000/api/auth/callback/google
          changeOrigin: false,
        },
        '/docs': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // React core runtime
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) {
              return 'vendor-react';
            }
            // Motion / animation
            if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
              return 'vendor-motion';
            }
            // Three.js / WebGL canvas
            if (id.includes('node_modules/three')) {
              return 'vendor-three';
            }
            // Lucide icons
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-lucide';
            }
            // Everything else in node_modules
            if (id.includes('node_modules')) {
              return 'vendor-misc';
            }
          },
        },
      },
      // Raise the warning threshold to 600 kB so only genuinely oversized chunks warn
      chunkSizeWarningLimit: 600,
    },
  };
});
