// Import polyfill early to ensure it's available before any code uses Promise.withResolvers
import './polyfills/promise-with-resolvers';

export async function register() {
  // Polyfill is applied in the imported file above
}

