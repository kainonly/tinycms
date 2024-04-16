'use client';

import React, { useState } from 'react';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Empty, FloatButton, Form, Layout, theme } from 'antd';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

import { Detail, NavDto, PostContext, PostDto } from '@dashboard';

import { Control } from './control';
import { Nav } from './nav';

const { Sider, Content } = Layout;

interface Prop {
  children: React.ReactNode;
}

export default function NextLayout({ children }: Prop) {
  const params = useParams<{ slug: string; id?: string }>();
  const {
    token: { colorBgContainer }
  } = theme.useToken();
  const navs = useSWR<NavDto[], any, string>(`/api/posts?slug=${params.slug}`, url =>
    fetch(url).then(res => res.json())
  );
  const [collapsed, setCollapsed] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [form] = Form.useForm<PostDto>();
  return (
    <PostContext.Provider
      value={{
        navs,
        collapsed,
        setCollapsed,
        detail,
        setDetail,
        form
      }}
    >
      <Layout hasSider={true} style={{ overflow: 'hidden' }}>
        <Sider
          style={{
            borderRight: '1px solid #f0f0f0',
            background: colorBgContainer,
            padding: 16
          }}
          width={320}
        >
          <Nav {...params} />
        </Sider>
        <Content style={{ padding: '24px 24px 0 24px', overflowY: 'auto', overflowX: 'hidden' }}>{children}</Content>
        <Sider
          style={{
            borderLeft: collapsed ? 'none' : '1px solid #f0f0f0',
            background: colorBgContainer,
            padding: collapsed ? 0 : 16
          }}
          width={320}
          collapsible
          collapsed={collapsed}
          collapsedWidth={0}
          trigger={null}
          breakpoint={'xxl'}
          onBreakpoint={broken => {
            setCollapsed(broken);
          }}
        >
          {params.id ? <Control /> : <Empty style={{ marginTop: '2.5rem' }} />}
        </Sider>
      </Layout>
      <FloatButton
        shape={'square'}
        icon={collapsed ? <LeftOutlined /> : <RightOutlined />}
        onClick={() => {
          setCollapsed(!collapsed);
        }}
      />
    </PostContext.Provider>
  );
}
