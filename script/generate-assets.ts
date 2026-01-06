import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import random from 'random';
import { uniqueNamesGenerator } from 'unique-names-generator';
import { z } from 'zod';

// Horror-themed dictionaries for seed generation (from Grok research)
const horrorAdjectives = [
  'eerie',
  'ghastly',
  'sinister',
  'haunted',
  'bloodied',
  'whispering',
  'forgotten',
  'cursed',
  'macabre',
  'dreadful',
  'unnerving',
  'phantom',
  'spectral',
  'baleful',
  'corpse-like',
  'eldritch',
  'menacing',
  'rotting',
  'forsaken',
  'lurking',
  'twisted',
  'ominous',
  'chilling',
];

const horrorNouns = [
  'crypt',
  'mansion',
  'graveyard',
  'asylum',
  'forest',
  'mirror',
  'doll',
  'attic',
  'basement',
  'ritual',
  'entity',
  'curse',
  'whisper',
  'shadow',
  'blood',
  'moon',
  'fog',
  'chain',
  'door',
  'eye',
  'hand',
  'void',
];

const config = {
  dictionaries: [horrorAdjectives, horrorAdjectives, horrorNouns],
  length: 3,
  separator: ' ',
  style: 'lowerCase' as const,
};

const GEMINI_MODEL = process.env.GOOGLE_GEMINI_MODEL || 'gemini-2.5-flash';
const IMAGEN_MODEL = process.env.GOOGLE_IMAGEN_MODEL || 'imagen-4.0-generate-001';

// Zod Schema for structured AI output
const SceneManifestSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  backdrops: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      anim: z.enum(['static', 'slideAcross', 'parallax']),
      layer: z.number(),
    }),
  ),
  performers: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['tubeman', 'boxer', 'trapeze', 'backdropFreak', 'lionTamerGhost', 'strongman', 'fireBreather', 'fortuneTeller']),
      appearancePrompt: z.string(),
      anim: z.enum(['popup', 'drop', 'slideOutWall', 'flail', 'swing']),
      resolveItem: z.enum(['scissors', 'lamp', 'hook', 'pin', 'net', 'mallet', 'water', 'crystal']),
      preferredRoomType: z.enum(['deadend', 'straight', 'junction', 'crossroad']),
    }),
  ),
  videoPrompts: z.object({
    intro: z.string(),
    win: z.string(),
    lose: z.string(),
  }),
});

type SceneManifest = z.infer<typeof SceneManifestSchema>;

// System prompt for AI manifest generation
const SYSTEM_PROMPT = `You are a deranged ringmaster designing a nightmare circus in Terry Gilliam's Monty Python collage style.
All performers must be flat 2D paper-mache cutouts with absurd proportions and eerie vibes.
Each performer needs a logical resolveItem that matches their type:
- tubeman: scissors (to cut them down)
- boxer: lamp (to scare them away)
- trapeze: hook (to catch them)
- backdropFreak: pin (to puncture them)
- lionTamerGhost: net (to capture them)
- strongman: mallet (to challenge them)
- fireBreather: water (to douse them)
- fortuneTeller: crystal (to disrupt their vision)

Specify three video prompts for the game's narratively key moments:
- intro: A surreal approach to the circus grounds.
- win: The player escaping the maze as it collapses into paper confetti.
- lose: Beppo's giant paper-mache face swallowing the camera.

Backdrops should be layered circus scenes with unsettling imagery - tattered tents, shadowy crowds, twisted carnival rides.
All descriptions should be suitable as image generation prompts for flat paper cutout style assets.

IMPORTANT: Respond with ONLY valid JSON matching this exact schema, no markdown or other text:
{
  "title": "string (e.g. 'The Hall of Hollow Grins')",
  "description": "string (e.g. 'Enter a maze of tattered canvas where the reflections aren't your own.')",
  "backdrops": [{ "id": "string", "description": "string", "anim": "static|slideAcross|parallax", "layer": number }],
  "performers": [{ "id": "string", "type": "tubeman|boxer|trapeze|backdropFreak|lionTamerGhost|strongman|fireBreather|fortuneTeller", "appearancePrompt": "string", "anim": "popup|drop|slideOutWall|flail|swing", "resolveItem": "scissors|lamp|hook|pin|net|mallet|water|crystal", "preferredRoomType": "deadend|straight|junction|crossroad" }],
  "videoPrompts": { "intro": "string", "win": "string", "lose": "string" }
}`;

// Initialize Google GenAI client
function getClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate AI-powered manifest using Google Gemini
 */
