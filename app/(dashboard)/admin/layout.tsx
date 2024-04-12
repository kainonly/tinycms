'use client';

import React, { useMemo, useState } from 'react';

import { AppstoreOutlined, ControlOutlined, ExportOutlined, LogoutOutlined } from '@ant-design/icons';
import { Menu as M } from '@prisma/client';
import { App, Button, Col, Drawer, Layout, Menu, Popover, Row, Space, Switch, Table, Tag } from 'antd';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import useSWR from 'swr';

import { VContext, Config } from '@dashboard';

import { updateSider } from './[slug]/@nav/[id]/actions';
import { logout } from './actions';

const { Header } = Layout;

interface Prop {
  children: React.ReactNode;
}

export default function NextLayout({ children }: Prop) {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const { message } = App.useApp();

  const config = useSWR<Config, any, string>(`/api/config`, url => fetch(url).then(res => res.json()), {
    revalidateIfStale: false,
    revalidateOnFocus: false
  });
  const menus = useSWR<M[], any, string>(`/api/menus`, url => fetch(url).then(res => res.json()));
  const items = useMemo(() => {
    return !menus.data ? [] : menus.data.map(v => ({ key: v.slug, label: <b>{v.name}</b> }));
  }, [menus.data]);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Header style={{ borderBottom: '1px solid #f0f0f0' }}>
        <Row justify={'space-between'} align={'middle'}>
          <Col>
            <Popover
              content={
                <Space>
                  <Button type={'text'} icon={<ExportOutlined />} href={'/'} target={'_blank'}>
                    查看站点
                  </Button>
                  <Button
                    type={'text'}
                    icon={<ControlOutlined />}
                    onClick={() => {
                      setOpen(true);
                    }}
                  >
                    导航控制
                  </Button>
                </Space>
              }
            >
              <Button type={'text'} icon={<AppstoreOutlined />}></Button>
            </Popover>
          </Col>
          <Col>
            <Menu
              style={{ height: '100%', borderRight: 0 }}
              mode={'horizontal'}
              items={items}
              defaultSelectedKeys={[segment as string]}
              onSelect={({ key }) => {
                router.push(`/admin/${key}/_`);
              }}
            />
          </Col>
          <Col>
            <Button
              type={'text'}
              icon={<LogoutOutlined />}
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
            >
              退出
            </Button>
          </Col>
        </Row>
      </Header>
      <VContext.Provider value={{ config: config.data, menus }}>{children}</VContext.Provider>
      <Drawer
        title="导航控制"
        width={640}
        onClose={() => {
          setOpen(false);
        }}
        open={open}
      >
        <Table<M>
          rowKey={'id'}
          pagination={false}
          dataSource={menus.data}
          columns={[
            {
              title: '名称',
              key: 'name',
              render: (_, record) => {
                return (
                  <>
                    <Tag color={'blue'}>{record.slug}</Tag>
                    {record.name}
                  </>
                );
              }
            },
            {
              title: '侧栏导航',
              dataIndex: 'sider',
              width: 120,
              render: (value, record) => {
                return (
                  <>
                    <Switch
                      checkedChildren="开启"
                      unCheckedChildren="关闭"
                      defaultChecked
                      value={value}
                      onChange={async value => {
                        await updateSider(record.id, value);
                        menus.mutate();
                        message.success('更新成功');
                      }}
                    />
                  </>
                );
              }
            }
          ]}
        ></Table>
      </Drawer>
    </>
  );
}
