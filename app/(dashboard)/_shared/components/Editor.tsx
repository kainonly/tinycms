import React, { useContext } from 'react';

import { Editor as Tinymce } from '@tinymce/tinymce-react';

import { VContext } from '@dashboard';

export interface EditorProp {
  id: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Editor({ id, value, onChange }: EditorProp) {
  const { config } = useContext(VContext)!;
  return (
    config && (
      <Tinymce
        id={id}
        tinymceScriptSrc={'/tinymce/tinymce.min.js'}
        licenseKey={'gpl'}
        value={value}
        init={{
          min_height: 400,
          width: 1200,
          inline: true,
          language: 'zh_CN',
          menubar: false,
          statusbar: false,
          placeholder: '开始写作您的内容~',
          image_advtab: true,
          images_upload_url: '/api/upload',
          image_class_list: [
            { title: 'None', value: '' },
            { title: 'No border', value: 'img_no_border' },
            {
              title: 'Borders',
              menu: [
                { title: 'Green border', value: 'img_green_border' },
                { title: 'Blue border', value: 'img_blue_border' },
                { title: 'Red border', value: 'img_red_border' }
              ]
            }
          ],
          plugins: [
            'autolink',
            'lists',
            'advlist',
            'link',
            'image',
            'charmap',
            'searchreplace',
            'emoticons',
            'fullscreen',
            'media',
            'table',
            'help',
            'quickbars'
          ],
          toolbar: [
            'searchreplace undo redo removeformat',
            'blocks fontsize lineheight bold italic forecolor charmap emoticons',
            'outdent indent alignleft aligncenter alignright alignjustify',
            'table bullist numlist image media',
            'fullscreen help'
          ].join(' | '),
          content_css: ['/styles/fonts.css'],
          images_upload_base_path: config.public_url
        }}
        onEditorChange={v => {
          if (onChange) {
            onChange(v);
          }
        }}
      />
    )
  );
}
