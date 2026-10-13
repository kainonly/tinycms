import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { IDomEditor, Toolbar } from '@wangeditor-next/editor';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NgxWangEditor } from './editor';
import { EDITOR_LOADER, EditorEngine } from './types';

type Options = NonNullable<Parameters<EditorEngine['createEditor']>[0]>;
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function mockEngine() {
  let html = '';
  let options!: Options;
  const editor = {
    getHtml: vi.fn(() => html),
    setHtml: vi.fn((value: string) => {
      html = value;
      options.config?.onChange?.(editor as unknown as IDomEditor);
    }),
    disable: vi.fn(),
    enable: vi.fn(),
    destroy: vi.fn(),
  };
  const toolbar = { destroy: vi.fn() };
  const engine: EditorEngine = {
    createEditor: vi.fn((input) => {
      options = input ?? {};
      html = options.html ?? '';
      return editor as unknown as IDomEditor;
    }),
    createToolbar: vi.fn(() => toolbar as unknown as Toolbar),
  };
  return { engine, editor, toolbar, options: () => options };
}
@Component({
  imports: [NgxWangEditor, ReactiveFormsModule],
  template: '<ngx-wangeditor-next [formControl]="content" />',
})
class FormHost {
  readonly content = new FormControl('<p>初始正文</p>', { nonNullable: true });
}

