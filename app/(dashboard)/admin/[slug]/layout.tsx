'use client';

import React, { useState } from 'react';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { FloatButton, Form, Layout, theme } from 'antd';
import useSWR from 'swr';

import { Detail, Nav, PostContext, PostDto } from '@dashboard';

const { Sider, Content } = Layout;

interface Prop {
  children: React.ReactNode;
  nav: React.ReactNode;
  control: React.ReactNode;
  params: { slug: string };
}

export default function NextLayout({ children, nav, control, params }: Prop) {
  const {
    token: { colorBgContainer }
  } = theme.useToken();
  const navs = useSWR<Nav[], any, string>(`/api/posts?slug=${params.slug}`, url => fetch(url).then(res => res.json()));
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
          {nav}
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
          {control}
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
