import React, { useMemo } from 'react';

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Post } from '@prisma/client';
import { Col, Form, Input, Row, Select, Switch, TreeSelect } from 'antd';
import { FormInstance } from 'antd/es/form/hooks/useForm';
import useSWR from 'swr';

import { NavFormDto } from '@dashboard';

interface Node {
  value: number;
  title: string;
  children: Node[];
}

interface Props<T> {
  slug: string;
  f: FormInstance<T>;
}

export function NavForm<T extends NavFormDto>({ slug, f }: Props<T>) {
  const { data } = useSWR<Post[], any, string>(`/api/posts?slug=${slug}`, url => fetch(url).then(res => res.json()));
  const nodes = useMemo<Node[]>(() => {
    const values: Node[] = [];
    const dict: Record<string, Node> = {};
    if (!data) {
      return [];
    }
    for (const x of data!) {
      dict[x.id] = { value: x.id, title: x.name, children: [] };
    }
    for (const x of data) {
      const node = dict[x.id]!;
      if (x.parent === 0) {
        values.push(node);
      } else {
        const pid = x.parent;
        if (dict[pid]) {
          const parent = dict[pid]!;
          parent.children!.push(node);
        }
      }
    }
    return values;
  }, [data]);
  const render = Form.useWatch<T>(values => values.render, f);
  return (
    <Form<T>
      style={{ marginTop: 24 }}
      layout={'vertical'}
      form={f}
      initialValues={{ slug, parent: 0, render: 'page', status: true }}
    >
      <Form.Item name={'slug'} required hidden>
        <Input />
      </Form.Item>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="名称" name={'name'} required rules={[{ required: true, message: '分类名称不能为空' }]}>
            <Input placeholder="请输入分类名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="父级" name={'parent'} required={true}>
            <TreeSelect
              showSearch
              allowClear
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="请选择父级分类"
              treeDefaultExpandAll
              treeData={[{ title: '无', value: 0, children: [] }, ...nodes]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="类型" name={'render'} required>
            <Select
              options={[
                { value: 'page', label: '独立页面' },
                { value: 'catalog', label: '目录页面' },
                { value: 'gallery', label: '画廊页面' },
                { value: 'customize', label: '自定义' }
              ]}
            />
          </Form.Item>
        </Col>

        {render === 'customize' && (
          <Col span={12}>
            <Form.Item
              label="自定义标识"
              name={'customize'}
              required
              rules={[{ required: true, message: '自定义标识不能为空' }]}
            >
              <Input placeholder="请英文字母定义标识" />
            </Form.Item>
          </Col>
        )}

        <Col span={12}>
          <Form.Item label="显示" name={'status'} required>
            <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
