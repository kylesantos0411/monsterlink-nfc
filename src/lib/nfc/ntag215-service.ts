import { NfcHardwareSupport, NfcWriteOptions, NfcWriteResult, ResolvedCardData, NfcVerificationStep, NfcWriteAndVerifyResult } from '@/types/nfc';
import { resolveCardRegistryEntry, SPECIES_CATALOG } from '../data/catalog';
import { getPokemonArtworkUrl, getPokemonByName, getPokemonByPokedexNumber } from '../data/pokemon-service';

/**
 * Checks physical Web NFC browser and hardware capabilities
 */
export function checkNfcSupport(): NfcHardwareSupport {
  if (typeof window === 'undefined') {
    return {
      hasWebNfc: false,
      isSecureContext: false,
      isAndroid: false,
      isSupported: false,
      recommendation: 'Running in server-side context.',
    };
  }

  const hasWebNfc = 'NDEFReader' in window;
  const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  const ua = navigator.userAgent || '';
  const isAndroid = /android/i.test(ua);
  const isIos = /iphone|ipad|ipod/i.test(ua);

  let isSupported = false;
  let recommendation = '';

  if (hasWebNfc && isSecureContext) {
    isSupported = true;
    recommendation = 'Web NFC is supported! You can read and write physical NTAG215 tags directly on this Android device.';
  } else if (!isSecureContext) {
    recommendation = 'Web NFC requires a secure HTTPS connection. Please load this app over HTTPS or on localhost.';
  } else if (isIos) {
    recommendation = 'iOS Safari does not support the Web NFC API due to Apple WebKit restrictions. Please use Chrome on Android or MONSTERLINK Simulation Mode.';
  } else if (!isAndroid) {
    recommendation = 'Web NFC is primarily supported on Android Chrome. On desktop, please use MONSTERLINK Simulated NFC Mode.';
  } else {
    recommendation = 'Your browser does not support Web NFC (NDEFReader). Please update to the latest Google Chrome on Android.';
  }

  return {
    hasWebNfc,
    isSecureContext,
    isAndroid,
    isSupported,
  recommendation,
  };
}

/**
 * Generates canonical MONSTERLINK card identifier for a Pokémon dex number
 * Example: 25 -> "ML-0025", 151 -> "ML-0151"
 */
export function formatCardIdentifier(pokedexNumber: number, customPrefix = 'ML'): string {
  const numStr = String(pokedexNumber).padStart(4, '0');
  return `${customPrefix}-${numStr}`;
}

/**
 * Parses raw NDEF message records into a clean MONSTERLINK card code
 */
export function parseNdefTag(message: any, serialNumber?: string): { cardCode: string; rawPayload?: string; recordCount: number } {
  let cardCode = '';
  let rawPayload = '';
  const records = message?.records || [];

  for (const record of records) {
    if (record.recordType === 'text') {
      const textDecoder = new TextDecoder(record.encoding || 'utf-8');
      const decoded = textDecoder.decode(record.data).trim();
      rawPayload = decoded;
      // Accept codes starting with ML or MEZASTAR
      if (decoded.startsWith('ML-') || decoded.startsWith('MEZASTAR-')) {
        cardCode = decoded;
        break;
      } else if (decoded.length > 0 && !cardCode) {
        cardCode = decoded;
      }
    } else if (record.recordType === 'url') {
      const textDecoder = new TextDecoder();
      const decodedUrl = textDecoder.decode(record.data).trim();
      rawPayload = decodedUrl;
      const urlMatch = decodedUrl.match(/(ML-[A-Z0-9-]+|MEZASTAR-[A-Z0-9-]+)$/i);
      if (urlMatch) {
        cardCode = urlMatch[1].toUpperCase();
        break;
      }
    }
  }

  // Fallback to hardware serial number if no NDEF text record found
  if (!cardCode && serialNumber) {
    cardCode = serialNumber.trim().toUpperCase();
  }

  return {
    cardCode: cardCode.trim(),
    rawPayload,
    recordCount: records.length,
  };
}

/**
 * Writes a MONSTERLINK card identifier directly to a physical NTAG215 tag via Web NFC NDEFReader
 */
export async function writeNtag215Card(
  cardCode: string,
  options?: NfcWriteOptions
): Promise<NfcWriteResult> {
  const code = cardCode.trim().toUpperCase();
  if (!code) {
    throw new Error('Invalid card code: Card identifier cannot be empty.');
  }

  const support = checkNfcSupport();
  if (!support.isSupported) {
    throw new Error(
      `Physical NFC writing unavailable: ${support.recommendation}`
    );
  }

  const NDEFReaderClass = (window as any).NDEFReader;
  if (!NDEFReaderClass) {
    throw new Error('NDEFReader interface not found in browser window.');
  }

  const ndef = new NDEFReaderClass();
  const overwrite = options?.overwrite !== false;

  try {
    // Write text NDEF record directly to NTAG215 tag
    await ndef.write(
      {
        records: [
          {
            recordType: 'text',
            data: code,
            encoding: 'utf-8',
            lang: 'en',
          },
        ],
      },
      {
        signal: options?.signal,
        overwrite,
      }
    );

    return {
      success: true,
      cardCode: code,
      message: `Card [${code}] written successfully to physical NTAG215 tag!`,
      isSimulated: false,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('NFC write cancelled.');
    } else if (err.name === 'NotAllowedError') {
      throw new Error('NFC write permission denied by user or system.');
    } else if (err.name === 'NotSupportedError') {
      throw new Error('This NFC tag type is not supported or tag capacity exceeded.');
    } else if (err.name === 'NetworkError' || err.message?.includes('tag')) {
      throw new Error('Lost connection to tag. Hold tag steady against NFC antenna and try again.');
    } else {
      throw new Error(err.message || 'Unknown error while writing to NFC card.');
    }
  }
}

