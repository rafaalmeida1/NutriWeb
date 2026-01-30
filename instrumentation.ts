export async function register() {
  // Polyfill for Promise.withResolvers (Node.js 22+)
  if (typeof Promise.withResolvers === 'undefined') {
    Promise.withResolvers = function () {
      let resolve: (value: any) => void;
      let reject: (reason?: any) => void;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve: resolve!, reject: reject! };
    };
  }
}

