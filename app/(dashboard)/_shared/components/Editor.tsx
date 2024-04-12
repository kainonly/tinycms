import React from 'react';

export interface EditorProp {
  id: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Editor({ id, value, onChange }: EditorProp) {
  return <></>;
}
