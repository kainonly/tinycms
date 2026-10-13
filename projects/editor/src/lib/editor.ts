import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnDestroy,
  output,
  PLATFORM_ID,
  signal,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { IDomEditor, IEditorConfig, IToolbarConfig, Toolbar } from '@wangeditor-next/editor';
import {
  EDITOR_LOADER,
  EditorUploadError,
  EditorUploadHandler,
  MediaKind,
  UploadedMedia,
} from './types';

@Component({
  selector: 'ngx-wangeditor-next',
  templateUrl: './editor.html',
  styleUrl: './editor.css',
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgxWangEditor), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxWangEditor implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly loadEditor = inject(EDITOR_LOADER);
  private readonly toolbarRef = viewChild.required<ElementRef<HTMLElement>>('toolbar');
  private readonly editorRef = viewChild.required<ElementRef<HTMLElement>>('editor');
  readonly placeholder = input('请输入正文');
  readonly mode = input<'default' | 'simple'>('default');
  readonly editorConfig = input<Partial<IEditorConfig>>({});
  readonly toolbarConfig = input<Partial<IToolbarConfig>>({});
  readonly upload = input<EditorUploadHandler>();
  readonly created = output<IDomEditor>();
  readonly htmlChange = output<string>();
  readonly blurred = output<void>();
  readonly uploadError = output<EditorUploadError>();
  readonly editorError = output<unknown>();
  readonly pendingChange = output<number>();
  private readonly pendingState = signal(0);
  readonly pending = this.pendingState.asReadonly();
  private editor?: IDomEditor;
  private toolbar?: Toolbar;
  private value = '';
  private disabled = false;
  private destroyed = false;
  private writing = false;
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value = value ?? '';
    if (!this.editor || this.editor.getHtml() === this.value) return;
    this.writing = true;
    try {
      this.editor.setHtml(this.value);
    } finally {
      this.writing = false;
    }
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    if (disabled) this.editor?.disable();
    else this.editor?.enable();
  }
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) void this.initialize();
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    this.destroyEditor();
  }

  private async initialize(): Promise<void> {
    try {
      const engine = await this.loadEditor();
      if (this.destroyed) return;
      const config = this.editorConfig();
      this.editor = engine.createEditor({
        selector: this.editorRef().nativeElement,
        html: this.value,
        config: {
          autoFocus: false,
          placeholder: this.placeholder(),
          ...config,
          onChange: (editor) => {
            if (this.destroyed || this.writing) return;
            const html = editor.getHtml();
            if (html !== this.value) {
              this.value = html;
              this.onChange(html);
              this.changeDetector.markForCheck();
              this.htmlChange.emit(html);
            }
            config.onChange?.(editor);
          },
          onBlur: (editor) => {
            if (this.destroyed) return;
            this.onTouched();
            this.changeDetector.markForCheck();
            this.blurred.emit();
            config.onBlur?.(editor);
          },
          MENU_CONF: this.upload() ? this.uploadConfig(config) : config.MENU_CONF,
        },
        mode: this.mode(),
      });
      this.toolbar = engine.createToolbar({
        editor: this.editor,
        selector: this.toolbarRef().nativeElement,
        config: this.toolbarConfig(),
        mode: this.mode(),
      });
      if (this.disabled) this.editor.disable();
      this.created.emit(this.editor);
    } catch (error) {
      this.destroyEditor();
      if (!this.destroyed) this.editorError.emit(error);
    }
  }
  private uploadConfig(config: Partial<IEditorConfig>): IEditorConfig['MENU_CONF'] {
    return {
      ...config.MENU_CONF,
      uploadImage: {
        ...config.MENU_CONF?.['uploadImage'],
        customUpload: async (
          file: File,
          insert: (url: string, alt: string, href: string) => void,
        ) => {
          await this.uploadMedia(file, 'image', (media) =>
            insert(media.url, media.alt ?? file.name, media.href ?? ''),
          );
        },
      },
      uploadVideo: {
        ...config.MENU_CONF?.['uploadVideo'],
        customUpload: async (file: File, insert: (url: string, poster: string) => void) => {
          await this.uploadMedia(file, 'video', (media) => insert(media.url, media.poster ?? ''));
        },
      },
    };
  }
  private async uploadMedia(
    file: File,
    kind: MediaKind,
    insert: (media: UploadedMedia) => void,
  ): Promise<void> {
    if (this.destroyed) return;
    const handler = this.upload();
    if (!handler) return;
    this.updatePending(1);
    try {
      const result = await handler(file, kind);
      if (!this.destroyed) insert(typeof result === 'string' ? { url: result } : result);
    } catch (error) {
      if (!this.destroyed) this.uploadError.emit({ file, kind, error });
    } finally {
      this.updatePending(-1);
    }
  }
  private updatePending(delta: number): void {
    this.pendingState.update((value) => value + delta);
    if (!this.destroyed) this.pendingChange.emit(this.pendingState());
  }
  private destroyEditor(): void {
    try {
      this.toolbar?.destroy();
    } finally {
      this.toolbar = undefined;
      this.editor?.destroy();
      this.editor = undefined;
    }
  }
}
