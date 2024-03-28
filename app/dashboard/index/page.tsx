import { Card, Flex } from 'antd';
import React from 'react';

export default function Page() {
  return (
    <Flex gap={12} vertical>
      <Card style={{ minHeight: 300 }}></Card>
    </Flex>
  );
}
