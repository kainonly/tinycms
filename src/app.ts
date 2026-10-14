import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom, fromEvent, map, race, switchMap, throwError, timer } from 'rxjs';
import {
  EditorUploadError,
  EditorUploadHandler,
  IEditorConfig,
  IToolbarConfig,
  NgxWangEditor,
} from 'ngx-wangeditor-next';

import { COS_DEMO_OPTIONS, CosUploadService, isCosConfigured } from './cos-upload';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, NgxWangEditor],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnDestroy {
  readonly content = new FormControl(
    '<p>你好，这是 <strong>ngx-wangeditor-next</strong> 示例。</p>',
    {
      nonNullable: true,
    },
  );
  readonly mode = signal<'default' | 'simple'>('default');
  /** mode 在初始化时读取，切换时递增以重建编辑器组件 */
  readonly renderKey = signal(0);
  readonly pending = signal(0);
  readonly disabled = signal(false);
  readonly htmlPreview = signal('');
  readonly errorMessage = signal('');
  readonly logs = signal<string[]>([]);

  readonly editorConfig: Partial<IEditorConfig> = { maxLength: 10000 };
  readonly toolbarConfig: Partial<IToolbarConfig> = { excludeKeys: ['fullScreen'] };

  private readonly cosUploadService = inject(CosUploadService);

  readonly uploadProgress = signal(0);

  /** 将上传的文件转为 dataURL（RxJS 监听 FileReader），纯前端可运行，无需后端接口 */
  readonly dataUrlUpload: EditorUploadHandler = (file, kind) => {
    const reader = new FileReader();
    const load$ = fromEvent(reader, 'load').pipe(map(() => reader.result as string));
    const error$ = fromEvent(reader, 'error').pipe(
      switchMap(() => throwError(() => new Error('文件读取失败'))),
    );
    timer(600).subscribe(() => reader.readAsDataURL(file)); // 模拟网络延迟
    return firstValueFrom(race(load$, error$)).then((url) => ({ url, alt: file.name }));
  };

  /** COS 前端直传示例：在 src/cos-upload.ts 填写 COS_DEMO_OPTIONS 后自动启用 */
  readonly cosUpload = isCosConfigured(COS_DEMO_OPTIONS)
    ? this.cosUploadService.createUpload(
        COS_DEMO_OPTIONS,
        (percent) => this.uploadProgress.set(percent), // XHR 上传进度
      )
    : undefined;

  readonly upload: EditorUploadHandler = this.cosUpload ?? this.dataUrlUpload;

  /** 页面展示当前上传方式 */
  readonly uploadMode = this.cosUpload ? 'COS 前端直传' : 'dataURL 模拟';

  onPendingChange(count: number): void {
    this.pending.set(count);
    if (count === 0) this.uploadProgress.set(0);
  }

  /** 编辑器每次按键都会触发 htmlChange，防抖后再写入 signal，避免每键重渲染预览 */
  private previewTimer?: ReturnType<typeof setTimeout>;

  updatePreview(html: string): void {
    clearTimeout(this.previewTimer);
    this.previewTimer = setTimeout(() => this.htmlPreview.set(html), 300);
  }

  ngOnDestroy(): void {
    clearTimeout(this.previewTimer);
  }

  switchMode(mode: 'default' | 'simple'): void {
    this.mode.set(mode);
    this.renderKey.update((key) => key + 1);
  }

  toggleDisabled(): void {
    if (this.disabled()) {
      this.content.enable();
      this.disabled.set(false);
    } else {
      this.content.disable();
      this.disabled.set(true);
    }
  }

  resetContent(): void {
    this.content.setValue('<p>内容已重置。</p>');
  }

  onUploadError(event: EditorUploadError): void {
    this.errorMessage.set(
      event.error instanceof Error ? event.error.message : `上传失败：${event.file.name}`,
    );
    this.log(`上传失败：${event.file.name}（${event.kind}）`);
  }

  onEditorError(error: unknown): void {
    this.errorMessage.set(error instanceof Error ? error.message : '编辑器加载失败');
  }

  log(message: string): void {
    const time = new Date().toLocaleTimeString();
    this.logs.update((entries) => [`${time} ${message}`, ...entries].slice(0, 6));
  }
}
