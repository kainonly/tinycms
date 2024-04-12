import React from 'react';

import { SmileOutlined } from '@ant-design/icons';
import { Result } from 'antd';

export function Home() {
  return (
    <Result style={{ marginTop: '20%', alignItems: 'center' }} icon={<SmileOutlined />} title="开始管理您的页面吧~" />
  );
}