describe('NgxWangEditor', () => {
  let mock: ReturnType<typeof mockEngine>;
  beforeEach(() => {
    mock = mockEngine();
    TestBed.configureTestingModule({
      providers: [{ provide: EDITOR_LOADER, useValue: () => Promise.resolve(mock.engine) }],
    });
  });
  afterEach(() => TestBed.resetTestingModule());
  function startUpload(
    kind: 'image' | 'video',
    file: File,
    insert: (...values: (string | undefined)[]) => void,
  ): Promise<void> {
    const key = kind === 'image' ? 'uploadImage' : 'uploadVideo';
    const upload = mock.options().config!.MENU_CONF![key]!.customUpload!;
    return Promise.resolve(upload(file, insert, mock.editor as unknown as IDomEditor));
  }

  it('响应式表单写值不反向触发修改，用户输入和失焦正常回传', async () => {
    const fixture = TestBed.createComponent(FormHost);
    await fixture.whenStable();
    expect(mock.options().html).toBe('<p>初始正文</p>');
    const change = vi.fn();
    fixture.componentInstance.content.valueChanges.subscribe(change);
    fixture.componentInstance.content.setValue('<p>外部更新</p>', { emitEvent: false });
    expect(mock.editor.setHtml).toHaveBeenCalledWith('<p>外部更新</p>');
    expect(change).not.toHaveBeenCalled();
    mock.editor.setHtml('<p>用户输入</p>');
    expect(fixture.componentInstance.content.value).toBe('<p>用户输入</p>');
    expect(change).toHaveBeenCalledOnce();
    mock.options().config?.onBlur?.(mock.editor as unknown as IDomEditor);
    expect(fixture.componentInstance.content.touched).toBe(true);
    fixture.componentInstance.content.disable();
    expect(mock.editor.disable).toHaveBeenCalled();
    fixture.componentInstance.content.enable();
    expect(mock.editor.enable).toHaveBeenCalled();
  });

  it('实际 wangEditor 引擎初始化和外部写值不会反向修改表单', async () => {
    TestBed.overrideProvider(EDITOR_LOADER, { useValue: () => import('@wangeditor-next/editor') });
    const fixture = TestBed.createComponent(NgxWangEditor);
    const initialized = deferred<IDomEditor>();
    const changed = vi.fn();
    fixture.componentInstance.registerOnChange(changed);
    fixture.componentInstance.writeValue('<p>初始正文</p>');
    fixture.componentInstance.created.subscribe((editor) => initialized.resolve(editor));
    fixture.componentInstance.editorError.subscribe((error) => initialized.reject(error));
    await fixture.whenStable();
    const editor = await initialized.promise;
    fixture.componentInstance.writeValue('<p>外部正文</p>');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(editor.getHtml()).toBe('<p>外部正文</p>');
    expect(changed).not.toHaveBeenCalled();
  });

  it('加载未完成时保留最新值和禁用状态', async () => {
    const loader = deferred<EditorEngine>();
    TestBed.overrideProvider(EDITOR_LOADER, { useValue: () => loader.promise });
    const fixture = TestBed.createComponent(NgxWangEditor);
    await fixture.whenStable();
    fixture.componentInstance.writeValue('<p>最新正文</p>');
    fixture.componentInstance.setDisabledState(true);
    loader.resolve(mock.engine);
    await fixture.whenStable();
    expect(mock.options().html).toBe('<p>最新正文</p>');
    expect(mock.editor.disable).toHaveBeenCalledOnce();
  });

  it('销毁后引擎加载完成也不再创建实例', async () => {
    const loader = deferred<EditorEngine>();
    TestBed.overrideProvider(EDITOR_LOADER, { useValue: () => loader.promise });
    const fixture = TestBed.createComponent(NgxWangEditor);
    await fixture.whenStable();
    fixture.destroy();
    loader.resolve(mock.engine);
    await loader.promise;
    expect(mock.engine.createEditor).not.toHaveBeenCalled();
  });

  it('服务端不导入浏览器编辑器引擎', async () => {
    const load = vi.fn();
    TestBed.overrideProvider(EDITOR_LOADER, { useValue: load });
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    const fixture = TestBed.createComponent(NgxWangEditor);
    await fixture.whenStable();
    expect(load).not.toHaveBeenCalled();
  });

  it('传递工具栏和菜单配置并保留用户的编辑回调', async () => {
    const fixture = TestBed.createComponent(NgxWangEditor);
    const onChange = vi.fn();
    const toolbar = { excludeKeys: ['fullScreen'] };
    fixture.componentRef.setInput('toolbarConfig', toolbar);
    fixture.componentRef.setInput('editorConfig', { maxLength: 200, onChange });
    await fixture.whenStable();
    expect(mock.options().config?.maxLength).toBe(200);
    expect(mock.engine.createToolbar).toHaveBeenCalledWith(
      expect.objectContaining({ config: toolbar }),
    );
    mock.editor.setHtml('<p>正文</p>');
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('图片和视频插入使用应用返回的信息，并统计并发上传', async () => {
    const image = deferred<{ url: string; alt: string; href: string }>();
    const video = deferred<{ url: string; poster: string }>();
    const fixture = TestBed.createComponent(NgxWangEditor);
    fixture.componentRef.setInput('upload', (_file: File, kind: string) =>
      kind === 'image' ? image.promise : video.promise,
    );
    await fixture.whenStable();
    const imageInsert = vi.fn();
    const videoInsert = vi.fn();
    const imageUpload = startUpload('image', new File(['image'], 'image.png'), imageInsert);
    const videoUpload = startUpload('video', new File(['video'], 'video.mp4'), videoInsert);
    expect(fixture.componentInstance.pending()).toBe(2);
    image.resolve({ url: '/image.png', alt: '图片', href: '/detail' });
    await imageUpload;
    expect(imageInsert).toHaveBeenCalledWith('/image.png', '图片', '/detail');
    expect(fixture.componentInstance.pending()).toBe(1);
    video.resolve({ url: '/video.mp4', poster: '/poster.png' });
    await videoUpload;
    expect(videoInsert).toHaveBeenCalledWith('/video.mp4', '/poster.png');
    expect(fixture.componentInstance.pending()).toBe(0);
  });

  it('上传失败输出错误，计数归零且不插入内容', async () => {
    const error = new Error('文件超限');
    const fixture = TestBed.createComponent(NgxWangEditor);
    fixture.componentRef.setInput('upload', () => Promise.reject(error));
    const received = vi.fn();
    fixture.componentInstance.uploadError.subscribe(received);
    await fixture.whenStable();
    const file = new File(['image'], 'image.png');
    const insert = vi.fn();
    await startUpload('image', file, insert);
    expect(received).toHaveBeenCalledWith({ error, file, kind: 'image' });
    expect(insert).not.toHaveBeenCalled();
    expect(fixture.componentInstance.pending()).toBe(0);
  });

  it('销毁后不插入迟到的上传结果，并清理工具栏和编辑器', async () => {
    const upload = deferred<string>();
    const fixture = TestBed.createComponent(NgxWangEditor);
    fixture.componentRef.setInput('upload', () => upload.promise);
    await fixture.whenStable();
    const insert = vi.fn();
    const task = startUpload('image', new File(['x'], 'x.png'), insert);
    fixture.destroy();
    upload.resolve('/x.png');
    await task;
    expect(insert).not.toHaveBeenCalled();
    expect(mock.toolbar.destroy).toHaveBeenCalledOnce();
    expect(mock.editor.destroy).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.pending()).toBe(0);
  });

  it('工具栏创建失败时清理已创建编辑器并输出初始化错误', async () => {
    const error = new Error('toolbar failure');
    vi.mocked(mock.engine.createToolbar).mockImplementation(() => {
      throw error;
    });
    const fixture = TestBed.createComponent(NgxWangEditor);
    const received = vi.fn();
    fixture.componentInstance.editorError.subscribe(received);
    await fixture.whenStable();
    expect(received).toHaveBeenCalledWith(error);
    expect(mock.editor.destroy).toHaveBeenCalledOnce();
  });
});
