// This is a polyfill for crypto.getRandomValues for environments that don't support it
// This helps fix issues with TensorFlow.js and other libraries that use crypto.getRandomValues

if (typeof window !== 'undefined') {
  if (typeof window.crypto === 'undefined') {
    // @ts-ignore - we're deliberately creating a polyfill
    window.crypto = {};
  }
  
  if (!window.crypto.getRandomValues) {
    // @ts-ignore - Type issues with the polyfill implementation
    window.crypto.getRandomValues = function<T extends ArrayBufferView>(array: T): T {
      const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }
}

// Export empty to allow importing as a module
export {};