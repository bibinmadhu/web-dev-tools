/**
 * Essential browser polyfills for PDF.js and Modern Web APIs
 * Resolves "undefined is not a function (near '...value of readableStream...')"
 * across Safari, iOS WebKit, Chrome, Firefox, Node, and iframe sandboxes.
 */

if (typeof window !== 'undefined' || typeof globalThis !== 'undefined') {
  const g: any = typeof window !== 'undefined' ? window : globalThis;

  // 1. ReadableStream async iterator & .values() polyfill
  // Crucial for pdfjs-dist in Safari / WebKit and browsers lacking ReadableStream async iteration
  if (typeof g.ReadableStream !== 'undefined') {
    if (!g.ReadableStream.prototype[Symbol.asyncIterator]) {
      g.ReadableStream.prototype[Symbol.asyncIterator] = async function* () {
        const reader = this.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) return;
            yield value;
          }
        } finally {
          reader.releaseLock();
        }
      };
    }

    if (typeof g.ReadableStream.prototype.values !== 'function') {
      g.ReadableStream.prototype.values = function () {
        if (typeof this[Symbol.asyncIterator] === 'function') {
          return this[Symbol.asyncIterator]();
        }
        return (async function* (stream) {
          const reader = stream.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) return;
              yield value;
            }
          } finally {
            reader.releaseLock();
          }
        })(this);
      };
    }
  }

  // 2. Promise.withResolvers and Promise.try polyfill
  if (typeof Promise !== 'undefined') {
    if (typeof (Promise as any).withResolvers !== 'function') {
      (Promise as any).withResolvers = function () {
        let resolve: any, reject: any;
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        return { promise, resolve, reject };
      };
    }
    if (typeof (Promise as any).try !== 'function') {
      (Promise as any).try = function (fn: any, ...args: any[]) {
        return new Promise((resolve) => resolve(fn(...args)));
      };
    }
  }

  // 3. Object.hasOwn polyfill
  if (typeof Object.hasOwn !== 'function') {
    Object.hasOwn = function (object: any, key: PropertyKey): boolean {
      return Object.prototype.hasOwnProperty.call(object, key);
    };
  }

  // 4. Array.prototype.at polyfill
  if (typeof Array.prototype.at !== 'function') {
    Array.prototype.at = function (n: number) {
      n = Math.trunc(n) || 0;
      if (n < 0) n += this.length;
      if (n < 0 || n >= this.length) return undefined;
      return this[n];
    };
  }

  // 5. DOMMatrix polyfill for Node / SSR environments
  if (typeof g.DOMMatrix === 'undefined') {
    g.DOMMatrix = class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      m11 = 1; m12 = 0; m13 = 0; m14 = 0;
      m21 = 0; m22 = 1; m23 = 0; m24 = 0;
      m31 = 0; m32 = 0; m33 = 1; m34 = 0;
      m41 = 0; m42 = 0; m43 = 0; m44 = 1;
      is2D = true; isIdentity = true;
      inverse() { return this; }
      multiply() { return this; }
      scale() { return this; }
      translate() { return this; }
      transformPoint(p: any) { return p; }
    };
  }

  // 6. localStorage polyfill for Node / SSR environments
  if (typeof g.localStorage === 'undefined') {
    const store = new Map<string, string>();
    g.localStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => store.set(key, String(val)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    };
  }
}

export {};
