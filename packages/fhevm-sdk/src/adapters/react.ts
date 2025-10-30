/**
 * React framework adapter
 * Provides React-specific utilities and integrations
 */

import { createFHEVMInstance, type FHEVMConfig } from '../core/fhevm';
import type { FhevmInstance } from 'fhevmjs';

/**
 * React adapter configuration
 */
export interface ReactAdapterConfig extends FHEVMConfig {
  autoInit?: boolean;
  onInitialized?: (instance: FhevmInstance) => void;
  onError?: (error: Error) => void;
}

/**
 * Initialize FHEVM for React applications
 * @param config - React adapter configuration
 * @returns FHEVM instance
 */
export async function initReactFHEVM(config: ReactAdapterConfig): Promise<FhevmInstance> {
  try {
    const instance = await createFHEVMInstance(config);

    if (config.onInitialized) {
      config.onInitialized(instance);
    }

    return instance;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');

    if (config.onError) {
      config.onError(err);
    }

    throw err;
  }
}

/**
 * React-specific error boundary helper
 */
export class FHEVMErrorBoundary {
  private errorHandler?: (error: Error) => void;

  constructor(errorHandler?: (error: Error) => void) {
    this.errorHandler = errorHandler;
  }

  handleError(error: Error): void {
    console.error('[FHEVM Error]:', error);

    if (this.errorHandler) {
      this.errorHandler(error);
    }
  }

  wrapAsync<T>(fn: () => Promise<T>): Promise<T> {
    return fn().catch((error) => {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    });
  }
}

/**
 * Create a React-compatible error handler
 * @param onError - Error callback function
 * @returns Error boundary instance
 */
export function createReactErrorHandler(
  onError?: (error: Error) => void
): FHEVMErrorBoundary {
  return new FHEVMErrorBoundary(onError);
}
