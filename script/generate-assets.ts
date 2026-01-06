import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

const IMAGE_MODEL = process.env.GOOGLE_IMAGEN_MODEL || 'imagen-4.0-generate-001';
const VIDEO_MODEL = process.env.GOOGLE_VEO_MODEL || 'veo-3.1-generate-001';

const OUTPUT_IMAGES_DIRS = [
  path.join(process.cwd(), 'attached_assets', 'generated_images'),
  path.join(process.cwd(), 'client', 'public', 'assets', 'generated_images'),
];
const OUTPUT_VIDEOS_DIRS = [
  path.join(process.cwd(), 'attached_assets', 'generated_videos'),
  path.join(process.cwd(), 'client', 'public', 'assets', 'generated_videos'),
];
const CATALOG_OUTPUT = path.join(process.cwd(), 'client', 'public', 'assets', 'asset-catalog.json');

const GENERATE_IMAGES = process.env.GENERATE_IMAGES !== 'false';
const GENERATE_VIDEOS = process.env.GENERATE_VIDEOS === 'true';
const FORCE_REGENERATE = process.env.FORCE_REGENERATE === 'true';
const ASSET_GROUP = process.env.ASSET_GROUP || 'extended';

const CUTOUT_STYLE =
  'paper-mache cutout, nightmare carnival, Victorian freak show, chromolithograph poster ink texture, halftone dots, limited palette (crimson, mustard, indigo, sepia), Terry Gilliam collage style, Monty Python grotesquerie, transparent background, high contrast, crisp silhouette, centered, no text, no watermark';
const TEXTURE_STYLE =
  'seamless tileable texture, high detail, circus horror aesthetic, big-top tent atmosphere, chromolithograph color palette, hand-painted, top-down lighting, no perspective, no text, no logos';
const BACKDROP_STYLE =
  'layered circus backdrop, parade spectacle tableau, menagerie silhouettes, paper collage, moody lighting, endless canvas walls, high contrast, vintage carnival grime, no text, no logos';

type AssetGroup = 'core' | 'extended';

type BaseImageAsset = {
  id: string;
  fileName: string;
  prompt: string;
  aspectRatio: string;
  group: AssetGroup;
};

type TaggedImageAsset = BaseImageAsset & { tags: string[] };

type BaseVideoAsset = {
  id: string;
  fileName: string;
  prompt: string;
  aspectRatio: string;
  durationSeconds: number;
  group: AssetGroup;
};

const coreFloorTextures: BaseImageAsset[] = [
  {
    id: 'circus_sawdust_floor_texture',
    fileName: 'circus_sawdust_floor_texture.png',
    prompt: `Circus sawdust floor with scattered straw and grime, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'core',
  },
  {
    id: 'dark_muddy_grass_ground_texture',
    fileName: 'dark_muddy_grass_ground_texture.png',
    prompt: `Dark muddy grass with puddles and trampled footprints, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'core',
  },
];

const coreWallTextures: BaseImageAsset[] = [
  {
    id: 'vintage_circus_tent_canvas_texture',
    fileName: 'vintage_circus_tent_canvas_texture.png',
    prompt: `Aged circus tent canvas with stains, seams, and faint rope shadows, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'core',
  },
  {
    id: 'seamless_dark_hedge_texture',
    fileName: 'seamless_dark_hedge_texture.png',
    prompt: `Dense twisted hedge wall texture with thorny branches, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'core',
  },
];

const coreCollectibles: BaseImageAsset[] = [
  {
    id: 'paper_mache_circus_ticket_item',
    fileName: 'paper_mache_circus_ticket_item.png',
    prompt: `A tattered circus ticket made of paper mache, ornate edges, eerie ink stamps, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'core',
  },
  {
    id: 'paper_mache_key_item',
    fileName: 'paper_mache_key_item.png',
    prompt: `An ornate paper mache key with carnival filigree and chipped paint, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'core',
  },
];

