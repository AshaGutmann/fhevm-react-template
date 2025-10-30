/**
 * Framework adapters
 * Exports adapters for different JavaScript frameworks
 */

export {
  initReactFHEVM,
  createReactErrorHandler,
  FHEVMErrorBoundary,
  type ReactAdapterConfig,
} from './react';

export {
  initNextJSFHEVM,
  isServerSide,
  isClientSide,
  createNextJSAPIHelper,
  NextJSAPIHelper,
  type NextJSAdapterConfig,
} from './nextjs';
