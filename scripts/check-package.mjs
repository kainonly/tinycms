import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'projects/editor/package.json'), 'utf8'));
const archive = join(root, 'dist', `${manifest.name}-${manifest.version}.tgz`);
assert.ok(existsSync(archive), '请先执行 npm run pack');
const consumer = mkdtempSync(join(tmpdir(), 'ngx-wangeditor-next-'));
try {
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  execFileSync(
    'npm',
    ['install', archive, '--ignore-scripts', '--legacy-peer-deps', '--no-audit', '--no-fund'],
    { cwd: consumer, stdio: 'inherit' },
  );
  for (const dependency of ['@angular', '@wangeditor-next', 'rxjs']) {
    symlinkSync(
      join(root, 'node_modules', dependency),
      join(consumer, 'node_modules', dependency),
      'dir',
    );
  }
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "await import('@angular/compiler'); const library = await import('ngx-wangeditor-next'); if (!library.NgxWangEditor || !library.EDITOR_LOADER) throw new Error('缺少公共 API'); console.log('库在无 DOM 环境加载通过');",
    ],
    { cwd: consumer, stdio: 'inherit' },
  );
  writeFileSync(
    join(consumer, 'consumer.ts'),
    `
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgxWangEditor, EditorUploadHandler, EditorUploadError } from 'ngx-wangeditor-next';
@Component({
  selector: 'app-consumer', imports: [NgxWangEditor, ReactiveFormsModule],
  template: '<ngx-wangeditor-next [formControl]="content" [upload]="upload" (uploadError)="onError($event)" (pendingChange)="pending = $event" />'
})
export class Consumer {
  content = new FormControl('', { nonNullable: true });
  pending = 0;
  upload: EditorUploadHandler = async (file, kind) => ({ url: '/media/' + kind + '/' + file.name });
  onError(event: EditorUploadError): void { console.log(event.error); }
}
`,
  );
  writeFileSync(
    join(consumer, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'preserve',
        moduleResolution: 'bundler',
        strict: true,
        skipLibCheck: true,
        experimentalDecorators: true,
        outDir: './out',
        types: [],
      },
      angularCompilerOptions: { strictTemplates: true },
      files: ['consumer.ts'],
    }),
  );
  execFileSync(join(root, 'node_modules/.bin/ngc'), ['-p', join(consumer, 'tsconfig.json')], {
    cwd: consumer,
    stdio: 'inherit',
  });
  console.log('压缩包独立安装、无 DOM 导入和 Angular AOT 消费编译通过。');
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