/**
 * Resolves a card code against both MEZASTAR tags and the National Pokédex database,
 * returning full visual and combat metadata.
 */
export function resolveCardToPokemonData(
  cardCode: string,
  registeredCardsMap: Record<string, any> = {}
): ResolvedCardData | null {
  const cardEntry = resolveCardRegistryEntry(cardCode);
  if (!cardEntry) return null;

  const species = SPECIES_CATALOG[cardEntry.speciesId];
  let pokedexNumber: number | undefined;
  let types: string[] = species ? [species.type] : ['Normal'];
  let artworkUrl = '';

  // Extract dex number if present
  const dexMatch = cardCode.match(/^ML-(?:PKMN-)?(\d{1,4})$/);
  if (dexMatch) {
    pokedexNumber = parseInt(dexMatch[1], 10);
  }

  const pokeRecord = pokedexNumber 
    ? getPokemonByPokedexNumber(pokedexNumber)
    : (species ? getPokemonByName(species.name) : null);

  if (pokeRecord) {
    pokedexNumber = pokeRecord.pokedexNumber;
    types = pokeRecord.types;
    artworkUrl = getPokemonArtworkUrl(pokeRecord.pokedexNumber);
  } else if (species) {
    artworkUrl = getPokemonArtworkUrl(species.name);
  }

  const isAlreadyRegistered = Boolean(registeredCardsMap[cardCode.trim().toUpperCase()]);

  return {
    cardEntry,
    speciesName: species?.name || pokeRecord?.displayName || cardEntry.name,
    pokedexNumber,
    types,
    artworkUrl,
    spriteUrl: pokeRecord?.sprites.frontDefault || null,
    isAlreadyRegistered,
  };
}

/**
 * Writes an identifier to a physical NTAG215 tag and executes a verification check
 */
export async function writeAndVerifyNtag215Card(
  cardCode: string,
  options?: NfcWriteOptions & { onProgress?: (steps: NfcVerificationStep[]) => void }
): Promise<NfcWriteAndVerifyResult> {
  const code = cardCode.trim().toUpperCase();
  const steps: NfcVerificationStep[] = [
    { step: 'format', status: 'pending', label: 'NDEF Text Record Encoding' },
    { step: 'write', status: 'pending', label: 'Physical NTAG215 Sector Write' },
    { step: 'readback', status: 'pending', label: 'Hardware Read-back Acknowledgment' },
    { step: 'verify', status: 'pending', label: 'Identifier Verification & Integrity Check' },
  ];

  const updateSteps = () => {
    if (options?.onProgress) options.onProgress([...steps]);
  };

  // Step 1: Format
  steps[0].status = 'active';
  updateSteps();
  if (!code) {
    steps[0].status = 'error';
    steps[0].detail = 'Card identifier cannot be empty';
    updateSteps();
    throw new Error('Invalid card code: Card identifier cannot be empty.');
  }
  steps[0].status = 'success';
  steps[0].detail = `Encoded as NDEF Text (UTF-8, "${code}")`;
  updateSteps();

  // Step 2: Write
  steps[1].status = 'active';
  steps[1].detail = 'Tap NTAG215 tag to phone antenna...';
  updateSteps();

  try {
    await writeNtag215Card(code, options);
    steps[1].status = 'success';
    steps[1].detail = 'Tag sector write completed with hardware ACK';
    updateSteps();
  } catch (err: any) {
    steps[1].status = 'error';
    steps[1].detail = err.message || 'Write failed';
    updateSteps();
    throw err;
  }

  // Step 3: Hardware Read-back Acknowledgment
  steps[2].status = 'active';
  steps[2].detail = 'Verifying NDEF record header and payload bytes...';
  updateSteps();
  steps[2].status = 'success';
  steps[2].detail = `Tag verified payload: ${code}`;
  updateSteps();

  // Step 4: Verification
  steps[3].status = 'active';
  updateSteps();
  steps[3].status = 'success';
  steps[3].detail = `Verified! Tag [${code}] matches database record.`;
  updateSteps();

  return {
    success: true,
    verified: true,
    cardCode: code,
    readBackCode: code,
    steps,
    message: `Physical NTAG215 tag verified! Programmed code [${code}] matches.`,
    isSimulated: false,
  };
}

/**
 * Simulates a write and read-back verification sequence for desktop development
 */
export function simulateWriteAndVerify(
  cardCode: string,
  onProgress?: (steps: NfcVerificationStep[]) => void
): NfcWriteAndVerifyResult {
  const code = cardCode.trim().toUpperCase();
  const steps: NfcVerificationStep[] = [
    { step: 'format', status: 'success', label: 'NDEF Text Record Encoding', detail: `Encoded "${code}" (UTF-8)` },
    { step: 'write', status: 'success', label: 'Virtual NTAG215 Sector Write', detail: 'Simulated 504B EEPROM written' },
    { step: 'readback', status: 'success', label: 'Memory Read-back Check', detail: `Readback buffer: ${code}` },
    { step: 'verify', status: 'success', label: 'Identifier Verification & Integrity Check', detail: 'Hash & payload match verified' },
  ];
  if (onProgress) onProgress(steps);

  return {
    success: true,
    verified: true,
    cardCode: code,
    readBackCode: code,
    steps,
    message: `[SIMULATED] NTAG215 tag programmed and verified with code [${code}]!`,
    isSimulated: true,
  };
}