const wallTextures: BaseImageAsset[] = [
  {
    id: 'wall_tattered_fabric_texture',
    fileName: 'wall_tattered_fabric_texture.png',
    prompt: `Tattered carnival fabric wall with frayed threads and patchwork seams, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'wall_rusted_metal_grid_texture',
    fileName: 'wall_rusted_metal_grid_texture.png',
    prompt: `Rusted metal grid wall like a lion tamer cage, corroded bars, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'wall_weathered_wood_planks_texture',
    fileName: 'wall_weathered_wood_planks_texture.png',
    prompt: `Weathered carnival booth wood planks with nails and peeling paint, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'wall_backstage_canvas_texture',
    fileName: 'wall_backstage_canvas_texture.png',
    prompt: `Backstage canvas wall with rope lashings, pulley marks, and grime, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'wall_velvet_drape_texture',
    fileName: 'wall_velvet_drape_texture.png',
    prompt: `Worn velvet drapes with heavy folds, dust, and stitched trim, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'wall_ringmaster_banners_texture',
    fileName: 'wall_ringmaster_banners_texture.png',
    prompt: `Torn ringmaster banners layered on canvas wall, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
];

const floorTextures: BaseImageAsset[] = [
  {
    id: 'floor_worn_carnival_tile_texture',
    fileName: 'floor_worn_carnival_tile_texture.png',
    prompt: `Worn carnival tile floor, faded checkerboard, grime in the grout, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'floor_blood_stained_concrete_texture',
    fileName: 'floor_blood_stained_concrete_texture.png',
    prompt: `Blood-stained concrete with cracks and dark smears, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'floor_creaky_boardwalk_texture',
    fileName: 'floor_creaky_boardwalk_texture.png',
    prompt: `Creaky wooden boardwalk with salt stains and warped planks, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'floor_muddy_straw_texture',
    fileName: 'floor_muddy_straw_texture.png',
    prompt: `Muddy straw mixed with dirt and hoof prints, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'floor_ticket_litter_texture',
    fileName: 'floor_ticket_litter_texture.png',
    prompt: `Littered tickets, handbill fragments, and confetti ground texture, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'floor_greasepaint_smear_texture',
    fileName: 'floor_greasepaint_smear_texture.png',
    prompt: `Smudged greasepaint and chalky footprints, ${TEXTURE_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
];

const obstacles: BaseImageAsset[] = [
  {
    id: 'popup_tubeman_cutout',
    fileName: 'popup_tubeman.png',
    prompt: `Wacky arm-flailing inflatable tubeman clown with manic grin, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'popup_punching_clown_cutout',
    fileName: 'popup_clown.png',
    prompt: `Giant inflatable punching clown with boxing gloves and cracked paint, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'popup_spring_jester_cutout',
    fileName: 'popup_jester.png',
    prompt: `Spring-loaded jester with angular limbs and bells, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'slide_guillotine_cutout',
    fileName: 'slide_guillotine.png',
    prompt: `Rusty carnival guillotine blade with ornate frame, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'slide_spiked_door_cutout',
    fileName: 'slide_spiked_door.png',
    prompt: `Spiked iron door with circus motifs and grime, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'slide_carousel_spike_cutout',
    fileName: 'slide_carousel.png',
    prompt: `Carousel spike ring with skeletal horse motifs and chipped paint, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'drop_hanging_chain_cutout',
    fileName: 'drop_chain.png',
    prompt: `Hanging chain with heavy rusted links, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'drop_cage_door_cutout',
    fileName: 'drop_cage.png',
    prompt: `Falling cage door with bars and torn banners, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'drop_net_curtain_cutout',
    fileName: 'drop_net.png',
    prompt: `Net curtain with frayed edges and knots, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
];

const solutionItems: BaseImageAsset[] = [
  {
    id: 'item_scissors_cutout',
    fileName: 'item_scissors.png',
    prompt: `Large ceremonial scissors with carnival filigree, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'item_boxing_glove_cutout',
    fileName: 'item_boxing_glove.png',
    prompt: `Worn leather boxing glove with stitched seams, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'item_mallet_cutout',
    fileName: 'item_mallet.png',
    prompt: `Carnival mallet with chipped paint and wood grain, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'item_pin_cutout',
    fileName: 'item_pin.png',
    prompt: `Ornate safety pin with tiny circus charms, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'item_net_cutout',
    fileName: 'item_net.png',
    prompt: `Carnival capture net coiled and frayed, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'item_hook_cutout',
    fileName: 'item_hook.png',
    prompt: `Old iron hook with rope binding, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'item_lamp_cutout',
    fileName: 'item_lamp.png',
    prompt: `Lantern lamp with cracked glass and glow, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'item_key_cutout',
    fileName: 'item_key.png',
    prompt: `Huge iron key with carnival crest, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'item_pitcher_cutout',
    fileName: 'item_pitcher.png',
    prompt: `Glass water pitcher with condensation and grime, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
];

const characters: BaseImageAsset[] = [
  {
    id: 'char_beppo_cutout',
    fileName: 'char_beppo.png',
    prompt: `Beppo the clown master, looming grin and hollow eyes, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'char_audience_cutout',
    fileName: 'char_audience.png',
    prompt: `Shadowy audience silhouettes with hollow smiles, ${CUTOUT_STYLE}`,
    aspectRatio: '16:9',
    group: 'extended',
  },
  {
    id: 'char_barker_cutout',
    fileName: 'char_barker.png',
    prompt: `Carnival barker in ragged coat, megaphone mouth, showman’s sash, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'char_makeup_artist_cutout',
    fileName: 'char_makeup_artist.png',
    prompt: `Creepy clown makeup artist with brush hands, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'char_ringmaster_cutout',
    fileName: 'char_ringmaster.png',
    prompt: `Menacing ringmaster with top hat and whip, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'char_carousel_horse_cutout',
    fileName: 'char_carousel_horse.png',
    prompt: `Creepy carousel horse with hollow eyes and cracked paint, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
  {
    id: 'char_tent_clowns_cutout',
    fileName: 'char_tent_clowns.png',
    prompt: `Tent pole clowns perched on poles, elongated limbs, ${CUTOUT_STYLE}`,
    aspectRatio: '1:1',
    group: 'extended',
  },
];

const backdrops: BaseImageAsset[] = [
  {
    id: 'backdrop_tattered_tent',
    fileName: 'backdrop_tattered_tent.png',
    prompt: `Tattered circus tent interior with endless canvas walls and striped rigging, ${BACKDROP_STYLE}`,
    aspectRatio: '16:9',
    group: 'extended',
  },
  {
    id: 'backdrop_shadowy_crowd',
    fileName: 'backdrop_shadowy_crowd.png',
    prompt: `Shadowy carnival crowd behind torn banners and parade wagons, ${BACKDROP_STYLE}`,
    aspectRatio: '16:9',
    group: 'extended',
  },
  {
    id: 'backdrop_twisted_rides',
    fileName: 'backdrop_twisted_rides.png',
    prompt: `Twisted carnival rides silhouetted in fog with menagerie cages, ${BACKDROP_STYLE}`,
    aspectRatio: '16:9',
    group: 'extended',
  },
  {
    id: 'backdrop_backstage_corridor',
    fileName: 'backdrop_backstage_corridor.png',
    prompt: `Backstage corridor of the big top with rigging and shadows, ${BACKDROP_STYLE}`,
    aspectRatio: '16:9',
    group: 'extended',
  },
  {
    id: 'backdrop_lion_cage',
    fileName: 'backdrop_lion_cage.png',
    prompt: `Lion tamer cage interior with bars and dangling banners, ${BACKDROP_STYLE}`,
    aspectRatio: '16:9',
    group: 'extended',
  },
];

const withTags = (tags: string[], assets: BaseImageAsset[]): TaggedImageAsset[] =>
  assets.map((asset) => ({ ...asset, tags }));

const coreFloorTexturesTagged = withTags(['texture', 'floor', 'core'], coreFloorTextures);
const coreWallTexturesTagged = withTags(['texture', 'wall', 'core'], coreWallTextures);
const coreCollectiblesTagged = withTags(['item', 'collectible', 'core'], coreCollectibles);
const wallTexturesTagged = withTags(['texture', 'wall', 'extended'], wallTextures);
const floorTexturesTagged = withTags(['texture', 'floor', 'extended'], floorTextures);
const obstaclesTagged = withTags(['obstacle', 'cutout', 'extended'], obstacles);
const solutionItemsTagged = withTags(['item', 'solution', 'extended'], solutionItems);
const charactersTagged = withTags(['character', 'cutout', 'extended'], characters);
const backdropsTagged = withTags(['backdrop', 'extended'], backdrops);

const IMAGE_ASSETS: TaggedImageAsset[] = [
  ...coreFloorTexturesTagged,
  ...coreWallTexturesTagged,
  ...coreCollectiblesTagged,
  ...wallTexturesTagged,
  ...floorTexturesTagged,
  ...obstaclesTagged,
  ...solutionItemsTagged,
  ...charactersTagged,
  ...backdropsTagged,
];

const VIDEO_ASSETS: BaseVideoAsset[] = [
  {
    id: 'intro_beppo_emerging',
    fileName: 'intro_beppo_emerging.mp4',
    prompt:
      'Cinematic approach to a decaying big-top tent; parade wagons and a distant circus train arrival dissolve into paper collage animation, swirling fog, Beppo emerging in the distance, unsettling carnival lights, Terry Gilliam style.',
    aspectRatio: '16:9',
    durationSeconds: 20,
    group: 'core',
  },
  {
    id: 'outro_beppo_laughing',
    fileName: 'outro_beppo_laughing.mp4',
    prompt:
      'Close-up of Beppo’s giant papier-mâché face laughing as the camera is swallowed; chromolithograph poster texture, jittery collage animation, heavy shadows, surreal carnival glare.',
    aspectRatio: '16:9',
    durationSeconds: 10,
    group: 'core',
  },
  {
    id: 'win_escape',
    fileName: 'win_escape.mp4',
    prompt:
      'The maze collapses into paper confetti as the player escapes into night air; collage animation, carnival banners tearing, cathartic glow.',
    aspectRatio: '16:9',
    durationSeconds: 12,
    group: 'extended',
  },
];

type ImageAsset = TaggedImageAsset;
type VideoAsset = BaseVideoAsset;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function shouldGenerate(filePaths: string[]) {
  if (FORCE_REGENERATE) return true;
  for (const filePath of filePaths) {
    try {
      await fs.access(filePath);
    } catch {
      return true;
    }
  }
  return false;
}

function assetIncluded(group: string) {
  if (ASSET_GROUP === 'all') return true;
  if (ASSET_GROUP === group) return true;
  return ASSET_GROUP === 'extended' && group === 'core';
}

async function generateImage(client: GoogleGenAI, asset: ImageAsset) {
  const outputPaths = OUTPUT_IMAGES_DIRS.map((dir) => path.join(dir, asset.fileName));
  if (!(await shouldGenerate(outputPaths))) {
    console.log(`  ↪ Skipping ${asset.fileName} (already exists)`);
    return;
  }

  const response = await client.models.generateImages({
    model: IMAGE_MODEL,
    prompt: asset.prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: asset.aspectRatio,
    },
  });

  const imageBytes =
    (response as { generatedImages?: { image?: { imageBytes?: string } }[] })
      .generatedImages?.[0]?.image?.imageBytes ??
    (response as { images?: { image?: { imageBytes?: string } }[] }).images?.[0]
      ?.image?.imageBytes;
  if (!imageBytes) {
    throw new Error(`No image bytes returned for ${asset.id}`);
  }

  await Promise.all(
    outputPaths.map((outputPath) => fs.writeFile(outputPath, Buffer.from(imageBytes, 'base64'))),
  );
  console.log(`  ✓ Generated ${asset.fileName}`);
}

async function generateVideo(client: GoogleGenAI, asset: VideoAsset) {
  const outputPaths = OUTPUT_VIDEOS_DIRS.map((dir) => path.join(dir, asset.fileName));
  if (!(await shouldGenerate(outputPaths))) {
    console.log(`  ↪ Skipping ${asset.fileName} (already exists)`);
    return;
  }

  const response = await client.models.generateVideos({
    model: VIDEO_MODEL,
    prompt: asset.prompt,
    config: {
      durationSeconds: asset.durationSeconds,
      aspectRatio: asset.aspectRatio,
    },
  });

  const videoBytes =
    (response as { generatedVideos?: { video?: { videoBytes?: string } }[] })
      .generatedVideos?.[0]?.video?.videoBytes ??
    (response as { videos?: { video?: { videoBytes?: string } }[] }).videos?.[0]
      ?.video?.videoBytes;
  if (!videoBytes) {
    throw new Error(`No video bytes returned for ${asset.id}`);
  }

  await Promise.all(
    outputPaths.map((outputPath) => fs.writeFile(outputPath, Buffer.from(videoBytes, 'base64'))),
  );
  console.log(`  ✓ Generated ${asset.fileName}`);
}

async function main() {
  await Promise.all(OUTPUT_IMAGES_DIRS.map(ensureDir));
  await Promise.all(OUTPUT_VIDEOS_DIRS.map(ensureDir));
  await ensureDir(path.dirname(CATALOG_OUTPUT));

  const client = getClient();
  if (!client) {
    console.warn('⚠️  GOOGLE_GENERATIVE_AI_API_KEY/GOOGLE_API_KEY not set; skipping generation.');
    return;
  }

  console.log('\n🎪 Beppo Laughs - Asset Generation Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📦 Images: ${OUTPUT_IMAGES_DIRS.join(', ')}`);
  console.log(`🎬 Videos: ${OUTPUT_VIDEOS_DIRS.join(', ')}`);
  console.log(`🎨 Imagen Model: ${IMAGE_MODEL}`);
  console.log(`🎥 Veo Model: ${VIDEO_MODEL}`);
  console.log(`🧩 Asset Group: ${ASSET_GROUP}`);
  console.log(`🖼️  Generate Images: ${GENERATE_IMAGES}`);
  console.log(`🎞️  Generate Videos: ${GENERATE_VIDEOS}`);
  console.log(`♻️  Force Regenerate: ${FORCE_REGENERATE}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const catalog = {
    generatedAt: new Date().toISOString(),
    images: {
      coreFloorTextures: coreFloorTexturesTagged,
      coreWallTextures: coreWallTexturesTagged,
      coreCollectibles: coreCollectiblesTagged,
      wallTextures: wallTexturesTagged,
      floorTextures: floorTexturesTagged,
      obstacles: obstaclesTagged,
      solutionItems: solutionItemsTagged,
      characters: charactersTagged,
      backdrops: backdropsTagged,
      all: IMAGE_ASSETS,
    },
    videos: VIDEO_ASSETS,
  };
  await fs.writeFile(CATALOG_OUTPUT, JSON.stringify(catalog, null, 2));
  console.log(`📚 Wrote asset catalog: ${CATALOG_OUTPUT}`);

  if (GENERATE_IMAGES) {
    console.log('🎨 Generating image assets...');
    for (const asset of IMAGE_ASSETS) {
      if (!assetIncluded(asset.group)) continue;
      try {
        await generateImage(client, asset);
      } catch (error) {
        console.error(`  ✗ Failed ${asset.fileName}:`, error instanceof Error ? error.message : error);
      }
    }
  } else {
    console.log('⏭️  Image generation disabled.');
  }

  if (GENERATE_VIDEOS) {
    console.log('🎬 Generating video assets...');
    for (const asset of VIDEO_ASSETS) {
      if (!assetIncluded(asset.group)) continue;
      try {
        await generateVideo(client, asset);
      } catch (error) {
        console.error(`  ✗ Failed ${asset.fileName}:`, error instanceof Error ? error.message : error);
      }
    }
  } else {
    console.log('⏭️  Video generation disabled.');
  }

  console.log('\n✅ Asset generation complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
