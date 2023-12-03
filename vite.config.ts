import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import legacy from '@vitejs/plugin-legacy'
import requireTransform from 'vite-plugin-require-transform';
import vitePluginRequire from "vite-plugin-require";
import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs'
import commonjs from '@rollup/plugin-commonjs';





// https://vitejs.dev/config/
export default defineConfig({
  plugins: [    
    vue(),
    nodePolyfills(),

  ],
  define: {
    //'process.env': process.env ?? {},
  },
})


