// Shim for 'frame-ticker' to provide a stable default export in ESM
// Some vendors import 'frame-ticker/dist/FrameTicker.js' directly, which is UMD/CJS
// and doesn’t expose an ESM default export. This shim ensures a default export exists.

// Import the package via bare specifier so Vite/esbuild can handle CJS interop.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as FrameTickerNS from 'frame-ticker';

// Prefer the default export if available, otherwise fall back to the namespace.
// The constructor is exported as default in CJS builds.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FrameTickerCtor: any = (FrameTickerNS as any).default || (FrameTickerNS as any);

export default FrameTickerCtor;
export * from 'frame-ticker';