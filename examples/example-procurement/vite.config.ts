import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Base URL for GitHub Pages
  base: '/BuildingMaterialProcurement/',

  // Build optimization
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      },
      format: {
        comments: false
      }
    },

    // Code splitting configuration
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'vendor-web3': ['ethers', 'wagmi', 'viem'],
          'vendor-ui': ['@radix-ui/themes', '@rainbow-me/rainbowkit'],
          'vendor-fhe': ['fhevmjs'],

          // Utility chunks
          'utils': [
            './src/utils/format.ts',
            './src/utils/storage.ts'
          ]
        },
        // Asset naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 500, // 500 KB

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Report compressed size
    reportCompressedSize: true
  },

  // Development server
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: false,
    cors: true,
    // Security headers
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
  },

  // Preview server (for production build preview)
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: false,
    cors: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'ethers',
      'wagmi',
      'viem',
      'fhevmjs'
    ],
    exclude: [
      '@nomicfoundation/hardhat-toolbox'
    ],
    esbuildOptions: {
      target: 'es2020',
      supported: {
        bigint: true
      }
    }
  },

  // Module resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@contracts': resolve(__dirname, './contracts'),
      '@config': resolve(__dirname, './src/config'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types')
    },
    extensions: ['.ts', '.js', '.json']
  },

  // Environment variables
  envPrefix: 'VITE_',

  // CSS options
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },

  // Performance optimizations
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'es2020',
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },

  // Asset handling
  assetsInclude: ['**/*.wasm'],

  // Plugin array
  plugins: [react()],

  // Worker options
  worker: {
    format: 'es',
    plugins: []
  }
});
