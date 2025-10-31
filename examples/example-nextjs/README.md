# Next.js FHEVM SDK Example

This example demonstrates how to integrate `@fhevm/sdk` into a Next.js application using the App Router.

## Features

- ✅ Next.js 14+ App Router
- ✅ FHEVM SDK integration with React hooks
- ✅ TypeScript support
- ✅ Client-side FHE operations
- ✅ Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
cd packages/example-nextjs
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
example-nextjs/
├── app/
│   ├── layout.tsx       # Root layout with FHEVM Provider
│   ├── page.tsx         # Main page with encryption demo
│   ├── providers.tsx    # Client-side providers
│   └── globals.css      # Global styles
├── package.json
└── README.md
```

## Key Implementation Details

### 1. Provider Setup

The `FHEVMProvider` is set up in `app/providers.tsx` as a client component:

```tsx
'use client';

import { FHEVMProvider } from '@fhevm/sdk';

export function Providers({ children }) {
  return (
    <FHEVMProvider
      config={{ chainId: 11155111 }}
      autoInit={true}
    >
      {children}
    </FHEVMProvider>
  );
}
```

### 2. Layout Integration

The provider is wrapped in `app/layout.tsx`:

```tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 3. Using Hooks in Pages

Pages can use SDK hooks after marking as client components:

```tsx
'use client';

import { useFHEVM, useEncrypt } from '@fhevm/sdk';

export default function Page() {
  const { isInitialized } = useFHEVM();
  const { encrypt } = useEncrypt();

  // Your component logic
}
```

## Important Notes

### Client Components

All components using FHEVM hooks must be client components (`'use client'`).

### Server-Side Rendering

FHEVM initialization happens client-side. The SDK gracefully handles SSR by:
- Checking for browser environment
- Initializing only on client
- Providing loading states

### Performance

- FHEVM instance is initialized once and reused
- Encryption operations are optimized
- Loading states prevent UI blocking

## Advanced Usage

### Custom Error Handling

```tsx
import { useEncrypt, parseError } from '@fhevm/sdk';

function MyComponent() {
  const { encrypt, error } = useEncrypt();

  const handleEncrypt = async () => {
    try {
      await encrypt(100, 'uint32');
    } catch (err) {
      console.error(parseError(err));
    }
  };
}
```

### Debug Mode

```tsx
import { enableDebug } from '@fhevm/sdk/utils';

// In your app initialization
if (process.env.NODE_ENV === 'development') {
  enableDebug('debug');
}
```

## Deployment

### Vercel

This example is optimized for Vercel deployment:

```bash
npm run build
# Deploy to Vercel
```

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Cloudflare Pages
- Self-hosted

## Learn More

- [FHEVM SDK Documentation](../../fhevm-sdk/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Framework Integration Guide](../../fhevm-sdk/docs/FRAMEWORK_INTEGRATION.md)

## License

MIT
