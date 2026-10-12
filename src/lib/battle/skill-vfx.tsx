import React from 'react';

export type SkillVfxType =
  | 'fire_burst'
  | 'fire_fang'
  | 'water_beam'
  | 'bubble_beam'
  | 'leaf_slash'
  | 'spore_blast'
  | 'thunder_strike'
  | 'spark_claw'
  | 'shadow_blast'
  | 'rock_smash'
  | 'ice_shatter'
  | 'wind_slash'
  | 'physical_slash'
  | 'barrier_block'
  | 'defense_harden';

export interface ActiveSkillVfx {
  moveId: string;
  moveName: string;
  type: SkillVfxType;
  elementType: string;
  target: 'player' | 'opponent';
}

/**
 * Resolves the visual animation type from a move ID and its element type
 */
export function resolveSkillVfxType(moveId: string, elementType?: string): SkillVfxType {
  const m = moveId.toLowerCase();

  // Specific move overrides
  if (m.includes('protect') || m.includes('barrier') || m.includes('shield')) return 'barrier_block';
  if (m.includes('armor') || m.includes('harden') || m.includes('defense')) return 'defense_harden';
  if (m.includes('fang') || m.includes('bite')) return 'fire_fang';
  if (m.includes('bubble')) return 'bubble_beam';
  if (m.includes('spore') || m.includes('powder')) return 'spore_blast';
  if (m.includes('claw') || m.includes('spark_claw')) return 'spark_claw';
  if (m.includes('thunder') || m.includes('lightning') || m.includes('bolt') || m.includes('jolt')) return 'thunder_strike';
  if (m.includes('leaf') || m.includes('whip') || m.includes('vine')) return 'leaf_slash';
  if (m.includes('ice') || m.includes('frost') || m.includes('blizzard')) return 'ice_shatter';
  if (m.includes('rock') || m.includes('stone') || m.includes('earth') || m.includes('mud')) return 'rock_smash';
  if (m.includes('shadow') || m.includes('night') || m.includes('dark') || m.includes('ghost') || m.includes('void')) return 'shadow_blast';
  if (m.includes('air') || m.includes('gust') || m.includes('wind') || m.includes('fly')) return 'wind_slash';

  // Fallback to element type
  switch (elementType?.toLowerCase()) {
    case 'fire':
      return 'fire_burst';
    case 'water':
      return 'water_beam';
    case 'grass':
      return 'leaf_slash';
    case 'electric':
      return 'thunder_strike';
    case 'ice':
      return 'ice_shatter';
    case 'rock':
    case 'ground':
    case 'steel':
      return 'rock_smash';
    case 'ghost':
    case 'dark':
    case 'psychic':
    case 'poison':
      return 'shadow_blast';
    case 'flying':
    case 'dragon':
    case 'fairy':
      return 'wind_slash';
    default:
      return 'physical_slash';
  }
}

/**
 * Visual Animation Component rendered directly on top of the attacked creature
 */
