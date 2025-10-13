// This is a polyfill for crypto.getRandomValues for environments that don't support it
// This helps fix issues with TensorFlow.js and other libraries that use crypto.getRandomValues in a Node environment

if (typeof window !== 'undefined') {
  if (typeof window.crypto === 'undefined') {
    window.crypto = {};
  }
  
  if (!window.crypto.getRandomValues) {
    window.crypto.getRandomValues = function(array) {
      const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }
}