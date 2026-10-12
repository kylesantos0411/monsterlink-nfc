import fs from 'fs';
import path from 'path';

export interface MonsterSpeciesRecord {
  pokedexNumber: number;          // Monster Number (1 to 50)
  name: string;                   // Lowercase name (e.g. 'flamby')
  displayName: string;            // Formatted name (e.g. 'Flamby')
  speciesId: string;              // Unique species ID (e.g. 'species_flamby')
  types: string[];                // Element type array (e.g. ['Fire'])
  primaryType: string;            // Primary type (e.g. 'Fire')
  height: number;                 // Decimetres
  weight: number;                 // Hectograms
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  abilities: string[];
  moves: string[];
  sprites: {
    frontDefault: string;
    frontShiny: string;
    officialArtwork: string;
  };
  genus: string;
  description: string;
  cardCode: string;               // Canonical NFC identifier (e.g. 'ML-0001')
}

const RAW_MONSTERS = [
  {
    num: 1, name: 'Flamby', type: 'Fire', genus: 'Flame Lizard',
    hp: 50, atk: 60, def: 45, spAtk: 65, spDef: 45, spd: 65,
    moves: ['Flame Burst', 'Fire Fang', 'Tackle', 'Ember'],
    abilities: ['Blaze', 'Flame Body'],
    desc: 'A fiery lizard with a vibrant burning tail. It releases bursts of sparks when energized.'
  },
  {
    num: 2, name: 'Aquat', type: 'Water', genus: 'Tidal Turtle',
    hp: 58, atk: 48, def: 65, spAtk: 50, spDef: 60, spd: 44,
    moves: ['Aqua Jet', 'Bubble Beam', 'Tackle', 'Shell Armor'],
    abilities: ['Torrent', 'Rain Dish'],
    desc: 'Carries a stream-carved shell that repels heavy waves. Loves basking on warm riverbanks.'
  },
  {
    num: 3, name: 'Leafy', type: 'Grass', genus: 'Sproutling',
    hp: 60, atk: 52, def: 55, spAtk: 54, spDef: 58, spd: 46,
    moves: ['Vine Whip', 'Spore Blast', 'Tackle', 'Razor Leaf'],
    abilities: ['Overgrow', 'Chlorophyll'],
    desc: 'Grows a sweet-smelling sprout atop its head that blooms into sunlight.'
  },
  {
    num: 4, name: 'Sparki', type: 'Electric', genus: 'Spark Mouse',
    hp: 45, atk: 55, def: 40, spAtk: 60, spDef: 50, spd: 90,
    moves: ['Spark Claw', 'Thunder Jolt', 'Quick Strike', 'Tackle'],
    abilities: ['Static', 'Lightning Rod'],
    desc: 'Stores electrical energy in cheek pouches and darts across terrain at dizzying speed.'
  },
  {
    num: 5, name: 'Shade', type: 'Ghost', genus: 'Shadow Sprite',
    hp: 40, atk: 45, def: 40, spAtk: 75, spDef: 50, spd: 80,
    moves: ['Shadow Sneak', 'Night Shade', 'Spook', 'Tackle'],
    abilities: ['Levitate', 'Infiltrator'],
    desc: 'Appears as a mischievous orb of purple shadows that floats silently through walls.'
  },
  {
    num: 6, name: 'Rocky', type: 'Rock', genus: 'Stone Golem',
    hp: 65, atk: 70, def: 85, spAtk: 30, spDef: 55, spd: 30,
    moves: ['Rock Throw', 'Stone Edge', 'Tackle', 'Harden'],
    abilities: ['Solid Rock', 'Sturdy'],
    desc: 'Formed from compacted river rocks. Its rugged exterior shrugs off direct impacts.'
  },
  {
    num: 7, name: 'Frosty', type: 'Ice', genus: 'Frost Pup',
    hp: 48, atk: 50, def: 45, spAtk: 62, spDef: 55, spd: 70,
    moves: ['Ice Shard', 'Frost Breath', 'Tackle', 'Quick Strike'],
    abilities: ['Snow Cloak', 'Slush Rush'],
    desc: 'A loyal arctic pup whose icy coat sparkles in the winter sun.'
  },
  {
    num: 8, name: 'Skyler', type: 'Flying', genus: 'Sky Fledgling',
    hp: 46, atk: 55, def: 42, spAtk: 45, spDef: 45, spd: 78,
    moves: ['Gust', 'Wing Attack', 'Quick Strike', 'Tackle'],
    abilities: ['Keen Eye', 'Early Bird'],
    desc: 'Spreads bright scarlet feathers to ride mountain upwinds without tiring.'
  },
  {
    num: 9, name: 'Bubble', type: 'Fairy', genus: 'Pink Axolotl',
    hp: 65, atk: 40, def: 50, spAtk: 65, spDef: 65, spd: 45,
    moves: ['Fairy Wind', 'Bubble Beam', 'Charm', 'Tackle'],
    abilities: ['Cute Charm', 'Unaware'],
    desc: 'A gentle amphibian that blows iridescent floating bubbles full of comforting essence.'
  },
  {
    num: 10, name: 'Magnix', type: 'Steel', genus: 'Magnetic Eye',
    hp: 45, atk: 40, def: 80, spAtk: 70, spDef: 60, spd: 45,
    moves: ['Flash Cannon', 'Magnet Bomb', 'Spark Claw', 'Tackle'],
    abilities: ['Magnet Pull', 'Sturdy'],
    desc: 'Hovering metallic sphere that detects magnetic poles and repels rival metals.'
  },
  {
    num: 11, name: 'Blazik', type: 'Fire', genus: 'Ember Drake',
    hp: 70, atk: 85, def: 65, spAtk: 90, spDef: 65, spd: 85,
    moves: ['Flame Burst', 'Fire Fang', 'Flamethrower', 'Dragon Breath'],
    abilities: ['Flash Fire', 'Blaze'],
    desc: 'A fierce bipedal drake enveloped in intense combustion flames.'
  },
  {
    num: 12, name: 'Tidely', type: 'Water', genus: 'Wave Cat',
    hp: 65, atk: 65, def: 60, spAtk: 80, spDef: 70, spd: 88,
    moves: ['Aqua Jet', 'Bubble Beam', 'Hydro Pump', 'Quick Strike'],
    abilities: ['Swift Swim', 'Water Veil'],
    desc: 'Dances effortlessly on ocean waves with fluid, feline agility.'
  },
  {
    num: 13, name: 'Vinelo', type: 'Grass', genus: 'Vine Serpent',
    hp: 68, atk: 72, def: 70, spAtk: 78, spDef: 75, spd: 75,
    moves: ['Vine Whip', 'Leaf Blade', 'Spore Blast', 'Coil'],
    abilities: ['Shed Skin', 'Overgrow'],
    desc: 'A serpentine forest wanderer that binds targets with living briar cords.'
  },
  {
    num: 14, name: 'Voltic', type: 'Electric', genus: 'Voltic Badger',
    hp: 65, atk: 82, def: 60, spAtk: 80, spDef: 60, spd: 92,
    moves: ['Spark Claw', 'Thunder Jolt', 'Wild Charge', 'Bite'],
    abilities: ['Motor Drive', 'Static'],
    desc: 'Channels underground electrical currents into devastating lightning rushes.'
  },
  {
    num: 15, name: 'Phantom', type: 'Ghost', genus: 'Night Wraith',
    hp: 60, atk: 65, def: 60, spAtk: 105, spDef: 75, spd: 100,
    moves: ['Shadow Sneak', 'Night Shade', 'Hex', 'Dark Pulse'],
    abilities: ['Cursed Body', 'Levitate'],
    desc: 'A menacing wraith that feeds on twilight mist and vanishes into darkness.'
  },
  {
    num: 16, name: 'Terra', type: 'Ground', genus: 'Armored Pangolin',
    hp: 80, atk: 85, def: 105, spAtk: 45, spDef: 70, spd: 55,
    moves: ['Earthquake', 'Dig', 'Rock Throw', 'Tackle'],
    abilities: ['Battle Armor', 'Sand Force'],
    desc: 'Rolls into an impenetrable tectonic sphere capable of carving ravines.'
  },
  {
    num: 17, name: 'Glacia', type: 'Ice', genus: 'Arctic Fox',
    hp: 65, atk: 60, def: 65, spAtk: 95, spDef: 90, spd: 85,
    moves: ['Ice Shard', 'Frost Breath', 'Blizzard', 'Quick Strike'],
    abilities: ['Snow Cloak', 'Ice Body'],
    desc: 'Prowls frozen tundras leaving behind a trail of pristine crystalline snowflakes.'
  },
  {
    num: 18, name: 'Zephyr', type: 'Flying', genus: 'Gale Raptor',
    hp: 72, atk: 85, def: 68, spAtk: 70, spDef: 65, spd: 102,
    moves: ['Gust', 'Air Slash', 'Wing Attack', 'Quick Strike'],
    abilities: ['Gale Wings', 'Keen Eye'],
    desc: 'Soars through storm currents and cuts the air with razor-sharp azure wings.'
  },
  {
    num: 19, name: 'Cotton', type: 'Fairy', genus: 'Cotton Lamb',
    hp: 85, atk: 50, def: 75, spAtk: 80, spDef: 90, spd: 60,
    moves: ['Fairy Wind', 'Dazzling Gleam', 'Charm', 'Tackle'],
    abilities: ['Fluffy', 'Cute Charm'],
    desc: 'Wrapped in cloud-like fleece that absorbs kinetic shocks and heals allies.'
  },
  {
    num: 20, name: 'Forge', type: 'Steel', genus: 'Molten Automaton',
    hp: 82, atk: 100, def: 110, spAtk: 60, spDef: 75, spd: 42,
    moves: ['Iron Head', 'Stone Edge', 'Flame Burst', 'Heavy Slam'],
    abilities: ['Heatproof', 'Sturdy'],
    desc: 'Constructed from primordial basalt and molten core ore, striking like an anvil.'
  },
  {
    num: 21, name: 'Lumi', type: 'Electric', genus: 'Light Hare',
    hp: 55, atk: 50, def: 50, spAtk: 85, spDef: 65, spd: 105,
    moves: ['Thunder Jolt', 'Spark Claw', 'Quick Strike', 'Agility'],
    abilities: ['Speed Boost', 'Run Away'],
    desc: 'An energetic creature glowing with bioluminescent sparks across its ears.'
  },
  {
    num: 22, name: 'Muddle', type: 'Ground', genus: 'Clay Brute',
    hp: 90, atk: 80, def: 85, spAtk: 50, spDef: 65, spd: 35,
    moves: ['Mud Slap', 'Earthquake', 'Rock Throw', 'Tackle'],
    abilities: ['Sand Veil', 'Water Absorb'],
    desc: 'Shaped from fertile river clay, absorbing concussive blows without injury.'
  },
  {
    num: 23, name: 'Searin', type: 'Fire', genus: 'Flame Hound',
    hp: 68, atk: 90, def: 60, spAtk: 75, spDef: 60, spd: 86,
    moves: ['Fire Fang', 'Flame Burst', 'Crunch', 'Tackle'],
    abilities: ['Intimidate', 'Flash Fire'],
    desc: 'A loyal canine surrounded by licking tongues of fire, baying at full moons.'
  },
  {
    num: 24, name: 'Surge', type: 'Electric', genus: 'Storm Wolf',
    hp: 75, atk: 92, def: 68, spAtk: 85, spDef: 70, spd: 98,
    moves: ['Thunder Jolt', 'Spark Claw', 'Quick Strike', 'Howl'],
    abilities: ['Volt Absorb', 'Static'],
    desc: 'Races ahead of thunderstorms, unleashing dazzling electrical howling.'
  },
  {
    num: 25, name: 'Bloomy', type: 'Grass', genus: 'Floral Dino',
    hp: 82, atk: 75, def: 80, spAtk: 88, spDef: 85, spd: 60,
    moves: ['Vine Whip', 'Spore Blast', 'Razor Leaf', 'Tackle'],
    abilities: ['Chlorophyll', 'Overgrow'],
    desc: 'A joyful quadruped with giant pink petals that bask in tropical daylight.'
  },
  {
    num: 26, name: 'Coralis', type: 'Water', genus: 'Reef Medusa',
    hp: 78, atk: 55, def: 82, spAtk: 96, spDef: 95, spd: 64,
    moves: ['Aqua Jet', 'Bubble Beam', 'Hydro Pump', 'Tackle'],
    abilities: ['Liquid Ooze', 'Rain Dish'],
    desc: 'A bioluminescent jellyfish floating above coral trenches with gentle grace.'
  },
  {
    num: 27, name: 'Howlie', type: 'Dark', genus: 'Shadow Lupine',
    hp: 70, atk: 88, def: 65, spAtk: 65, spDef: 60, spd: 88,
    moves: ['Bite', 'Dark Pulse', 'Quick Strike', 'Snarl'],
    abilities: ['Dark Aura', 'Infiltrator'],
    desc: 'Stalks moonlit ridges, hunting in coordinated packs beneath dark canopies.'
  },
  {
    num: 28, name: 'Pixie', type: 'Fairy', genus: 'Starlight Sprite',
    hp: 62, atk: 48, def: 58, spAtk: 92, spDef: 85, spd: 95,
    moves: ['Fairy Wind', 'Dazzling Gleam', 'Charm', 'Quick Strike'],
    abilities: ['Magic Guard', 'Cute Charm'],
    desc: 'Flutters on gossamer wings, leaving behind luminous trails of wishing stardust.'
  },
  {
    num: 29, name: 'Stonix', type: 'Rock', genus: 'Boulder Worm',
    hp: 75, atk: 85, def: 115, spAtk: 40, spDef: 65, spd: 40,
    moves: ['Rock Throw', 'Stone Edge', 'Earthquake', 'Tackle'],
    abilities: ['Sturdy', 'Solid Rock'],
    desc: 'A massive serpentine beast composed of interlocking granite boulders.'
  },
  {
    num: 30, name: 'Volcano', type: 'Fire', genus: 'Magma Beast',
    hp: 85, atk: 95, def: 90, spAtk: 95, spDef: 75, spd: 50,
    moves: ['Flame Burst', 'Fire Fang', 'Eruption', 'Earthquake'],
    abilities: ['Magma Armor', 'Flame Body'],
    desc: 'Houses a molten caldera on its back that periodically spews incandescent slag.'
  },
  {
    num: 31, name: 'Aquilo', type: 'Ice', genus: 'Glacier Stag',
    hp: 88, atk: 82, def: 80, spAtk: 94, spDef: 88, spd: 84,
    moves: ['Ice Shard', 'Frost Breath', 'Blizzard', 'Tackle'],
    abilities: ['Ice Body', 'Snow Cloak'],
    desc: 'Noble mountain stag bearing frosted antlers of pure crystalline ice.'
  },
  {
    num: 32, name: 'Thunder', type: 'Electric', genus: 'Lightning Beast',
    hp: 80, atk: 102, def: 72, spAtk: 98, spDef: 70, spd: 104,
    moves: ['Thunder Jolt', 'Spark Claw', 'Wild Charge', 'Quick Strike'],
    abilities: ['Lightning Rod', 'Static'],
    desc: 'An avatar of storm electricity whose stride generates thunderous sonic booms.'
  },
  {
    num: 33, name: 'Lurk', type: 'Dark', genus: 'Abyssal Feline',
    hp: 68, atk: 94, def: 62, spAtk: 72, spDef: 64, spd: 98,
    moves: ['Bite', 'Dark Pulse', 'Shadow Sneak', 'Quick Strike'],
    abilities: ['Infiltrator', 'Keen Eye'],
    desc: 'Slinks soundlessly through midnight shadows, eyes glowing with piercing violet.'
  },
  {
    num: 34, name: 'Petal', type: 'Fairy', genus: 'Blossom Fox',
    hp: 74, atk: 65, def: 70, spAtk: 96, spDef: 92, spd: 85,
    moves: ['Fairy Wind', 'Dazzling Gleam', 'Vine Whip', 'Charm'],
    abilities: ['Serene Grace', 'Cute Charm'],
    desc: 'Groomed with fresh cherry blossoms, bringing prosperity to wildflower valleys.'
  },
  {
    num: 35, name: 'Crowl', type: 'Flying', genus: 'Raven Warden',
    hp: 76, atk: 86, def: 74, spAtk: 78, spDef: 70, spd: 90,
    moves: ['Gust', 'Air Slash', 'Bite', 'Quick Strike'],
    abilities: ['Super Luck', 'Keen Eye'],
    desc: 'A watchful corvid that scouts terrain from the clouds with tactical intellect.'
  },
  {
    num: 36, name: 'Boltie', type: 'Electric', genus: 'Zap Rodent',
    hp: 60, atk: 78, def: 58, spAtk: 82, spDef: 60, spd: 108,
    moves: ['Spark Claw', 'Thunder Jolt', 'Quick Strike', 'Tackle'],
    abilities: ['Motor Drive', 'Static'],
    desc: 'Zips between tree trunks like a golden streak of living electrostatic charge.'
  },
  {
    num: 37, name: 'Shelly', type: 'Water', genus: 'Coral Tortoise',
    hp: 85, atk: 65, def: 105, spAtk: 75, spDef: 95, spd: 40,
    moves: ['Aqua Jet', 'Bubble Beam', 'Tackle', 'Shell Armor'],
    abilities: ['Shell Armor', 'Torrent'],
    desc: 'Nurtures miniature coral ecosystems upon its durable nautical carapace.'
  },
  {
    num: 38, name: 'Rooter', type: 'Grass', genus: 'Ancient Treant',
    hp: 96, atk: 94, def: 98, spAtk: 68, spDef: 86, spd: 42,
    moves: ['Vine Whip', 'Spore Blast', 'Earthquake', 'Tackle'],
    abilities: ['Natural Cure', 'Overgrow'],
    desc: 'Ancient protector of forest groves, towering with massive oak branches.'
  },
  {
    num: 39, name: 'Drizzy', type: 'Water', genus: 'Rain Drake',
    hp: 82, atk: 84, def: 78, spAtk: 92, spDef: 80, spd: 86,
    moves: ['Aqua Jet', 'Bubble Beam', 'Hydro Pump', 'Quick Strike'],
    abilities: ['Drizzle', 'Swift Swim'],
    desc: 'Summons gentle refreshing showers wherever it glides over dry lands.'
  },
  {
    num: 40, name: 'Sandy', type: 'Ground', genus: 'Dune Crawler',
    hp: 88, atk: 92, def: 100, spAtk: 50, spDef: 78, spd: 54,
    moves: ['Earthquake', 'Mud Slap', 'Rock Throw', 'Tackle'],
    abilities: ['Sand Force', 'Sand Veil'],
    desc: 'Submerges beneath desert dunes, erupting beneath unsuspecting adversaries.'
  },
  {
    num: 41, name: 'Lumber', type: 'Grass', genus: 'Timber Guardian',
    hp: 100, atk: 105, def: 102, spAtk: 65, spDef: 88, spd: 48,
    moves: ['Vine Whip', 'Spore Blast', 'Wood Hammer', 'Earthquake'],
    abilities: ['Thick Fat', 'Natural Cure'],
    desc: 'Mighty colossus carved of ancient ironwood, warding off encroaching storms.'
  },
  {
    num: 42, name: 'Jett', type: 'Dragon', genus: 'Skyborne Wyvern',
    hp: 90, atk: 110, def: 82, spAtk: 105, spDef: 85, spd: 108,
    moves: ['Dragon Claw', 'Dragon Breath', 'Air Slash', 'Flame Burst'],
    abilities: ['Dragon Maw', 'Intimidate'],
    desc: 'Apex skyborne wyvern cutting supersonic trails with crimson wing vanes.'
  },
  {
    num: 43, name: 'Void', type: 'Ghost', genus: 'Nebula Specter',
    hp: 72, atk: 70, def: 72, spAtk: 115, spDef: 98, spd: 102,
    moves: ['Shadow Sneak', 'Night Shade', 'Dark Pulse', 'Hex'],
    abilities: ['Levitate', 'Infiltrator'],
    desc: 'Born from interdimensional voids, bending spacetime and spectral light.'
  },
  {
    num: 44, name: 'Chill', type: 'Ice', genus: 'Glacier Penguin',
    hp: 92, atk: 76, def: 88, spAtk: 98, spDef: 92, spd: 65,
    moves: ['Ice Shard', 'Frost Breath', 'Blizzard', 'Bubble Beam'],
    abilities: ['Slush Rush', 'Ice Body'],
    desc: 'Glides across sea ice with joyful momentum, unfazed by sub-zero blizzards.'
  },
  {
    num: 45, name: 'Fang', type: 'Dark', genus: 'Dusk Stalker',
    hp: 78, atk: 106, def: 74, spAtk: 70, spDef: 70, spd: 100,
    moves: ['Bite', 'Dark Pulse', 'Fire Fang', 'Quick Strike'],
    abilities: ['Moxie', 'Strong Jaw'],
    desc: 'Fierce dusk predator boasting obsidian fangs that crush titanium armor.'
  },
  {
    num: 46, name: 'Solar', type: 'Fire', genus: 'Sun Sovereign',
    hp: 88, atk: 96, def: 82, spAtk: 114, spDef: 90, spd: 92,
    moves: ['Flame Burst', 'Fire Fang', 'Flamethrower', 'Solar Beam'],
    abilities: ['Drought', 'Flash Fire'],
    desc: 'Radiates solar flare energy crowned in blazing coronal coronal rays.'
  },
  {
    num: 47, name: 'Aero', type: 'Flying', genus: 'Zephyr Swallow',
    hp: 75, atk: 80, def: 70, spAtk: 95, spDef: 78, spd: 112,
    moves: ['Gust', 'Air Slash', 'Quick Strike', 'Roost'],
    abilities: ['Aerilate', 'Gale Wings'],
    desc: 'Rides troposphere jetstreams, circling the globe with buoyant grace.'
  },
  {
    num: 48, name: 'Crysta', type: 'Rock', genus: 'Gemstone Behemoth',
    hp: 95, atk: 102, def: 120, spAtk: 68, spDef: 90, spd: 45,
    moves: ['Rock Throw', 'Stone Edge', 'Earthquake', 'Flash Cannon'],
    abilities: ['Clear Body', 'Solid Rock'],
    desc: 'Encased in brilliant amethyst geodes that refract radiant crystal barriers.'
  },
  {
    num: 49, name: 'Venom', type: 'Poison', genus: 'Toxic Ogre',
    hp: 98, atk: 108, def: 94, spAtk: 72, spDef: 82, spd: 56,
    moves: ['Poison Sting', 'Sludge Wave', 'Earthquake', 'Tackle'],
    abilities: ['Poison Touch', 'Liquid Ooze'],
    desc: 'Towering purple titan secreting caustic toxins from its heavy gauntlets.'
  },
  {
    num: 50, name: 'Orbit', type: 'Steel', genus: 'Cosmic Core',
    hp: 85, atk: 80, def: 110, spAtk: 110, spDef: 105, spd: 80,
    moves: ['Flash Cannon', 'Magnet Bomb', 'Spark Claw', 'Cosmic Power'],
    abilities: ['Levitate', 'Magnet Pull'],
    desc: 'A celestial gyroscope orbiting a single observant core of cosmic matter.'
  }
];

