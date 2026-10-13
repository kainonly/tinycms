# ngx-wangeditor-next

面向 Angular 22.2+ zoneless 应用的富文本编辑器组件，无需 zone.js，支持表单绑定、图片与视频上传、工具栏配置和主题设置。

## 安装

安装打包后的 npm 文件及编辑器依赖：

```sh
npm install /path/to/ngx-wangeditor-next-0.1.0.tgz @wangeditor-next/editor
```

在应用的全局样式中引入：

```css
@import '@wangeditor-next/editor/dist/css/style.css';
```

## 表单绑定

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgxWangEditor } from 'ngx-wangeditor-next';

@Component({
  selector: 'app-editor-demo',
  imports: [ReactiveFormsModule, NgxWangEditor],
  templateUrl: './editor-demo.html',
})
export class EditorDemo {
  readonly content = new FormControl('', { nonNullable: true });
}
```

```html
<ngx-wangeditor-next [formControl]="content" placeholder="请输入正文" />
```

读取、更新和禁用编辑器：

```ts
const html = this.content.value;
this.content.setValue('<p>新的正文</p>');
this.content.disable();
this.content.enable();
```

也支持 `[(ngModel)]`，使用时在组件的 `imports` 中加入 `FormsModule`。

## 图片与视频上传

通过 `upload` 传入上传函数，参数 `kind` 为 `image` 或 `video`。函数返回 URL 字符串，或 `{ url, alt?, href?, poster? }`。

在组件类中添加：

```ts
import { signal } from '@angular/core';
import { EditorUploadHandler, EditorUploadError, UploadedMedia } from 'ngx-wangeditor-next';

readonly pending = signal(0);
readonly errorMessage = signal('');

readonly upload: EditorUploadHandler = async (file, kind) => {
  const body = new FormData();
  body.append('file', file);
  body.append('kind', kind);

  const response = await fetch('/api/upload', { method: 'POST', body });
  if (!response.ok) throw new Error('上传失败');
  return (await response.json()) as UploadedMedia;
};

onUploadError(event: EditorUploadError): void {
  this.errorMessage.set(event.error instanceof Error ? event.error.message : '上传失败');
}

onEditorError(error: unknown): void {
  this.errorMessage.set(error instanceof Error ? error.message : '编辑器加载失败');
}
```

将 `/api/upload` 替换为自己的接口。接口需返回包含 `url` 的 JSON，例如 `{ "url": "https://example.com/image.png" }`。

```html
<ngx-wangeditor-next
  [formControl]="content"
  [upload]="upload"
  (uploadError)="onUploadError($event)"
  (editorError)="onEditorError($event)"
  (pendingChange)="pending.set($event)"
/>
<p>{{ errorMessage() }}</p>
```

`pending()` 可用于在上传期间禁用提交按钮。它仅统计通过 `upload` 函数执行的上传；不传 `upload` 时，可通过 `editorConfig` 使用引擎原生上传配置。

## 编辑器与工具栏配置

```ts
import { IEditorConfig, IToolbarConfig } from 'ngx-wangeditor-next';

readonly editorConfig: Partial<IEditorConfig> = { maxLength: 10000 };
readonly toolbarConfig: Partial<IToolbarConfig> = { excludeKeys: ['fullScreen'] };
```

```html
<ngx-wangeditor-next
  [formControl]="content"
  mode="simple"
  [editorConfig]="editorConfig"
  [toolbarConfig]="toolbarConfig"
/>
```

`mode` 可选 `default` 或 `simple`。配置和占位文字在初始化时读取，修改初始化配置时需重建组件。

## 主题设置

在应用的全局样式中设置：

```css
ngx-wangeditor-next {
  --editor-primary-color: #1677ff;
  --editor-border-color: #d9d9d9;
  --editor-toolbar-background: #fafafa;
  --editor-active-background: #e6f4ff;
  --editor-min-height: 400px;
  --editor-font-size: 14px;
  --editor-line-height: 1.5;
}
```

## 事件

| 事件            | 内容                               |
| --------------- | ---------------------------------- |
| `created`       | 初始化完成后的编辑器实例           |
| `htmlChange`    | 修改后的 HTML                      |
| `blurred`       | 编辑器失焦                         |
| `uploadError`   | 上传失败的 `{ file, kind, error }` |
| `editorError`   | 编辑器加载或初始化错误             |
| `pendingChange` | 正在上传的任务数量                 |
