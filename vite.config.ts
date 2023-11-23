import { ConfigEnv, defineConfig, loadEnv, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from 'path';
import packageJson from './package.json';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import electron from 'vite-plugin-electron'
import { fileURLToPath, URL } from 'node:url'

function resolve(url: string) {
  return path.resolve(__dirname, url);
}

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {

  return {
    base: './',
    plugins: [
      vue(),
      mode !== 'dev' && electron({
        // 主进程入口文件
        entry: ['app/electron/main.ts', 'app/electron/preload.ts'],
        vite: {
          build: {
            outDir: fileURLToPath(new URL('./app', import.meta.url)),
          }
        }
      }),
      wasm(),
      topLevelAwait(),
    ],
    clearScreen: false,
    server: {
      port: 8080,
      strictPort: true,
      open: true, // 运行自动打开浏览器
    },
    envPrefix: ["VITE_", "TAURI_"],
    build: {

    },
    resolve: {
      alias: {
        '@': resolve('./src'),
        '~@': resolve('./src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
        },
        less: {
          // 全局添加less
          additionalData: `@import '@/assets/style/var.less';`,
          javascriptEnabled: true,
        },
      },
    },
    define: {
      'process.env': {},
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
    }
  }
});
