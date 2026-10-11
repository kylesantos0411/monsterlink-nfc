import { NfcHardwareSupport, NfcWriteOptions, NfcWriteResult, ResolvedCardData } from '@/types/nfc';
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
