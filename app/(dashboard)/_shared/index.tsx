import { createContext } from 'react';

import { Content, Menu, Post } from '@prisma/client';
import { App } from 'antd';
import { FormInstance } from 'antd/es/form/hooks/useForm';
import { SWRResponse } from 'swr';

export type Nav = Pick<Post, 'id' | 'parent' | 'name' | 'render'>;
export type NavDto = Pick<Post, 'parent' | 'name' | 'slug' | 'render' | 'customize' | 'status'>;
export interface Event {
  name: string;
  value: any;
}

export interface Config {
  public_url: string;
}

export interface VType {
  config?: Config;
  menus: SWRResponse<Menu[], any, string>;
}

export const VContext = createContext<VType | null>(null);

export type Detail = Pick<Post, 'create_time' | 'update_time'>;
export type PostDto = Post & { content: Content };

export interface PostContextType {
  navs: SWRResponse<Nav[], any, any>;
  collapsed: boolean;
  setCollapsed: (_: boolean) => void;
  detail: Detail | null;
  setDetail: (_: Detail) => void;
  form: FormInstance<PostDto>;
}

export const PostContext = createContext<PostContextType | null>(null);
