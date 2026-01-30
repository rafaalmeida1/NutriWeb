// Polyfill for Promise.withResolvers (Node.js 22+)
// This file must be imported early to ensure the polyfill is available before any code uses it

interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

// Apply polyfill immediately when this module is loaded
if (typeof Promise.withResolvers === 'undefined') {
  (Promise as any).withResolvers = function <T>(): PromiseWithResolvers<T> {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// Also apply to globalThis if available
if (typeof globalThis !== 'undefined') {
  const GlobalPromise = (globalThis as any).Promise;
  if (GlobalPromise && typeof GlobalPromise.withResolvers === 'undefined') {
    GlobalPromise.withResolvers = (Promise as any).withResolvers;
  }
}

