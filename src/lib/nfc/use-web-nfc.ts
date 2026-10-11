'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { NfcHardwareSupport, NfcWriteResult, NfcWriteOptions } from '@/types/nfc';
import { checkNfcSupport, parseNdefTag, writeNtag215Card } from './ntag215-service';

export interface UseWebNfcOptions {
  onTagRead?: (serialOrPayload: string) => void;
  onError?: (error: Error) => void;
}

export interface UseWebNfcResult {
  isSupported: boolean;
  isScanning: boolean;
  isWriting: boolean;
  hardwareSupport: NfcHardwareSupport;
  statusMessage: string;
  errorMessage: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  writeCard: (cardCode: string, options?: NfcWriteOptions) => Promise<NfcWriteResult>;
  cancelWrite: () => void;
}

export function useWebNfc({ onTagRead, onError }: UseWebNfcOptions = {}): UseWebNfcResult {
  const [hardwareSupport, setHardwareSupport] = useState<NfcHardwareSupport>({
    hasWebNfc: false,
    isSecureContext: false,
    isAndroid: false,
    isSupported: false,
    recommendation: 'Detecting NFC...',
  });
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Checking NFC availability...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scanAbortRef = useRef<AbortController | null>(null);
  const writeAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const support = checkNfcSupport();
    setHardwareSupport(support);

    if (support.isSupported) {
      setStatusMessage('Web NFC ready. Hold an NTAG215 tag to scan or program.');
    } else {
      setStatusMessage(support.recommendation);
    }

    return () => {
      if (scanAbortRef.current) {
        scanAbortRef.current.abort();
      }
      if (writeAbortRef.current) {
        writeAbortRef.current.abort();
      }
    };
  }, []);

  const startScanning = useCallback(async () => {
    if (!hardwareSupport.isSupported) {
      setErrorMessage(hardwareSupport.recommendation);
      return;
    }

    try {
      setErrorMessage(null);
      setStatusMessage('Requesting NFC permission...');

      const NDEFReaderClass = (window as any).NDEFReader;
      const ndef = new NDEFReaderClass();
      const abortController = new AbortController();
      scanAbortRef.current = abortController;

      await ndef.scan({ signal: abortController.signal });

      setIsScanning(true);
      setStatusMessage('NFC Active! Hold your NTAG215 tag near the back of your phone...');

      ndef.addEventListener('reading', (event: any) => {
        const parsed = parseNdefTag(event.message, event.serialNumber);
        if (parsed.cardCode) {
          setStatusMessage(`Read tag: ${parsed.cardCode}`);
          if (onTagRead) onTagRead(parsed.cardCode);
        } else {
          setErrorMessage('Empty tag detected. No MONSTERLINK identifier found on tag.');
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
  }, [hardwareSupport.isSupported, hardwareSupport.recommendation, onTagRead, onError]);

  const stopScanning = useCallback(() => {
    if (scanAbortRef.current) {
      scanAbortRef.current.abort();
      scanAbortRef.current = null;
    }
    setIsScanning(false);
    setStatusMessage('NFC scan paused.');
  }, []);

  const writeCard = useCallback(
    async (cardCode: string, options?: NfcWriteOptions): Promise<NfcWriteResult> => {
      const code = cardCode.trim().toUpperCase();
      if (!code) {
        throw new Error('Please select or specify a card code before writing.');
      }

      if (!hardwareSupport.isSupported) {
        throw new Error(`Cannot write physical tag: ${hardwareSupport.recommendation}`);
      }

      // If already scanning, temporarily pause scan to allow write
      const wasScanning = isScanning;
      if (wasScanning) {
        stopScanning();
      }

      setIsWriting(true);
      setErrorMessage(null);
      setStatusMessage(`Ready to write [${code}]. TAP NTAG215 TAG TO PHONE NOW...`);

      const abortController = new AbortController();
      writeAbortRef.current = abortController;

      try {
        const result = await writeNtag215Card(code, {
          ...options,
          signal: abortController.signal,
        });

        setIsWriting(false);
        setStatusMessage(`Successfully wrote [${code}] to physical NTAG215 tag!`);
        writeAbortRef.current = null;

        // Resume scan if was scanning before
        if (wasScanning) {
          startScanning();
        }

        return result;
      } catch (err: any) {
        setIsWriting(false);
        writeAbortRef.current = null;
        setErrorMessage(err.message || 'Failed to write to NFC tag.');
        setStatusMessage('Write operation failed.');

        if (wasScanning) {
          startScanning();
        }

        throw err;
      }
    },
    [hardwareSupport.isSupported, hardwareSupport.recommendation, isScanning, startScanning, stopScanning]
  );

  const cancelWrite = useCallback(() => {
    if (writeAbortRef.current) {
      writeAbortRef.current.abort();
      writeAbortRef.current = null;
    }
    setIsWriting(false);
    setStatusMessage('NFC write cancelled.');
  }, []);

  return {
    isSupported: hardwareSupport.isSupported,
    isScanning,
    isWriting,
    hardwareSupport,
    statusMessage,
    errorMessage,
    startScanning,
    stopScanning,
    writeCard,
    cancelWrite,
  };
}
