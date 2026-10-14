import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';

import { UploadedMedia } from 'ngx-wangeditor-next';

import { CosSign, CosUploadOptions, CosUploadService, isCosConfigured } from './cos-upload';

const ajaxMock = vi.hoisted(() => vi.fn());

// 完整替换 rxjs/ajax：ajax 函数可编程返回流，AjaxError 与 mock 实例的 instanceof 检查保持一致
vi.mock('rxjs/ajax', () => {
  class MockAjaxError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  }
  return { ajax: ajaxMock, AjaxError: MockAjaxError };
});

const OPTIONS: CosUploadOptions = {
  signUrl: '/api/cos-sign',
  uploadUrl: 'https://pub.example.com',
  assets: 'https://cdn.example.com',
};

const SIGN: CosSign = {
  key: 'wangeditor/image/1760000000-a.png',
  policy: 'eyJleHBpcmF0aW9uIjoiMjAwMB9=fQ==',
  'q-sign-algorithm': 'sha1',
  'q-ak': 'AKIDxxxxxxxx',
  'q-key-time': '1760000000;1760003600',
  'q-signature': 'signature-token',
};

function ajaxError(status: number): AjaxError {
  const error = Object.create(AjaxError.prototype) as AjaxError;
  error.status = status;
  return error;
}

describe('cos-upload', () => {
  const service = new CosUploadService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('配置不完整时不启用直传', () => {
    expect(isCosConfigured({ ...OPTIONS, signUrl: '' })).toBe(false);
    expect(isCosConfigured({ ...OPTIONS, uploadUrl: '' })).toBe(false);
    expect(isCosConfigured({ ...OPTIONS, assets: '' })).toBe(false);
    expect(isCosConfigured(OPTIONS)).toBe(true);
  });

  it('文件类型不匹配时抛出错误', async () => {
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });
    await expect(service.createUpload(OPTIONS)(file, 'image')).rejects.toThrow('请选择图片文件');
    await expect(service.createUpload(OPTIONS)(file, 'video')).rejects.toThrow('请选择视频文件');
    expect(ajaxMock).not.toHaveBeenCalled();
  });

  it('文件超过大小上限时抛出错误', async () => {
    const file = new File(['x'.repeat(1024 * 1024 + 1)], 'a.png', { type: 'image/png' });
    await expect(service.createUpload({ ...OPTIONS, limit: 1024 })(file, 'image')).rejects.toThrow(
      '文件不能超过 1 MB',
    );
    expect(ajaxMock).not.toHaveBeenCalled();
  });

  it('图片：获取签名后按目录前缀表单直传并返回 url 与 alt，进度按百分比回调', async () => {
    const onProgress = vi.fn();
    ajaxMock
      .mockReturnValueOnce(of({ status: 200, response: SIGN }))
      .mockReturnValueOnce(of({ status: 204, response: null }));
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    await expect(service.createUpload(OPTIONS, onProgress)(file, 'image')).resolves.toEqual({
      url: 'https://cdn.example.com/wangeditor/image/1760000000-a.png',
      alt: 'a.png',
    });

    expect(ajaxMock.mock.calls[0]).toEqual([
      `/api/cos-sign?prefix=${encodeURIComponent('wangeditor/image/')}`,
    ]);
    const config = ajaxMock.mock.calls[1]![0]!;
    expect(config.url).toBe('https://pub.example.com');
    expect(config.method).toBe('POST');
    const body = config.body as FormData;
    for (const [key, value] of Object.entries(SIGN)) {
      expect(body.get(key)).toBe(value);
    }
    expect(body.get('Content-Type')).toBe('image/png');
    expect(body.get('file')).toBe(file);
    // file 必须位于表单最后
    expect([...body.keys()].pop()).toBe('file');
    // progressSubscriber 抛出 0-100 上传百分比
    config.progressSubscriber.next({ total: 1000, loaded: 400 } as ProgressEvent);
    expect(onProgress).toHaveBeenCalledWith(40);
  });

  it('视频：使用视频目录前缀并返回数据万象截帧封面', async () => {
    ajaxMock
      .mockReturnValueOnce(of({ status: 200, response: SIGN }))
      .mockReturnValueOnce(of({ status: 204, response: null }));
    const file = new File(['x'], 'a.mp4', { type: 'video/mp4' });
    const result = (await service.createUpload({ ...OPTIONS, prefix: 'articles/{kind}/' })(
      file,
      'video',
    )) as UploadedMedia;

    expect(ajaxMock.mock.calls[0]![0]).toBe(
      `/api/cos-sign?prefix=${encodeURIComponent('articles/video/')}`,
    );
    const body = ajaxMock.mock.calls[1]![0]!.body as FormData;
    expect(body.get('Content-Type')).toBe('video/mp4');
    expect(result.url).toBe('https://cdn.example.com/wangeditor/image/1760000000-a.png');
    expect(result.poster).toBe(
      'https://cdn.example.com/wangeditor/image/1760000000-a.png?ci-process=snapshot&time=1',
    );
  });

  it('签名接口异常时抛出错误', async () => {
    ajaxMock.mockReturnValueOnce(throwError(() => ajaxError(500)));
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    await expect(service.createUpload(OPTIONS)(file, 'image')).rejects.toThrow(
      '获取上传签名失败：HTTP 500',
    );
    expect(ajaxMock).toHaveBeenCalledTimes(1);
  });

  it('直传失败时抛出错误', async () => {
    ajaxMock
      .mockReturnValueOnce(of({ status: 200, response: SIGN }))
      .mockReturnValueOnce(throwError(() => ajaxError(403)));
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    await expect(service.createUpload(OPTIONS)(file, 'image')).rejects.toThrow(
      '文件上传失败，请重试',
    );
  });
});
