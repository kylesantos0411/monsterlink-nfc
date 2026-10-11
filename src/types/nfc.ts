export interface CardRegistryEntry {
  cardCode: string;
  speciesId: string;
  name: string;
  rarity: string;
  source: string;
  grade?: string; // MEZASTAR Star Grade (e.g., 2-Star, 3-Star, 4-Star, 5-Star, 6-Star Superstar)
}

export interface ScanAttemptLog {
  id: string;
  timestamp: string;
  cardCode: string;
  result: 'Registered' | 'Duplicate' | 'Invalid Format' | 'Unknown Code';
  type: 'success' | 'duplicate' | 'error';
  creatureName?: string;
}

export interface RegisteredCardMap {
  [cardCode: string]: {
    instanceId: string;
    registeredAt: string;
  };
}
