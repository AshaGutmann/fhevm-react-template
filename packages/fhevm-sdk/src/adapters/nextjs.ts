/**
 * Next.js framework adapter
 * Provides Next.js-specific utilities and server-side support
 */

import { createFHEVMInstance, type FHEVMConfig } from '../core/fhevm';
import type { FhevmInstance } from 'fhevmjs';

/**
 * Next.js adapter configuration
 */
export interface NextJSAdapterConfig extends FHEVMConfig {
  serverSide?: boolean;
  apiEndpoint?: string;
}

/**
 * Initialize FHEVM for Next.js applications
 * Handles both client-side and server-side initialization
 * @param config - Next.js adapter configuration
 * @returns FHEVM instance
 */
export async function initNextJSFHEVM(config: NextJSAdapterConfig): Promise<FhevmInstance> {
  // Check if running on server or client
  const isServer = typeof window === 'undefined';

  if (isServer && !config.serverSide) {
    throw new Error('FHEVM cannot be initialized on server without serverSide flag');
  }

  try {
    const instance = await createFHEVMInstance(config);
    return instance;
  } catch (error) {
    console.error('Failed to initialize FHEVM for Next.js:', error);
    throw error;
  }
}

/**
 * Check if code is running on server side
 * @returns True if running on server
 */
export function isServerSide(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if code is running on client side
 * @returns True if running on client
 */
export function isClientSide(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Next.js API route helper for FHE operations
 */
export class NextJSAPIHelper {
  private apiEndpoint: string;

  constructor(apiEndpoint: string = '/api/fhe') {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Call encryption API endpoint
   */
  async encrypt(value: number | bigint | boolean, type: string): Promise<any> {
    const response = await fetch(`${this.apiEndpoint}/encrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, type }),
    });

    if (!response.ok) {
      throw new Error(`Encryption API failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Call decryption API endpoint
   */
  async decrypt(contractAddress: string, ciphertext: string): Promise<any> {
    const response = await fetch(`${this.apiEndpoint}/decrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractAddress, ciphertext }),
    });

    if (!response.ok) {
      throw new Error(`Decryption API failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Call computation API endpoint
   */
  async compute(operation: string, operands: any[]): Promise<any> {
    const response = await fetch(`${this.apiEndpoint}/compute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation, operands }),
    });

    if (!response.ok) {
      throw new Error(`Computation API failed: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Create API helper for Next.js applications
 * @param apiEndpoint - Custom API endpoint (default: /api/fhe)
 * @returns API helper instance
 */
export function createNextJSAPIHelper(apiEndpoint?: string): NextJSAPIHelper {
  return new NextJSAPIHelper(apiEndpoint);
}
