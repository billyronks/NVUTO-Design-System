import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import fs from 'node:fs';
const manifest = JSON.parse(fs.readFileSync('packages/react/package.json', 'utf8'));
const dependencies = [...Object.keys(manifest.dependencies), ...Object.keys(manifest.peerDependencies)];
export default defineConfig({plugins:[react(), tailwind()], build:{lib:{entry:'packages/react/src/library.ts',formats:['es'],fileName:()=>'index.js',cssFileName:'unscoped'},outDir:'packages/react/dist',emptyOutDir:true,sourcemap:true,rollupOptions:{external:(id)=>dependencies.some(p=>id===p||id.startsWith(p+'/'))}}});
