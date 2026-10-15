import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { describe, expect, it, vi } from 'vitest';

import { NgxWangEditor } from './editor';
import { EDITOR_LOADER, EditorEngine } from './types';

/**
 * 真实服务端渲染回归测试：库本身不面向 SSR，但消费方应用启用 SSR/预渲染时
 * 不得因本库报错。使用 @angular/platform-server 的 renderApplication 走完整
 * 服务端渲染流程（server 平台 + DOM 模拟 + whenStable + 序列化）。
 *
 * 注意：本文件不使用 TestBed——TestBed 的 browser 平台与 renderApplication
 * 的 server 平台共享进程级平台槽位，混用会互相干扰。
 */

/** 模拟消费方应用：zoneless + OnPush + 表单绑定，最接近实际 SSR 场景 */
@Component({
  selector: 'ssr-host',
  imports: [ReactiveFormsModule, NgxWangEditor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ngx-wangeditor-next [formControl]="content" />',
})
class SsrHost {
  readonly content = new FormControl('<p>初始正文</p>', { nonNullable: true });
}

async function renderServer(loader: () => Promise<EditorEngine> = vi.fn()): Promise<string> {
  return renderApplication(
    (context) =>
      bootstrapApplication(
        SsrHost,
        {
          providers: [
            provideZonelessChangeDetection(),
            { provide: EDITOR_LOADER, useValue: loader },
          ],
        },
        context,
      ),
    { document: '<!DOCTYPE html><html><head></head><body><ssr-host></ssr-host></body></html>' },
  );
}

describe('NgxWangEditor SSR 渲染', () => {
  it('服务端渲染不报错，输出占位结构', async () => {
    const html = await renderServer();
    expect(html).toContain('editor-toolbar');
    expect(html).toContain('editor-body');
  });

  it('服务端渲染不加载编辑器引擎', async () => {
    const loader = vi.fn(() => Promise.resolve({} as EditorEngine));
    await renderServer(loader);
    expect(loader).not.toHaveBeenCalled();
  });
});
