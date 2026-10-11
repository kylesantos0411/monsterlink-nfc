import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MonsterLink — NFC Creature Battle Prototype',
  description: 'Physical NFC card creature-collecting and tactical turn-based battle game.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-[#0b0e14] text-[#f0f4fc]">
        {children}
      </body>
    </html>
  );
}
