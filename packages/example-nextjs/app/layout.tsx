import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'FHEVM SDK Next.js Example',
  description: 'Example demonstrating @fhevm/sdk usage in Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