function generate() {
  const monsters: MonsterSpeciesRecord[] = RAW_MONSTERS.map(m => {
    const padded = String(m.num).padStart(3, '0');
    const slug = m.name.toLowerCase();
    const cardCode = `ML-${String(m.num).padStart(4, '0')}`;
    const spriteUrl = `/monsters/monster_${padded}.png`;

    return {
      pokedexNumber: m.num,
      name: slug,
      displayName: m.name,
      speciesId: `species_${slug}`,
      types: [m.type],
      primaryType: m.type,
      height: Math.round(5 + m.num * 0.3),
      weight: Math.round(40 + m.num * 4),
      baseStats: {
        hp: m.hp,
        attack: m.atk,
        defense: m.def,
        specialAttack: m.spAtk,
        specialDefense: m.spDef,
        speed: m.spd
      },
      abilities: m.abilities,
      moves: m.moves,
      sprites: {
        frontDefault: spriteUrl,
        frontShiny: spriteUrl,
        officialArtwork: spriteUrl
      },
      genus: `${m.genus} Monster`,
      description: m.desc,
      cardCode: cardCode
    };
  });

  const manifest = {
    version: '0.5.0',
    source: 'MONSTERLINK Original 50 Creatures Database',
    importedAt: new Date().toISOString(),
    totalCount: monsters.length,
    pokemon: monsters // Key name matches PokemonDatabaseManifest schema for seamless drop-in
  };

  const dbDir = path.resolve('src/lib/data');
  const targetPath1 = path.join(dbDir, 'monster-database.json');
  const targetPath2 = path.join(dbDir, 'pokemon-database.json');

  fs.writeFileSync(targetPath1, JSON.stringify(manifest, null, 2), 'utf-8');
  fs.writeFileSync(targetPath2, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`Successfully generated ${monsters.length} monsters into:`);
  console.log(`- ${targetPath1}`);
  console.log(`- ${targetPath2}`);
}

generate();
