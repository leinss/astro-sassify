import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_Bnlt-_3Q.mjs';
import { manifest } from './manifest_D2qr_mSn.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/ai-communication/404.astro.mjs');
const _page3 = () => import('./pages/ai-communication/blog/_slug_.astro.mjs');
const _page4 = () => import('./pages/ai-communication/blog.astro.mjs');
const _page5 = () => import('./pages/ai-communication/imprint.astro.mjs');
const _page6 = () => import('./pages/ai-communication/privacy-policy.astro.mjs');
const _page7 = () => import('./pages/ai-communication.astro.mjs');
const _page8 = () => import('./pages/ki-kommunikation/404.astro.mjs');
const _page9 = () => import('./pages/ki-kommunikation/blog/_slug_.astro.mjs');
const _page10 = () => import('./pages/ki-kommunikation/blog.astro.mjs');
const _page11 = () => import('./pages/ki-kommunikation/datenschutzerklaerung.astro.mjs');
const _page12 = () => import('./pages/ki-kommunikation/impressum.astro.mjs');
const _page13 = () => import('./pages/ki-kommunikation.astro.mjs');
const _page14 = () => import('./pages/ki-kommunikation.astro.mjs');
const pageMap = new Map([
    ["node_modules/.pnpm/astro@5.16.11_@types+node@22.15.29_jiti@1.21.7_rollup@4.55.2_typescript@5.8.2_yaml@2.7.1/node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/ai-communication/404.astro", _page2],
    ["src/pages/ai-communication/blog/[slug].astro", _page3],
    ["src/pages/ai-communication/blog/index.astro", _page4],
    ["src/pages/ai-communication/imprint.astro", _page5],
    ["src/pages/ai-communication/privacy-policy.astro", _page6],
    ["src/pages/ai-communication/index.astro", _page7],
    ["src/pages/ki-kommunikation/404.astro", _page8],
    ["src/pages/ki-kommunikation/blog/[slug].astro", _page9],
    ["src/pages/ki-kommunikation/blog/index.astro", _page10],
    ["src/pages/ki-kommunikation/datenschutzerklaerung.astro", _page11],
    ["src/pages/ki-kommunikation/impressum.astro", _page12],
    ["src/pages/ki-kommunikation/index.astro", _page13],
    ["src/pages/ki-kommunikation/index.astro", _page14]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///home/runner/work/astro-sassify/astro-sassify/dist/client/",
    "server": "file:///home/runner/work/astro-sassify/astro-sassify/dist/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
