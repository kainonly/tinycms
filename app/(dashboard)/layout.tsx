import type { Metadata } from 'next';
import React from 'react';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App, ConfigProvider, Layout } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import './globals.css';

export const metadata: Metadata = {
  title: ''
};

interface Prop {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: Prop) {
  return (
    <html lang="zh">
      <body>
        <AntdRegistry>
          <ConfigProvider
            locale={zhCN}
            theme={{
              components: {
                Layout: { headerBg: '#fff', headerPadding: '0 16px' },
                Tree: { titleHeight: 48, borderRadius: 0 }
              }
            }}
          >
            <App style={{ height: '100%' }}>
              <Layout style={{ height: '100%' }}>{children}</Layout>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
