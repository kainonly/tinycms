import { Injectable } from '@angular/core';
import { catchError, concatMap, firstValueFrom, map, throwError } from 'rxjs';
import { AjaxError, ajax } from 'rxjs/ajax';
import type { EditorUploadHandler } from 'ngx-wangeditor-next';

/**
 * 腾讯云 COS 前端直传服务（后端签名 + POST Object 表单上传）。
 *
 * 直传架构：后端为每个文件生成 POST Object 上传签名（key 由后端生成），
 * 前端将签名与文件组成 FormData 直传存储桶，不经过应用服务器，无需引入 COS SDK。
 * 请求基于 rxjs/ajax（XMLHttpRequest）：fetch 与 HttpClient 的 fetch 后端均不支持
 * 上传进度，XHR 的 progressSubscriber 可在直传过程中抛出 0-100 百分比。
 */

/** 后端签名接口返回：COS POST Object 表单上传签名 */
export interface CosSign {
  /** 对象键，由后端按传入的目录前缀生成 */
  key: string;
  /** 经 Base64 编码的策略文档 */
  policy: string;
  'q-sign-algorithm': string;
  'q-ak': string;
  'q-key-time': string;
  'q-signature': string;
}

/** COS 前端直传配置 */
export interface CosUploadOptions {
  /** 后端签名接口地址（GET，携带 prefix 查询参数），返回格式见 CosSign */
  signUrl: string;
  /** 存储桶 POST Object 上传地址，或指向存储桶的自定义域名 */
  uploadUrl: string;
  /** 上传结果 URL 前缀，最终 URL 为 `${assets}/${key}` */
  assets: string;
  /** 目录前缀模板，`{kind}` 会替换为 image 或 video，默认 `wangeditor/{kind}/` */
  prefix?: string;
  /** 文件大小上限（KB），默认 10240（10MB） */
  limit?: number;
}

const DEFAULT_PREFIX = 'wangeditor/{kind}/';
const DEFAULT_LIMIT_KB = 10240;

/**
 * 示例配置：填入你的签名接口与存储桶信息后，demo 自动从 dataURL 模拟切换为 COS 前端直传。
 * 后端签名接口需自行实现，按目录前缀生成 key 并返回表单签名。
 */
export const COS_DEMO_OPTIONS: CosUploadOptions = {
  signUrl: '/api/cos-sign',
  uploadUrl: '',
  assets: '',
};

/** 配置是否完整：signUrl、uploadUrl、assets 均不为空时启用直传 */
export function isCosConfigured(options: CosUploadOptions): boolean {
  return Boolean(options.signUrl && options.uploadUrl && options.assets);
}

@Injectable({ providedIn: 'root' })
export class CosUploadService {
  /** 获取指定目录前缀的上传签名 */
  sign(signUrl: string, prefix: string) {
    const separator = signUrl.includes('?') ? '&' : '?';
    return ajax<CosSign>(`${signUrl}${separator}prefix=${encodeURIComponent(prefix)}`).pipe(
      map((response) => response.response),
      catchError((error: unknown) => {
        const status = error instanceof AjaxError ? error.status : 0;
        return throwError(() => new Error(`获取上传签名失败：HTTP ${status}`));
      }),
    );
  }

  /** 将签名与文件组成 FormData 直传存储桶（POST Object 成功返回 204 No Content），
   * 通过 progressSubscriber 抛出 0-100 的上传百分比 */
  push(uploadUrl: string, signed: CosSign, file: File, onProgress?: (percent: number) => void) {
    const data = new FormData();
    for (const [key, value] of Object.entries(signed)) data.append(key, value);
    data.append('Content-Type', file.type);
    data.append('file', file); // file 必须位于表单最后
    return ajax({
      url: uploadUrl,
      method: 'POST',
      body: data,
      progressSubscriber: {
        next: (event) => {
          if (event.total) onProgress?.(Math.round((100 * event.loaded) / event.total));
        },
      },
    }).pipe(catchError(() => throwError(() => new Error('文件上传失败，请重试'))));
  }

  /**
   * 创建符合组件 upload 输入的上传函数，图片返回 `{ url, alt }`，视频返回 `{ url, poster }`（数据万象截帧作为封面）。
   * `onProgress` 在直传过程中以 0-100 百分比回调上传进度。
   */
  createUpload(
    options: CosUploadOptions,
    onProgress?: (percent: number) => void,
  ): EditorUploadHandler {
    return async (file, kind) => {
      if (!file.type.startsWith(`${kind}/`)) {
        throw new Error(kind === 'image' ? '请选择图片文件' : '请选择视频文件');
      }
      const limit = options.limit ?? DEFAULT_LIMIT_KB;
      if (file.size > limit * 1024) {
        throw new Error(`文件不能超过 ${limit / 1024} MB`);
      }

      const prefix = (options.prefix ?? DEFAULT_PREFIX).replace('{kind}', kind);
      const signed = await firstValueFrom(
        this.sign(options.signUrl, prefix).pipe(
          concatMap((result) =>
            this.push(options.uploadUrl, result, file, onProgress).pipe(map(() => result)),
          ),
        ),
      );
      const url = `${options.assets}/${signed.key}`;
      return kind === 'video'
        ? { url, poster: `${url}?ci-process=snapshot&time=1` }
        : { url, alt: file.name };
    };
  }
}
