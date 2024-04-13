import type { Metadata } from 'next';
import React from 'react';

import './globals.css';

import { AlibabaPuHuiTi } from '../fonts';

export const metadata: Metadata = {
  title: 'TinyCMS'
};

interface Prop {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: Prop) {
  return (
    <html lang="zh-CN" className={AlibabaPuHuiTi.className}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
