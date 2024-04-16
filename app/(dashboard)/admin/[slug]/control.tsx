'use client';

import { useContext, useState } from 'react';

import { CheckOutlined, CloseOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Collapse, Divider, Form, Input, Select, Switch, Upload, Image, Button, Space } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { format } from 'date-fns';

import { PostContext, PostDto, VContext } from '@dashboard';

export function Control() {
  const { config } = useContext(VContext)!;
  const { collapsed, form, detail } = useContext(PostContext)!;

  const render = Form.useWatch(values => values.render, form);
  const thumbnail = Form.useWatch(values => values.thumbnail, form);
  const [uploading, setUploading] = useState(false);

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <Form<PostDto> hidden={collapsed} form={form} layout={'vertical'}>
        <Form.Item label="名称" name={'name'}>
          <Input placeholder="请输入名称" />
        </Form.Item>
        <Form.Item label="类型" name={'render'}>
          <Select
            options={[
              { value: 'page', label: '独立页面' },
              { value: 'catalog', label: '目录页面' },
              { value: 'gallery', label: '画廊页面' },
              { value: 'customize', label: '自定义' }
            ]}
          />
        </Form.Item>

        {render === 'customize' && (
          <Form.Item label="自定义标识" name={'customize'}>
            <Input placeholder="请英文字母定义标识" />
          </Form.Item>
        )}

        <Form.Item label="摘要" name={'summary'}>
          <TextArea showCount maxLength={100} rows={4} placeholder={'撰写摘要（可选）'} />
        </Form.Item>

        {detail && (
          <Collapse
            bordered={false}
            defaultActiveKey={['update_time']}
            items={[
              {
                key: 'create_time',
                style: { border: 'none' },
                label: '创建时间',
                children: <>{format(detail.create_time, 'yyyy 年 MM 月 dd 日 HH:mm')}</>
              },
              {
                key: 'update_time',
                style: { border: 'none' },
                label: '更新时间',
                children: <>{format(detail.update_time, 'yyyy 年 MM 月 dd 日 HH:mm')}</>
              }
            ]}
          />
        )}

        <Divider />

        <Form.Item
          label={
            <Space size={'small'}>
              <span>缩略图</span>
              {thumbnail && (
                <Button
                  type={'link'}
                  size={'small'}
                  onClick={e => {
                    e.preventDefault();
                    form.setFieldValue('thumbnail', '');
                  }}
                >
                  清除
                </Button>
              )}
            </Space>
          }
          name={'thumbnail'}
          valuePropName="file"
          getValueFromEvent={e => {
            if (e.file.status === 'uploading') {
              setUploading(true);
              return;
            }
            if (e.file.status === 'done') {
              setUploading(false);
              return e.file.response.location;
            }
            return '';
          }}
        >
          <Upload className="thumbnail" listType="picture-card" showUploadList={false} action="/api/upload">
            {thumbnail ? (
              <Image height={200} src={config!.public_url + thumbnail} preview={false} alt={'缩略图'} />
            ) : (
              <button style={{ border: 0, background: 'none' }} type="button">
                {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>上传</div>
              </button>
            )}
          </Upload>
        </Form.Item>

        <Form.Item label="显示" name={'status'}>
          <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
        </Form.Item>
      </Form>
    </div>
  );
}
