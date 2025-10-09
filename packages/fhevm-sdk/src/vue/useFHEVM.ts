/**
 * Vue 3 Composables for FHEVM
 * Framework adapter for Vue applications
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import { FhevmInstance } from 'fhevmjs';
import { createFHEVMInstance, resetInstance } from '../core/fhevm';
import type { FHEVMConfig } from '../core/fhevm';

interface UseFHEVMReturn {
  instance: Ref<FhevmInstance | null>;
  isInitialized: ComputedRef<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  initialize: (config: FHEVMConfig) => Promise<void>;
  reset: () => void;
}

/**
 * Vue composable for FHEVM instance management
 */
export function useFHEVM(autoInit?: FHEVMConfig): UseFHEVMReturn {
  const instance = ref<FhevmInstance | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const isInitialized = computed(() => instance.value !== null);

  const initialize = async (config: FHEVMConfig) => {
    isLoading.value = true;
    error.value = null;

    try {
      const fhevmInstance = await createFHEVMInstance(config);
      instance.value = fhevmInstance;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to initialize FHEVM');
      error.value = errorObj;
      console.error('FHEVM initialization error:', errorObj);
    } finally {
      isLoading.value = false;
    }
  };

  const reset = () => {
    resetInstance();
    instance.value = null;
    error.value = null;
  };

  // Auto-initialize if config provided
  if (autoInit) {
    onMounted(() => {
      initialize(autoInit);
    });
  }

  // Cleanup on unmount
  onUnmounted(() => {
    // Optional cleanup
  });

  return {
    instance,
    isInitialized,
    isLoading,
    error,
    initialize,
    reset,
  };
}
