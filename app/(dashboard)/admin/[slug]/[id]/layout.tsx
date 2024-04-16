'use client';

import React, { useCallback, useContext, useEffect, useState } from 'react';

import { App, Button, Card, Form, Space, Tooltip } from 'antd';
import useSWR from 'swr';

import { PostContext, PostDto } from '@dashboard';
import { Editor } from '@dashboard/components';

import { update } from './actions';

interface Prop {
  params: { slug: string; id: string };
}

export default function NextLayout({ params }: Prop) {
  const { message } = App.useApp();
  const { navs, form, setDetail } = useContext(PostContext)!;
  const { data, mutate } = useSWR<PostDto, any, string>(`/api/posts/${params.id}`, url =>
    fetch(url).then(res => res.json())
  );
  useEffect(() => {
    if (data) {
      setDetail({
        create_time: data.create_time,
        update_time: data.update_time
      });
      form.setFieldsValue(data);
    }
  }, [data, setDetail, form]);
  useEffect(() => {
    mutate();
  }, [navs.data, mutate]);

  const [activeKey, setActiveKey] = useState('default');

  const submit = useCallback(async () => {
    const data = form.getFieldsValue();
    await update(Number(params.id), data);
    message.success('数据更新成功~');
    navs.mutate();
    mutate();
  }, [form, params.id, message, navs, mutate]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        await submit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [submit]);

  const extra = (
    <Space>
      <Button href={`/${params.slug}/${params.id}`} target={'_blank'}>
        查看
      </Button>
      <Tooltip title={'快捷键 [ Ctrl + S ]'}>
        <Button type={'primary'} onClick={submit}>
          发布
        </Button>
      </Tooltip>
    </Space>
  );

  return (
    <Card
      style={{ minHeight: '100%', borderBottom: 'none', borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}
      styles={{ body: { height: 'calc(100% - 24px)' } }}
      {...(data?.render !== 'customize'
        ? { title: data?.name, extra }
        : {
            tabList: [
              { key: 'default', label: data.name },
              { key: data.customize, label: '高级设置' }
            ],
            tabBarExtraContent: extra,
            activeTabKey: activeKey,
            onTabChange: key => {
              setActiveKey(key);
            }
          })}
    >
      <Form hidden={activeKey !== 'default'} form={form} layout={'vertical'}>
        <Form.Item name={['content', 'html']} required>
          <Editor id={`html-${params.id}`} />
        </Form.Item>
      </Form>

      <Form hidden={activeKey !== data?.customize} form={form} layout={'vertical'}>
        {data?.customize === 'introduction' && (
          <Form.Item name={['content', 'metadata', 'banner']} label={'横幅'} required>
            <Editor id={`banner-${params.id}`} />
          </Form.Item>
        )}
      </Form>
    </Card>
  );
}
