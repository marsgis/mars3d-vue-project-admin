import { defineApplicationConfig } from '@vben/vite-config';
import path, { resolve } from 'path';
import { mars3dPlugin } from 'vite-plugin-mars3d';

export default defineApplicationConfig({
  overrides: {
    optimizeDeps: {
      include: [
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        'qrcode',
        '@iconify/iconify',
        'ant-design-vue/es/locale/zh_CN',
        'ant-design-vue/es/locale/en_US',
      ],
    },
    resolve: {
      alias: [
        {
          find: /@mars\//,
          replacement: pathResolve('src/marsgis') + '/',
        },
      ],
    },
    define: {
      'process.env': {
        BASE_URL: '/',
      },
    },
    server: {
      proxy: {
        '/basic-api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp(`^/basic-api`), ''),
          // only https
          // secure: false
        },
        '/upload': {
          target: 'http://localhost:3300/upload',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp(`^/upload`), ''),
        },
      },
      open: true, // 中文
      warmup: {
        clientFiles: ['./index.html', './src/{views,components}/*'],
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "${path.resolve(__dirname, "src/marsgis/components/mars-ui/base.less")}";`
        }
      }
    },
    plugins: [mars3dPlugin()],
  },
});


function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}
