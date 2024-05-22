//import path from 'node:path';

//import { partytownVite } from '@builder.io/partytown/utils';
import legacy from '@vitejs/plugin-legacy';
import { visualizer } from 'rollup-plugin-visualizer';

import _config from './_config.js';

const HOST = _config.server.host;
const PORT = _config.server.port;

export default {
  server: {
    host: HOST,
    port: PORT
  },
  plugins: [
    //legacy(),
    //viteSingleFile({
    //  deleteInlinedFiles: true,
    //  removeViteModuleLoader: true
    //})
    /*
    visualizer({
      emitFile: true,
      filename: 'stats.html',
      template: 'sunburst'
    })
     */
  ],
  build: {
    sourcemap: false
  }
};