export function SkillVfxOverlay({ vfx }: { vfx: ActiveSkillVfx }) {
  const { type } = vfx;

  return (
    <div className={`vfx-container vfx-${type}`} aria-hidden="true">
      {/* 1. FIRE BURST (Exploding fireball with ember sparks) */}
      {type === 'fire_burst' && (
        <div className="vfx-anim fire-burst-anim">
          <div className="fire-core"></div>
          <div className="fire-ring"></div>
          <div className="ember e1"></div>
          <div className="ember e2"></div>
          <div className="ember e3"></div>
          <div className="ember e4"></div>
          <div className="ember e5"></div>
        </div>
      )}

      {/* 2. FIRE FANG (Fiery jaws clamping) */}
      {type === 'fire_fang' && (
        <div className="vfx-anim fire-fang-anim">
          <div className="jaw-top">
            <span>▲</span><span>▲</span><span>▲</span>
          </div>
          <div className="jaw-bottom">
            <span>▼</span><span>▼</span><span>▼</span>
          </div>
          <div className="flame-flash"></div>
        </div>
      )}

      {/* 3. WATER BEAM / TORRENT (Surging pressurized water jet) */}
      {type === 'water_beam' && (
        <div className="vfx-anim water-beam-anim">
          <div className="water-surge"></div>
          <div className="water-splash s1"></div>
          <div className="water-splash s2"></div>
          <div className="water-splash s3"></div>
          <div className="water-wave"></div>
        </div>
      )}

      {/* 4. BUBBLE BEAM (Rising vibrant foaming bubbles popping) */}
      {type === 'bubble_beam' && (
        <div className="vfx-anim bubble-beam-anim">
          <div className="bubble b1"></div>
          <div className="bubble b2"></div>
          <div className="bubble b3"></div>
          <div className="bubble b4"></div>
          <div className="bubble b5"></div>
          <div className="bubble b6"></div>
        </div>
      )}

      {/* 5. LEAF SLASH / VINE WHIP (Spinning razor leaves & slicing trails) */}
      {type === 'leaf_slash' && (
        <div className="vfx-anim leaf-slash-anim">
          <div className="leaf-slice-slash s-left"></div>
          <div className="leaf-slice-slash s-right"></div>
          <div className="leaf l1">🍃</div>
          <div className="leaf l2">🍃</div>
          <div className="leaf l3">🌿</div>
          <div className="leaf l4">🍃</div>
        </div>
      )}

      {/* 6. SPORE BLAST (Exploding pollen & floral sparkle cloud) */}
      {type === 'spore_blast' && (
        <div className="vfx-anim spore-blast-anim">
          <div className="spore-cloud"></div>
          <div className="spore-dot sp1">✦</div>
          <div className="spore-dot sp2">✦</div>
          <div className="spore-dot sp3">✦</div>
          <div className="spore-dot sp4">✦</div>
        </div>
      )}

      {/* 7. THUNDER STRIKE (Vertical lightning bolt & high voltage zap) */}
      {type === 'thunder_strike' && (
        <div className="vfx-anim thunder-strike-anim">
          <svg className="lightning-svg" viewBox="0 0 100 120" preserveAspectRatio="none">
            <polyline
              points="60,0 35,45 65,45 30,120 50,65 25,65 50,0"
              fill="#ffff00"
              stroke="#ffffff"
              strokeWidth="3"
            />
          </svg>
          <div className="elec-spark-flash"></div>
          <div className="spark-arc a1"></div>
          <div className="spark-arc a2"></div>
        </div>
      )}

      {/* 8. SPARK CLAW (High-voltage electric claws slicing) */}
      {type === 'spark_claw' && (
        <div className="vfx-anim spark-claw-anim">
          <div className="claw-slash c1"></div>
          <div className="claw-slash c2"></div>
          <div className="claw-slash c3"></div>
          <div className="zap-arc">⚡</div>
        </div>
      )}

      {/* 9. SHADOW BLAST (Dark matter vortex & ominous phantom skull/orb) */}
      {type === 'shadow_blast' && (
        <div className="vfx-anim shadow-blast-anim">
          <div className="shadow-vortex"></div>
          <div className="shadow-pulse"></div>
          <div className="shadow-wisp w1"></div>
          <div className="shadow-wisp w2"></div>
        </div>
      )}

      {/* 10. ROCK SMASH (Cragged boulders crashing down & rubble) */}
      {type === 'rock_smash' && (
        <div className="vfx-anim rock-smash-anim">
          <div className="boulder b-main"></div>
          <div className="boulder b-sub1"></div>
          <div className="boulder b-sub2"></div>
          <div className="dust-cloud"></div>
        </div>
      )}

      {/* 11. ICE SHATTER (Glacial spikes impaling & crystal glitter) */}
      {type === 'ice_shatter' && (
        <div className="vfx-anim ice-shatter-anim">
          <div className="ice-spike isp1"></div>
          <div className="ice-spike isp2"></div>
          <div className="ice-spike isp3"></div>
          <div className="ice-glitter gl1">❄</div>
          <div className="ice-glitter gl2">❄</div>
        </div>
      )}

      {/* 12. WIND SLASH (Gale blades whipping across target) */}
      {type === 'wind_slash' && (
        <div className="vfx-anim wind-slash-anim">
          <div className="wind-crescent w-c1"></div>
          <div className="wind-crescent w-c2"></div>
          <div className="wind-gust"></div>
        </div>
      )}

      {/* 13. PHYSICAL / NORMAL SLASH (Cross slashes & comic impact stars) */}
      {type === 'physical_slash' && (
        <div className="vfx-anim physical-slash-anim">
          <div className="impact-slash sl1"></div>
          <div className="impact-slash sl2"></div>
          <div className="impact-star star1">★</div>
          <div className="impact-star star2">✦</div>
        </div>
      )}

      {/* 14. BARRIER BLOCK (Hexagonal glowing barrier shield) */}
      {type === 'barrier_block' && (
        <div className="vfx-anim barrier-block-anim">
          <div className="hex-barrier">
            <span className="hex-inner">🛡️</span>
          </div>
          <span className="barrier-sparkle">✦ BLOCKED ✦</span>
        </div>
      )}

      {/* 15. DEFENSE HARDEN (Shield crest & metallic energy expanding) */}
      {type === 'defense_harden' && (
        <div className="vfx-anim defense-harden-anim">
          <div className="harden-crest">▲▲</div>
          <div className="harden-ring"></div>
        </div>
      )}
    </div>
  );
}
