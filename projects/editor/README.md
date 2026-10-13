# ngx-wangeditor-next

Angular 22 standalone 富文本编辑器组件，基于 `@wangeditor-next/editor` 6.5。支持 Angular 表单、自定义图片与视频上传、工具栏配置和主题定制，采用 MIT 许可证。上传服务及消息提示由使用者提供。

## 本地开发

```sh
npm install
npm run watch
```

在另一个终端执行验证：

```sh
npm run build
npm test
npm run check
npm run format:check
npm run check:package
```

`npm run pack` 生成 `dist/ngx-wangeditor-next-0.1.0.tgz`；`check:package` 实际将包安装到临时项目，验证无 DOM 导入和 Angular AOT 编译。暂未发布到 npm。

## 安装与样式

```sh
npm install /path/to/ngx-wangeditor-next-0.1.0.tgz @wangeditor-next/editor
```

Angular 应用在全局样式中引入引擎样式：

```css
@import '@wangeditor-next/editor/dist/css/style.css';
```

库自身携带外壳样式，不依赖 NG-ZORRO。Angular、Forms 和编辑器引擎都是 peerDependencies。图片和视频 HTML 保持 wangEditor-next 原有格式。

## 表单使用

在 standalone 组件的 `imports` 中加入 `NgxWangEditor` 和 `ReactiveFormsModule`。

```ts
import { FormControl } from '@angular/forms';
import { NgxWangEditor, EditorUploadHandler, EditorUploadError } from 'ngx-wangeditor-next';

readonly content = new FormControl('', { nonNullable: true });
readonly upload: EditorUploadHandler = (file, kind) => this.media.upload(file, kind);

onUploadError(event: EditorUploadError): void {
  this.message.error(event.error instanceof Error ? event.error.message : '上传失败');
}
```

```html
<ngx-wangeditor-next
  [formControl]="content"
  [upload]="upload"
  placeholder="请输入正文，可直接上传图片或视频"
  (uploadError)="onUploadError($event)"
  (editorError)="onEditorError($event)"
  (pendingChange)="pending.set($event)"
/>
```

`media`、`message`、`pending` 和错误处理函数由应用提供。支持响应式表单和 `ngModel`；禁用状态由 Angular Forms 设置。父级写值不会回传为用户修改，失焦会标记 touched。

## 公共 API

| 输入            | 说明                                               |
| --------------- | -------------------------------------------------- |
| `placeholder`   | 默认“请输入正文”                                   |
| `mode`          | `default` 或 `simple`                              |
| `editorConfig`  | wangEditor-next 的编辑器配置                       |
| `toolbarConfig` | 工具栏配置                                         |
| `upload`        | `(file, kind) => Promise<string \| UploadedMedia>` |

| 输出            | 说明                                        |
| --------------- | ------------------------------------------- |
| `created`       | 引擎和工具栏初始化完成后的编辑器实例        |
| `htmlChange`    | 用户修改后的 HTML                           |
| `blurred`       | 失焦                                        |
| `uploadError`   | `{ file, kind, error }`，由应用决定提示方式 |
| `editorError`   | 引擎加载或初始化错误                        |
| `pendingChange` | 自定义上传处理器的进行中任务数量            |

`pending` 是只读 Signal。上传函数可返回 URL 字符串，或 `{ url, alt?, href?, poster? }`。不传 `upload` 时保留引擎的原生菜单配置；传入时接管图片/视频的 `customUpload`，保留各菜单的其他选项。`pending` 仅统计该处理器，不统计通过原生菜单配置完成的上传。

配置、mode、placeholder 在初始化时读取；需更换初始化配置时重建组件。上传处理器已接入的情况下，每次上传读取最新的 `upload` 输入。函数参数不能直接用未绑定的服务方法，建议用箭头函数适配。

引擎通过 `EDITOR_LOADER` 在浏览器端动态加载。SSR 导入库和渲染外壳不会创建编辑器；这不代表 wangEditor 引擎本身可在服务端运行。销毁后不再创建实例、插入上传结果或输出错误，但库不会自动取消应用的上传请求。

## 主题

通过 CSS 自定义属性设置颜色和尺寸，无需依赖特定应用主题。

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

## 应用集成

通过 `upload` 回调对接自建服务或对象存储。文件类型、大小限制和服务端授权由上传服务处理；通过 `uploadError` 和 `editorError` 对接应用的提示组件。

需要等待上传完成再提交表单时，可使用 `pendingChange` 或组件的 `pending` Signal。不同应用可提供各自的上传实现和主题配置，无需修改库代码。

## 许可证

[MIT](LICENSE)
