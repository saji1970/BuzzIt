import React, { useState, useCallback, useRef } from 'react';
import { Result, success, failure } from '../utils/Result';
import ApiService from '../services/APIService';
import { BuzzLivePublisherHandle } from '../components/Buzzlive/BuzzLivePublisher';

export interface StreamEndOptions {
  streamId: string;
  publisherRef: React.RefObject<BuzzLivePublisherHandle>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface StreamManagerState {
  isEnding: boolean;
  error: Error | null;
}

/**
 * Custom hook for managing stream lifecycle operations
 * Provides centralized, production-ready stream management
 */
export const useStreamManager = () => {
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isEndingRef = useRef(false);

  /**
   * Ends a live stream with proper cleanup order:
   * 1. Stop publishing (local cleanup)
   * 2. End stream on backend
   * 3. Call success callback
   * 4. Handle errors gracefully
   */
  const endStream = useCallback(
    async (options: StreamEndOptions): Promise<Result<void, Error>> => {
      const { streamId, publisherRef, onSuccess, onError } = options;

      // Prevent multiple simultaneous end operations
      if (isEndingRef.current) {
        return failure(new Error('Stream end operation already in progress'));
      }

      isEndingRef.current = true;
      setIsEnding(true);
      setError(null);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        // Step 1: Stop publishing (local cleanup first)
        if (publisherRef.current) {
          try {
            await publisherRef.current.stop();
            console.log('[StreamManager] Publishing stopped successfully');
          } catch (stopError: any) {
            console.error('[StreamManager] Error stopping publisher:', stopError);
            // Continue with backend cleanup even if local stop fails
            // This ensures backend state is updated
          }
        }

        // Step 2: End stream on backend
        const apiResponse = await ApiService.endLiveStream(streamId);

        if (!apiResponse.success) {
          const error = new Error(
            apiResponse.error || 'Failed to end stream on server'
          );
          console.error('[StreamManager] Backend error:', error);
          setError(error);
          onError?.(error);
          return failure(error);
        }

        // Step 3: Success - call callback
        console.log('[StreamManager] Stream ended successfully on backend');
        onSuccess?.();
        return success(undefined);
      } catch (err: any) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('[StreamManager] Error ending stream:', error);
        setError(error);
        onError?.(error);
        return failure(error);
      } finally {
        isEndingRef.current = false;
        setIsEnding(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  /**
   * Resets the stream manager state
   */
  const reset = useCallback(() => {
    isEndingRef.current = false;
    setIsEnding(false);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    endStream,
    isEnding,
    error,
    reset,
  };
};
