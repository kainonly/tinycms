# ngx-wangeditor-next

基于 wangeditor-next 的 Angular 富文本编辑器组件，无需 zone.js（zoneless），支持表单绑定、图片与视频上传、工具栏配置和主题设置。

## 安装

本库与 Angular **大版本**保持一致即可使用（peerDependencies 为 `^22.2.0`，适配 Angular `22.x` 全系）。版本号的 `major.minor` 跟随构建时的 Angular 版本，例如 `22.2.0` 基于 Angular `22.2` 构建。安装组件与编辑器依赖：

```sh
npm install ngx-wangeditor-next @wangeditor-next/editor
```

在应用的全局样式中引入：

```css
@import '@wangeditor-next/editor/dist/css/style.css';
```

## 运行示例

仓库根目录的 `src/` 是一个完整的示例应用，演示表单绑定、图片与视频上传（默认 dataURL 模拟；在 `src/cos-upload.ts` 中填写 COS 配置可切换为腾讯云前端直传）、模式切换、事件日志与主题设置：

```sh
git clone https://github.com/kainonly/ngx-wangeditor-next.git
cd ngx-wangeditor-next
npm install
npm run demo
```

打开 <http://localhost:4200> 查看效果。示例通过 `tsconfig.json` 的路径映射消费 `dist/editor` 中的构建产物，`npm run demo` 会先构建库再启动开发服务器。

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

通过 `upload` 传入上传函数，参数 `kind` 为 `image` 或 `video`。函数返回 URL 字符串，或 `{ url, alt?, href?, poster? }`。上传过程用 RxJS 流处理，最后以 `firstValueFrom` 桥接为组件需要的 Promise。

上传推荐 `rxjs/ajax`（基于 XMLHttpRequest）：`fetch` 与 HttpClient 的 fetch 后端均不支持上传进度，XHR 可通过 `progressSubscriber` 获得上传百分比。

在组件类中添加：

```ts
import { inject, signal } from '@angular/core';
import { ajax } from 'rxjs/ajax';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { EditorUploadHandler, EditorUploadError, UploadedMedia } from 'ngx-wangeditor-next';

readonly pending = signal(0);
readonly errorMessage = signal('');
readonly progress = signal(0);

readonly upload: EditorUploadHandler = (file, kind) => {
  const body = new FormData();
  body.append('file', file);
  body.append('kind', kind);

  return firstValueFrom(
    ajax<UploadedMedia>({
      url: '/api/upload',
      method: 'POST',
      body,
      progressSubscriber: {
        next: (event) => {
          if (event.total) this.progress.set(Math.round((100 * event.loaded) / event.total));
        },
      },
    }).pipe(
      map((response) => response.response),
      catchError(() => throwError(() => new Error('上传失败'))),
    ),
  );
};

onUploadError(event: EditorUploadError): void {
  this.errorMessage.set(event.error instanceof Error ? event.error.message : '上传失败');
}

onEditorError(error: unknown): void {
  this.errorMessage.set(error instanceof Error ? error.message : '编辑器加载失败');
}
```

将 `/api/upload` 替换为自己的接口。接口需返回包含 `url` 的 JSON，例如 `{ "url": "https://example.com/image.png" }`。`progress()` 可用于渲染上传进度条。

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

### 腾讯云 COS 前端直传（后端签名 + 表单直传）

示例应用内置了 COS 前端直传方案（见 `src/cos-upload.ts`）：后端为每个文件生成 POST Object 上传签名，前端将签名与文件组成 FormData 直传存储桶，不经过应用服务器，前端无需引入 COS SDK。签名获取与直传均为 `rxjs/ajax`（XMLHttpRequest）的 RxJS 流，直传过程通过 `progressSubscriber` 抛出上传进度。

后端签名接口（`GET {signUrl}?prefix=目录前缀`）返回如下 JSON，对象键 `key` 由后端生成：

```json
{
  "key": "wangeditor/image/1760000000-a.png",
  "policy": "eyJleHBpcmF0aW9uIjoi...",
  "q-sign-algorithm": "sha1",
  "q-ak": "AKIDxxxxxxxx",
  "q-key-time": "1760000000;1760003600",
  "q-signature": "xxxxxxxx"
}
```

前端注入服务并创建上传函数（可直接复制示例中的 `CosUploadService` 实现）：

```ts
import { inject, signal } from '@angular/core';
import { CosUploadService } from './cos-upload';

private readonly cosUploadService = inject(CosUploadService);

readonly progress = signal(0);

readonly upload = this.cosUploadService.createUpload(
  {
    signUrl: '/api/cos-sign', // 后端签名接口
    uploadUrl: 'https://pub.example.com', // 存储桶 POST Object 地址（或自定义域名）
    assets: 'https://cdn.example.com', // 上传结果 URL 前缀
    // prefix: 'wangeditor/{kind}/', // 可选，目录前缀模板，{kind} 替换为 image / video
    // limit: 10240, // 可选，文件大小上限（KB），默认 10MB
  },
  (percent) => this.progress.set(percent), // 可选：0-100 上传进度回调
);
```

```html
<ngx-wangeditor-next [formControl]="content" [upload]="upload" />
```

上传前会校验文件类型（图片须为 `image/*`、视频须为 `video/*`）与大小；视频封面通过数据万象截帧生成（`ci-process=snapshot&time=1`），需为存储桶开通数据万象服务。表单直传不支持分片，适合 10MB 级别的图片与短视频。

示例应用中，填写 `src/cos-upload.ts` 的 `COS_DEMO_OPTIONS` 后即自动从 dataURL 模拟切换为 COS 直传（页面控制区会显示当前上传方式）。

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