async function generateAIManifest(
  client: GoogleGenerativeAI,
  phrase: string,
): Promise<SceneManifest | null> {
  try {
    console.log(`  🤖 Calling Google Gemini for: "${phrase}"...`);

    const model = client.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: SYSTEM_PROMPT,
    });

    const response = await model.generateContent(`Generate a surreal horror-circus scene manifest based on the seed phrase: "${phrase}". 
Include 5-8 performers/freaks and 3-5 background/backdrop elements. 
Each performer must have a detailed appearancePrompt suitable for AI image generation in flat paper cutout style.
Make each description unique and creatively horrifying while staying in the Monty Python aesthetic.`);

    const result = await response.response;
    const text = result.text().trim();
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    // Parse and validate JSON
    const parsed = JSON.parse(text);
    const validated = SceneManifestSchema.parse(parsed);

    console.log(
      `  ✅ Generated manifest with ${validated.performers.length} performers and ${validated.backdrops.length} backdrops`,
    );
    return validated;
  } catch (error) {
    console.error(`  ❌ Gemini API error:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Generate images using Google Imagen 4
 */
async function generateImages(
  client: GoogleGenerativeAI,
  manifest: SceneManifest,
  outputDir: string,
): Promise<void> {
  console.log(`  🎨 Generating images with ${IMAGEN_MODEL}...`);

  for (const performer of manifest.performers) {
    try {
      const prompt = `${performer.appearancePrompt}, flat 2D paper cutout, high contrast silhouette, transparent background, Monty Python animation style, vintage circus poster aesthetic`;

      const model = client.getGenerativeModel({ model: IMAGEN_MODEL });
      const response = await model.generateContent(prompt);
      // Note: Imagen 4 via GenerativeAI SDK might have a different response structure 
      // but for now we follow the existing logic or fall back to mock.

      if (response.generatedImages?.[0]?.image?.imageBytes) {
        const imagePath = path.join(outputDir, `${performer.id}.png`);
        await fs.writeFile(
          imagePath,
          Buffer.from(response.generatedImages[0].image.imageBytes, 'base64'),
        );
        console.log(`    ✓ Generated ${performer.id}.png`);
      }
    } catch (error) {
      console.error(
        `    ✗ Failed to generate ${performer.id}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  for (const backdrop of manifest.backdrops) {
    try {
      const prompt = `${backdrop.description}, flat 2D paper cutout collage, Terry Gilliam style, vintage circus backdrop, high contrast, layered paper texture`;

      const response = await client.models.generateImages({
        model: IMAGEN_MODEL,
        prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '16:9',
        },
      });

      if (response.generatedImages?.[0]?.image?.imageBytes) {
        const imagePath = path.join(outputDir, `${backdrop.id}.png`);
        await fs.writeFile(
          imagePath,
          Buffer.from(response.generatedImages[0].image.imageBytes, 'base64'),
        );
        console.log(`    ✓ Generated ${backdrop.id}.png`);
      }
    } catch (error) {
      console.error(
        `    ✗ Failed to generate ${backdrop.id}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
}

/**
 * Generate a deterministic mock manifest for testing
 */
function generateMockManifest(phrase: string): SceneManifest {
  const hash = crypto.createHash('sha256').update(phrase).digest('hex');
  random.use(parseInt(hash.slice(0, 8), 16));

  const performerTypes: SceneManifest['performers'][0]['type'][] = [
    'tubeman',
    'boxer',
    'trapeze',
    'backdropFreak',
    'lionTamerGhost',
    'strongman',
    'fireBreather',
    'fortuneTeller',
  ];
  const anims: SceneManifest['performers'][0]['anim'][] = [
    'popup',
    'drop',
    'slideOutWall',
    'flail',
    'swing',
  ];
  const resolveItems: Record<string, SceneManifest['performers'][0]['resolveItem']> = {
    tubeman: 'scissors',
    boxer: 'lamp',
    trapeze: 'hook',
    backdropFreak: 'pin',
    lionTamerGhost: 'net',
    strongman: 'mallet',
    fireBreather: 'water',
    fortuneTeller: 'crystal',
  };
  const roomTypes: SceneManifest['performers'][0]['preferredRoomType'][] = [
    'deadend',
    'straight',
    'junction',
    'crossroad',
  ];

  const numPerformers = 5 + Math.floor(random.float() * 4);
  const performers: SceneManifest['performers'] = [];

  for (let i = 0; i < numPerformers; i++) {
    const type = performerTypes[Math.floor(random.float() * performerTypes.length)];
    performers.push({
      id: `perf_${String(i + 1).padStart(2, '0')}`,
      type,
      appearancePrompt: `Flat 2D paper cutout of a ${type === 'tubeman'
        ? 'wacky arm-flailing inflatable clown with wild googly eyes and a manic grin'
        : type === 'boxer'
          ? 'giant inflatable boxing tube with a sinister painted face and menacing gloves'
          : type === 'trapeze'
            ? 'skeletal acrobat with paper wings and hollow eye sockets'
            : type === 'backdropFreak'
              ? 'twisted carnival barker with multiple heads and elongated limbs'
              : type === 'strongman'
                ? 'muscle-bound paper cutout lifting a barbell made of skulls'
                : type === 'fireBreather'
                  ? 'fiery jester spitting trails of orange paper flames'
                  : type === 'fortuneTeller'
                    ? 'shrouded figure with a glowing paper crystal ball'
                    : 'spectral lion tamer with a whip of shadows and a cage of nightmares'
        }, Terry Gilliam style, high contrast silhouette on transparent background`,
      anim: anims[Math.floor(random.float() * anims.length)],
      resolveItem: resolveItems[type],
      preferredRoomType: roomTypes[Math.floor(random.float() * roomTypes.length)],
    });
  }

  const numBackdrops = 3 + Math.floor(random.float() * 3);
  const backdrops: SceneManifest['backdrops'] = [];
  const backdropDescriptions = [
    'Tattered circus tent with watchful eyes peering through torn fabric',
    'Moving shadows of giant hands reaching from the darkness',
    'Twisted carousel with skeletal horses frozen mid-gallop',
    'Crowd of faceless spectators with hollow smiles',
    'Rusted Ferris wheel silhouetted against a blood-red moon',
  ];

  for (let i = 0; i < numBackdrops; i++) {
    backdrops.push({
      id: `bg_${String(i + 1).padStart(2, '0')}`,
      description: backdropDescriptions[i % backdropDescriptions.length],
      anim: i === 0 ? 'static' : i === 1 ? 'parallax' : 'slideAcross',
      layer: i,
    });
  }

  const videoPrompts = {
    intro: `Cinematic approach to a tattered circus tent under a ${phrase} moon, paper-mache style.`,
    win: 'The maze walls collapse into paper confetti as the sun rises, Terry Gilliam style.',
    lose: 'Beppo the Clown\'s giant paper-mache face fills the screen, shadows lengthening.',
  };

  return { performers, backdrops, videoPrompts };
}

async function main() {
  const mazesDir = path.join(process.cwd(), 'client/public/assets/mazes');
  await fs.mkdir(mazesDir, { recursive: true });

  const numMazes = parseInt(process.env.NUM_MAZES || '10', 10);
  const generateImagesFlag = process.env.GENERATE_IMAGES === 'true';
  const client = getClient();
  const hasClient = !!client;

  console.log(`\n🎪 Beppo Laughs - Asset Generation Pipeline`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📦 Output: ${mazesDir}`);
  console.log(`🎲 Generating: ${numMazes} maze manifests`);
  console.log(`🤖 Text Gen: ${hasClient ? GEMINI_MODEL : 'Mock Data'}`);
  console.log(`🎨 Image Gen: ${generateImagesFlag && hasClient ? IMAGEN_MODEL : 'Disabled'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (!hasClient) {
    console.warn('⚠️  Google GenAI credentials not set - using mock data\n');
  }

  const generatedSeeds: {
    phrase: string;
    hash: string;
    title: string;
    description: string;
    performers: number;
    backdrops: number;
  }[] = [];

  for (let i = 0; i < numMazes; i++) {
    const phrase = uniqueNamesGenerator(config);
    const hash = crypto.createHash('sha256').update(phrase).digest('hex').slice(0, 12);
    const mazeDir = path.join(mazesDir, hash);
    await fs.mkdir(mazeDir, { recursive: true });

    console.log(`[${i + 1}/${numMazes}] 🌀 Seed: "${phrase}" (${hash})`);

    // Try AI generation, fall back to mock
    let manifest = client ? await generateAIManifest(client, phrase) : null;
    if (!manifest) {
      manifest = generateMockManifest(phrase);
      console.log(`  📋 Generated mock manifest`);
    }

    // Generate images if enabled and API key is available
    if (generateImagesFlag && client) {
      await generateImages(client, manifest, mazeDir);
    }

    // Save the manifest
    const fullManifest = {
      phrase,
      hash,
      generatedAt: new Date().toISOString(),
      aiGenerated: !!client && manifest !== null,
      provider: client ? 'gemini' : 'mock',
      ...manifest,
    };

    await fs.writeFile(path.join(mazeDir, 'manifest.json'), JSON.stringify(fullManifest, null, 2));

    generatedSeeds.push({
      phrase,
      hash,
      title: manifest.title || `Maze ${hash.slice(0, 4)}`,
      description: manifest.description || 'A dark and twisted challenge.',
      performers: manifest.performers.length,
      backdrops: manifest.backdrops.length,
      videoPrompts: manifest.videoPrompts,
    });

    console.log(`  💾 Saved to: ${hash}/manifest.json\n`);
  }

  // Write index of all generated mazes
  const indexPath = path.join(mazesDir, 'index.json');
  await fs.writeFile(
    indexPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: generatedSeeds.length,
        mazes: generatedSeeds,
      },
      null,
      2,
    ),
  );

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Generation complete!`);
  console.log(`📁 Index saved to: ${indexPath}`);
  console.log(`\nGenerated seeds:`);
  generatedSeeds.forEach((s) => {
    console.log(`  • "${s.phrase}" → ${s.performers} performers, ${s.backdrops} backdrops`);
  });
  console.log(`\n🎪 Ready to haunt!\n`);
}

main().catch(console.error);
