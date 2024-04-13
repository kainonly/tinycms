import type { Metadata } from 'next';
import React from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'TinyCMS'
};

interface Prop {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: Prop) {
  return (
    <html lang="zh-CN">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
