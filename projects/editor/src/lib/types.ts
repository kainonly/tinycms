import { InjectionToken } from '@angular/core';
import type { createEditor, createToolbar } from '@wangeditor-next/editor';

export type MediaKind = 'image' | 'video';
export interface UploadedMedia {
  url: string;
  alt?: string;
  href?: string;
  poster?: string;
}
export type EditorUploadHandler = (file: File, kind: MediaKind) => Promise<string | UploadedMedia>;
export interface EditorUploadError {
  file: File;
  kind: MediaKind;
  error: unknown;
}
export interface EditorEngine {
  createEditor: typeof createEditor;
  createToolbar: typeof createToolbar;
}
export const EDITOR_LOADER = new InjectionToken<() => Promise<EditorEngine>>('EDITOR_LOADER', {
  providedIn: 'root',
  factory: () => () => import('@wangeditor-next/editor'),
});
