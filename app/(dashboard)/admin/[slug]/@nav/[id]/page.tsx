'use client';
/* eslint-disable react/no-children-prop */

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  AimOutlined,
  DeleteOutlined,
  DisconnectOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
  PushpinOutlined,
  PushpinTwoTone,
  QuestionCircleTwoTone,
  SearchOutlined,
  SubnodeOutlined
} from '@ant-design/icons';
import {
  App,
  AutoComplete,
  Button,
  Divider,
  Dropdown,
  Empty,
  Flex,
  Input,
  Space,
  Tooltip,
  Tree,
  TreeDataNode
} from 'antd';
import { useRouter } from 'next/navigation';

import { VContext, Nav, NavDto, PostContext } from '@dashboard';
import { NavForm } from '@dashboard/components';
import { useModalForm } from '@dashboard/hooks';

import { create, del, setRoute, sort, update } from './actions';

interface Node extends TreeDataNode {
  parent?: Node;
  data: Nav;
}

interface SearchOption {
  label: React.ReactNode;
  value: string;
}

interface Prop {
  params: { slug: string; id: string };
}

export default function Page({ params }: Prop) {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const form = useModalForm<NavDto>(f => <NavForm slug={params.slug} f={f} />);
  const { navs } = useContext(PostContext)!;
  const { data, mutate, error } = navs;

  let selectedKeys: React.Key[] = [];
  if (!(params.id === '_' || error)) {
    selectedKeys = [parseInt(params.id)];
  }
  const nodes = useMemo<Node[]>(() => {
    const values: Node[] = [];
    const dict: Record<string, Node> = {};
    if (!data) {
      return [];
    }
    for (const x of data) {
      dict[x.id] = { key: x.id, title: x.name, data: x, children: [] };
    }
    for (const x of data!) {
      const node = dict[x.id]!;
      if (x.parent === 0) {
        values.push(node);
      } else {
        const pid = x.parent;
        if (dict[pid]) {
          const parent = dict[pid]!;
          node.parent = parent;
          parent.children!.push(node);
        }
      }
    }
    return values;
  }, [data]);

  const [height, setHeight] = useState<number>(640);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight - 54);
    }
  }, []);

  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<SearchOption[]>([]);

  const { menus } = useContext(VContext)!;
  const def = useMemo(() => {
    return menus.data?.find(v => v.slug === params.slug)!.route ?? '';
  }, [menus.data, params.slug]);

  return (
    <div ref={ref} style={{ height: '100%' }}>
      <Space align={'center'}>
        <AutoComplete
          children={
            <Input
              allowClear
              placeholder="搜索关键词"
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
            />
          }
          options={options}
          value={search}
          style={{ width: 248 }}
          notFoundContent={<Empty description={'没有相关页面'} />}
          onSearch={async text => {
            setSearch(text);
            if (!text) {
              return;
            }
            const response = await fetch(`/api/posts?slug=${params.slug}&name=${text}`);
            const data = (await response.json()) as Nav[];
            setOptions(data.map<SearchOption>(v => ({ label: v.name, value: v.id.toString() })));
          }}
          onSelect={(value: string) => {
            router.push(`/admin/${params.slug}/${value}`);
          }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.open({
              title: '新增页面',
              width: 800,
              onSubmit: async data => {
                await create(data);
                message.success('页面新增成功');
                mutate();
              }
            });
          }}
        ></Button>
      </Space>
      <Divider style={{ marginTop: 20, marginBottom: 0 }} />
      <Tree<Node>
        height={height}
        defaultExpandAll={true}
        blockNode={true}
        showIcon={true}
        showLine={true}
        defaultSelectedKeys={selectedKeys}
        draggable={{ icon: false }}
        titleRender={v => (
          <Flex align={'center'} style={{ paddingLeft: '0.5rem' }}>
            <Dropdown
              trigger={['contextMenu']}
              menu={{
                items: [
                  {
                    key: `edit:${v.key}`,
                    label: '修改',
                    icon: <EditOutlined />,
                    onClick: () => {
                      form.open({
                        title: '修改页面',
                        width: 800,
                        input: v.data,
                        onSubmit: async data => {
                          await update(v.data.id, data);
                          message.success('页面修改成功');
                          mutate();
                        }
                      });
                    }
                  },
                  {
                    key: `subadd:${v.key}`,
                    label: '新增子页面',
                    icon: <SubnodeOutlined />,
                    onClick: () => {
                      form.open({
                        title: '新增页面',
                        width: 800,
                        input: { parent: v.data.id },
                        onSubmit: async data => {
                          const id = await create(data);
                          message.success('页面新增成功');
                          mutate();
                        }
                      });
                    }
                  },
                  {
                    key: `route:${v.key}`,
                    label: '设为导航页',
                    icon: <PushpinOutlined />,
                    onClick: () => {
                      modal.confirm({
                        title: '您确定将该页面设置为导航页吗?',
                        icon: <ExclamationCircleFilled />,
                        content: `${v.title}`,
                        okText: '是的',
                        cancelText: '再想想',
                        onOk: async () => {
                          await setRoute(params.slug, String(v.key));
                          message.success('更新成功');
                          menus.mutate();
                        }
                      });
                    }
                  },
                  {
                    type: 'divider'
                  },
                  String(v.key) === def
                    ? {
                        key: `cancel:${v.key}`,
                        label: '取消导航页',
                        danger: true,
                        icon: <AimOutlined />,
                        onClick: () => {
                          modal.confirm({
                            title: '您确定取消该导航页吗?',
                            icon: <DisconnectOutlined />,
                            content: `${v.title}`,
                            okText: '是的',
                            cancelText: '再想想',
                            onOk: async () => {
                              await setRoute(params.slug, '');
                              message.success('更新成功');
                              menus.mutate();
                            }
                          });
                        }
                      }
                    : null,
                  {
                    key: `delete:${v.key}`,
                    label: '删除',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => {
                      modal.confirm({
                        title: '您确定要删除该页面吗?',
                        icon: <ExclamationCircleFilled />,
                        content: `${v.title}`,
                        okText: '是的',
                        okType: 'danger',
                        cancelText: '再想想',
                        onOk: async () => {
                          await del(Number(v.key));
                          message.success('删除成功');
                          mutate();
                        }
                      });
                    }
                  }
                ]
              }}
            >
              <div
                style={{ width: '100%', height: 48, whiteSpace: 'wrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                <b>{v.title as string}</b>
                {String(v.data.id) === def && (
                  <Tooltip title="导航">
                    <PushpinTwoTone style={{ marginLeft: '0.25rem' }} />
                  </Tooltip>
                )}
                {v.data.render === 'catalog' && (
                  <Tooltip title="目录页面">
                    <QuestionCircleTwoTone style={{ marginLeft: '0.25rem' }} />
                  </Tooltip>
                )}
                {v.data.render === 'gallery' && (
                  <Tooltip title="画廊页面">
                    <QuestionCircleTwoTone style={{ marginLeft: '0.25rem' }} />
                  </Tooltip>
                )}
                {v.data.render === 'customize' && (
                  <Tooltip title="自定义">
                    <QuestionCircleTwoTone style={{ marginLeft: '0.25rem' }} />
                  </Tooltip>
                )}
              </div>
            </Dropdown>
          </Flex>
        )}
        treeData={nodes}
        onSelect={(keys, { node }) => {
          router.push(`/admin/${params.slug}` + (keys.length !== 0 ? `/${node.key}` : ''));
        }}
        onDrop={async ({ dragNode, node, dropPosition }) => {
          const dragKey = dragNode.key;
          const dragPos = dragNode.pos.split('-');
          const dragPosition = Number(dragPos[dragPos.length - 1]);
          const dropKey = node.key;
          const dropPos = node.pos.split('-');
          const position = dropPosition - Number(dropPos[dropPos.length - 1]);

          if (dragPos.length !== dropPos.length) {
            message.warning('请使用表单修改层级');
            return;
          }
          if (dragKey === dropKey) {
            return;
          }
          const scope: Node[] = dragNode.parent ? [...(dragNode.parent.children! as Node[])] : [...nodes];
          const [remove] = scope.splice(dragPosition, 1);
          const dropIndex = scope.findIndex(v => v.key === dropKey);
          const index = position === -1 ? dropIndex : dropIndex + 1;
          const lists = [...scope.slice(0, index), remove, ...scope.slice(index)];
          await sort(lists.map(v => v!.key as number));
          message.success('排序成功');
          navs.mutate();
        }}
      ></Tree>
    </div>
  );
}
