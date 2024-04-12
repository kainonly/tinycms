import React from 'react';

import { App, Form, ModalFuncProps } from 'antd';
import { FormInstance } from 'antd/es/form/hooks/useForm';

export interface WpxOpenProps<T> extends ModalFuncProps {
  input?: Partial<T>;
  onSubmit: (v: T) => Promise<void>;
}

export function useModalForm<T>(render: (form: FormInstance<T>) => React.ReactNode) {
  const { modal } = App.useApp();
  const [form] = Form.useForm();

  return {
    form,
    open(props: WpxOpenProps<T>) {
      form.resetFields();
      if (props.input) {
        form.setFieldsValue(props.input);
      }
      modal.confirm({
        icon: null,
        content: render(form),
        onOk: () => form.validateFields().then(data => props.onSubmit(data)),
        ...props
      });
    }
  };
}
