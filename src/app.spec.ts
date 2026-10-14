import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { IDomEditor, Toolbar } from '@wangeditor-next/editor';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { EDITOR_LOADER, EditorEngine } from 'ngx-wangeditor-next';

import { App } from './app';

type Options = NonNullable<Parameters<EditorEngine['createEditor']>[0]>;

const INITIAL_HTML = '<p>你好，这是 <strong>ngx-wangeditor-next</strong> 示例。</p>';

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

describe('App', () => {
  let mock: ReturnType<typeof mockEngine>;
  let fixture: ComponentFixture<App>;

  beforeEach(() => {
    mock = mockEngine();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: EDITOR_LOADER, useValue: () => Promise.resolve(mock.engine) },
      ],
    });
    fixture = TestBed.createComponent(App);
  });
  afterEach(() => TestBed.resetTestingModule());

  function button(text: string): HTMLButtonElement {
    const found = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((item) => item.textContent?.trim() === text);
    if (!found) throw new Error(`找不到按钮：${text}`);
    return found;
  }

  it('以初始内容与配置创建编辑器，并记录初始化日志', async () => {
    await fixture.whenStable();
    expect(mock.options().html).toBe(INITIAL_HTML);
    expect(mock.options().mode).toBe('default');
    expect(mock.options().config?.maxLength).toBe(10000);
    expect(mock.engine.createToolbar).toHaveBeenCalledWith(
      expect.objectContaining({ config: { excludeKeys: ['fullScreen'] } }),
    );
    const logs = fixture.nativeElement.querySelectorAll('.logs li');
    expect(logs.length).toBe(1);
    expect(logs[0].textContent).toContain('编辑器初始化完成');
  });

  it('切换模式销毁旧实例并按新模式重建', async () => {
    await fixture.whenStable();
    button('simple').click();
    await fixture.whenStable();
    expect(mock.engine.createEditor).toHaveBeenCalledTimes(2);
    expect(mock.options().mode).toBe('simple');
    expect(mock.editor.destroy).toHaveBeenCalledOnce();
    expect(mock.toolbar.destroy).toHaveBeenCalledOnce();
    expect(button('simple').classList.contains('active')).toBe(true);
    expect(button('default').classList.contains('active')).toBe(false);
  });

  it('编辑器输入防抖 300ms 写入预览，且只保留最后一次', async () => {
    await fixture.whenStable();
    mock.editor.setHtml('<p>第一次输入</p>');
    await fixture.whenStable();
    expect(fixture.componentInstance.htmlPreview()).toBe('');
    mock.editor.setHtml('<p>第二次输入</p>');
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(fixture.componentInstance.htmlPreview()).toBe('<p>第二次输入</p>');
  });

  it('切换禁用状态同步到表单与编辑器实例', async () => {
    await fixture.whenStable();
    button('禁用编辑器').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.content.disabled).toBe(true);
    expect(mock.editor.disable).toHaveBeenCalledOnce();
    button('启用编辑器').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.content.enabled).toBe(true);
    expect(mock.editor.enable).toHaveBeenCalledOnce();
  });

  it('重置内容将新值写入编辑器', async () => {
    await fixture.whenStable();
    button('重置内容').click();
    await fixture.whenStable();
    expect(mock.editor.setHtml).toHaveBeenCalledWith('<p>内容已重置。</p>');
    expect(fixture.componentInstance.content.value).toBe('<p>内容已重置。</p>');
  });

  it('失焦日志按最新在前展示，日志最多保留 6 条', async () => {
    await fixture.whenStable();
    mock.options().config?.onBlur?.(mock.editor as unknown as IDomEditor);
    await fixture.whenStable();
    const logs = fixture.nativeElement.querySelectorAll('.logs li');
    expect(logs.length).toBe(2);
    expect(logs[0].textContent).toContain('编辑器失焦');
    expect(logs[1].textContent).toContain('编辑器初始化完成');
    for (let i = 0; i < 8; i++) fixture.componentInstance.log(`日志${i}`);
    await fixture.whenStable();
    expect(fixture.componentInstance.logs().length).toBe(6);
    expect(fixture.componentInstance.logs()[0]).toContain('日志7');
  });

  it('上传与编辑器错误写入提示并记录上传日志', async () => {
    await fixture.whenStable();
    const file = new File(['x'], 'x.png');
    fixture.componentInstance.onUploadError({
      file,
      kind: 'image',
      error: new Error('文件读取失败'),
    });
    expect(fixture.componentInstance.errorMessage()).toBe('文件读取失败');
    fixture.componentInstance.onUploadError({ file, kind: 'video', error: '网络异常' });
    expect(fixture.componentInstance.errorMessage()).toBe('上传失败：x.png');
    fixture.componentInstance.onEditorError(new Error('编辑器加载失败'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain('编辑器加载失败');
    expect(fixture.componentInstance.logs()[0]).toContain('上传失败：x.png（video）');
  });

  it('图片上传期间展示任务数并禁用按钮，完成后插入 dataURL', async () => {
    await fixture.whenStable();
    const insert = vi.fn();
    const upload = mock.options().config!.MENU_CONF!['uploadImage']!.customUpload!;
    const task = upload(new File(['x'], 'x.png'), insert, mock.editor as unknown as IDomEditor);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.pending')?.textContent).toContain('1');
    expect(button('禁用编辑器').disabled).toBe(true);
    await task;
    await fixture.whenStable();
    expect(insert).toHaveBeenCalledWith(expect.stringMatching(/^data:/), 'x.png', '');
    expect(fixture.nativeElement.querySelector('.pending')).toBeNull();
    expect(button('禁用编辑器').disabled).toBe(false);
  });
});
