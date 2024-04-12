import localFont from 'next/font/local';

export const AlibabaPuHuiTi = localFont({
  src: [
    { path: '../public/fonts/AlibabaPuHuiTi-3-45-Light.woff2', weight: '300', style: 'light' },
    { path: '../public/fonts/AlibabaPuHuiTi-3-55-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/AlibabaPuHuiTi-3-65-Medium.woff2', weight: '500', style: 'medium' }
  ],
  display: 'swap',
  preload: true,
  variable: '--font-alibaba-puhuiti'
});
