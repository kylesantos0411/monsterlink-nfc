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
      <body className="antialiased min-h-screen flex flex-col bg-[#0a0e17] text-[#f0f4fc]">
        {children}
      </body>
    </html>
  );
}
