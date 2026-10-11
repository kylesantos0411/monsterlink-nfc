'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseWebNfcOptions {
  onTagRead: (serialOrPayload: string) => void;
  onError?: (error: Error) => void;
}

export interface UseWebNfcResult {
  isSupported: boolean;
  isScanning: boolean;
  statusMessage: string;
  errorMessage: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
}

export function useWebNfc({ onTagRead, onError }: UseWebNfcOptions): UseWebNfcResult {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Checking NFC availability...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Check if window.NDEFReader exists in the browser environment
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setIsSupported(true);
      setStatusMessage('Web NFC is supported on this device. Tap "Start NFC Scan" to begin.');
    } else {
      setIsSupported(false);
      setStatusMessage('Web NFC is not supported in this browser. Use simulated card taps below.');
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const startScanning = useCallback(async () => {
    if (!isSupported) {
      setErrorMessage('Web NFC is not supported by your browser or platform.');
      return;
    }

    try {
      setErrorMessage(null);
      setStatusMessage('Requesting NFC permission...');

      const NDEFReaderClass = (window as any).NDEFReader;
      const ndef = new NDEFReaderClass();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      await ndef.scan({ signal: abortController.signal });

      setIsScanning(true);
      setStatusMessage('NFC active! Hold a physical NFC tag or MEZASTAR tag near the back of your phone...');

      ndef.addEventListener('reading', (event: any) => {
        let tagCode = '';

        // 1. Try reading tag serial number (UID)
        if (event.serialNumber) {
          tagCode = event.serialNumber.trim().toUpperCase();
        }

        // 2. Try parsing NDEF text records if available
        if (event.message && Array.isArray(event.message.records)) {
          for (const record of event.message.records) {
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              const textPayload = textDecoder.decode(record.data).trim();
              if (textPayload) {
                tagCode = textPayload;
                break;
              }
            }
          }
        }

        if (tagCode) {
          setStatusMessage(`Read tag: ${tagCode}`);
          onTagRead(tagCode);
        }
      });

      ndef.addEventListener('readingerror', () => {
        setErrorMessage('Cannot read tag. Ensure tag is positioned steadily and try again.');
        if (onError) onError(new Error('Tag read error'));
      });
    } catch (err: any) {
      setIsScanning(false);
      const msg = err.name === 'NotAllowedError'
        ? 'NFC permission denied by user.'
        : err.message || 'Failed to start NFC scan.';
      setErrorMessage(msg);
      setStatusMessage('Scan interrupted.');
      if (onError) onError(err);
    }
  }, [isSupported, onTagRead, onError]);

  const stopScanning = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsScanning(false);
    setStatusMessage('NFC scan paused.');
  }, []);

  return {
    isSupported,
    isScanning,
    statusMessage,
    errorMessage,
    startScanning,
    stopScanning,
  };
}
