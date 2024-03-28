'use client';

import {
  AntDesignOutlined,
  AppstoreOutlined,
  DesktopOutlined,
  HomeOutlined,
  LogoutOutlined,
  ProjectOutlined,
  SettingOutlined,
  ShoppingOutlined,
  SolutionOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Breadcrumb, Button, Col, Divider, Dropdown, Layout, Menu, Row, Space, theme } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { MenuItemType } from 'antd/lib/menu/hooks/useItems';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

import { logout } from '@/app/dashboard/actions';

const { Header, Sider, Content } = Layout;
const menus: ItemType[] = [
  { key: 'index', label: '工作台', icon: <DesktopOutlined /> },
  { type: 'divider' },
  { key: 'users', label: '管理员', icon: <TeamOutlined /> },
  { key: 'settings', label: '设置', icon: <SettingOutlined /> }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const activeMenu = menus.find(v => v!.key === segment) as MenuItemType;
  const {
    token: { colorBgContainer }
  } = theme.useToken();

  return (
    <>
      <Header style={{ borderBottom: '1px solid #f0f0f0' }}>
        <Row justify={'space-between'} align={'middle'}>
          <Col>
            <Space align={'center'}>
              <Button type={'text'} icon={<AppstoreOutlined />}></Button>
              <Divider type="vertical" />
              <Breadcrumb
                style={{ padding: '12px 0' }}
                items={[
                  {
                    title: <HomeOutlined />,
                    href: ''
                  },
                  ...[{ title: activeMenu.label, href: `/dashboard/${activeMenu.key}` }]
                ]}
              />
            </Space>
          </Col>
          <Col></Col>
          <Col>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'exit',
                    label: 'Exit',
                    icon: <LogoutOutlined />,
                    onClick: async () => {
                      await logout();
                      router.push('/login');
                    }
                  }
                ]
              }}
            >
              <a style={{ display: 'block', padding: '0 12px' }}>
                <Badge count={5}>
                  <Avatar shape={'square'} size={32} icon={<AntDesignOutlined />} />
                </Badge>
              </a>
            </Dropdown>
          </Col>
        </Row>
      </Header>
      <Layout>
        <Sider style={{ background: colorBgContainer, padding: 8 }} width={256}>
          <Menu
            mode={'inline'}
            style={{ height: '100%', borderRight: 0 }}
            items={menus}
            defaultSelectedKeys={[segment as string]}
            onSelect={({ key }) => {
              router.push(`/dashboard/${key}`);
            }}
          />
        </Sider>
        <Layout>
          <Content style={{ padding: 24, overflowX: 'hidden' }}>{children}</Content>
        </Layout>
      </Layout>
    </>
  );
}
