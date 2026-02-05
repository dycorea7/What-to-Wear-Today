const fs = require('fs');
const path = require('path');
const vm = require('vm');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const OPENAI_IMAGE_QUALITY = process.env.OPENAI_IMAGE_QUALITY || 'medium';

const OUTPUT_DIR = path.join(__dirname, '..', 'ai-images');
const OUTFIT_DIR = path.join(OUTPUT_DIR, 'outfits');
const ITEMS_DIR = path.join(OUTPUT_DIR, 'items');

const SITUATIONS = ['casual', 'commute', 'date', 'exercise'];
const CATEGORIES = ['veryHot', 'hot', 'warm', 'mild', 'cool', 'chilly', 'cold', 'veryCold', 'freezing'];
const GENDERS = ['male', 'female'];

const SIZE_ITEM = '1024x1024';
const SIZE_OUTFIT = '1024x1536';

const ITEM_LABELS = {
  beanie: 'beanie',
  blazer: 'blazer',
  blouse: 'blouse',
  boots: 'boots',
  cap: 'baseball cap',
  cardigan: 'cardigan',
  chinos: 'chinos',
  dress: 'dress',
  dressShoes: 'dress shoes',
  earMuffs: 'earmuffs',
  field_jacket: 'field jacket',
  fleece_leggings: 'fleece leggings',
  fleece_longSleeve: 'fleece long sleeve top',
  fleece_pants: 'fleece pants',
  fleece_puffer: 'fleece puffer jacket',
  fleece_slacks: 'fleece slacks',
  fleece_sweatshirt: 'fleece sweatshirt',
  fleece_training_pants: 'fleece training pants',
  functional_longSleeve: 'performance long sleeve top',
  functional_tshirt: 'performance t-shirt',
  gloves: 'winter gloves',
  heat_tech: 'thermal base layer',
  jacket: 'light jacket',
  jeans: 'jeans',
  jumper: 'zip-up jacket',
  knit: 'knit sweater',
  knit_tshirt: 'knit short sleeve top',
  knit_vest: 'knit vest',
  leather_jacket: 'leather jacket',
  leggings: 'leggings',
  loafers: 'loafers',
  longSleeve: 'long sleeve t-shirt',
  neck_warmer: 'neck warmer',
  puffer: 'puffer coat',
  puffer_vest: 'puffer vest',
  sandals: 'sandals',
  scarf: 'scarf',
  shirt: 'button-up shirt',
  shorts: 'shorts',
  skirt: 'skirt',
  slacks: 'slacks',
  sneakers: 'sneakers',
  sunglasses: 'sunglasses',
  sweatshirt: 'sweatshirt',
  tanktop: 'tank top',
  training_jacket: 'training jacket',
  training_leggings: 'training leggings',
  training_pants: 'training pants',
  trenchCoat: 'trench coat',
  tshirt: 't-shirt',
  turtleneck: 'turtleneck sweater',
  windbreaker: 'windbreaker',
  winterBoots: 'winter boots',
  woolCoat: 'wool coat',
};

const TEMP_PROMPTS = {
  veryHot: 'very hot weather',
  hot: 'hot weather',
  warm: 'warm weather',
  mild: 'mild weather',
  cool: 'cool weather',
  chilly: 'chilly weather',
  cold: 'cold weather',
  veryCold: 'very cold weather',
  freezing: 'freezing weather',
};

const SITUATION_PROMPTS = {
  casual: 'casual',
  commute: 'smart commute',
  date: 'date night',
  exercise: 'athleisure',
};

function buildItemPrompt({ itemKey, gender, situation, category }) {
  const itemLabel = ITEM_LABELS[itemKey] || itemKey.replace(/_/g, ' ');
  const genderLabel = gender === 'male' ? 'men' : 'women';
  const situationLabel = SITUATION_PROMPTS[situation] || 'casual';
  const tempLabel = TEMP_PROMPTS[category] || 'mild weather';
  return [
    `Editorial lookbook studio photo of a ${itemLabel} for ${genderLabel}.`,
    `${situationLabel} style for ${tempLabel}.`,
    'Luxury fashion magazine aesthetic, soft diffused studio lighting, realistic fabric texture, high detail.',
    'Monotone palette (black, gray, white) with minimal accents.',
    'Soft neutral gradient background with subtle floor shadow, clean styling.',
    'Front-facing, full face visible, no face cropped.',
    'No text, no logo, no watermark.',
  ].join(' ');
}

function buildOutfitPrompt({ gender, situation, category }) {
  const genderLabel = gender === 'male' ? 'men' : 'women';
  const situationLabel = SITUATION_PROMPTS[situation] || 'casual';
  const tempLabel = TEMP_PROMPTS[category] || 'mild weather';
  return [
    `Editorial lookbook studio photo, full-body ${genderLabel} outfit on a mannequin.`,
    `${situationLabel} look for ${tempLabel}.`,
    'Luxury fashion magazine aesthetic, soft diffused studio lighting, high detail.',
    'Monotone palette (black, gray, white) with minimal accents.',
    'Soft neutral gradient background with subtle floor shadow, clean styling.',
    'Front-facing, full face visible, no face cropped.',
    'No text, no logo, no watermark.',
  ].join(' ');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function loadOutfitData() {
  const dataPath = path.join(__dirname, '..', 'outfit-data.js');
  const code = fs.readFileSync(dataPath, 'utf-8');
  const context = {};
  vm.createContext(context);
  const wrapped = `${code}\nthis.genderedOutfitItems = genderedOutfitItems; this.situationItems = situationItems;`;
  vm.runInContext(wrapped, context);
  return {
    genderedOutfitItems: context.genderedOutfitItems,
    situationItems: context.situationItems,
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImage(prompt, size, retries = 5) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_IMAGE_MODEL,
        prompt,
        size,
        quality: OPENAI_IMAGE_QUALITY,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const message = data?.error?.message || 'OpenAI image generation failed.';
      if (res.status === 429 && attempt < retries - 1) {
        const waitTime = (attempt + 1) * 15000; // Wait 15s, 30s, 45s, etc.
        console.log(`Rate limited. Waiting ${waitTime / 1000}s before retry...`);
        await sleep(waitTime);
        continue;
      }
      throw new Error(message);
    }
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) throw new Error('OpenAI response missing image data.');
    return Buffer.from(b64, 'base64');
  }
}

async function writeImage(filePath, prompt, size) {
  if (fs.existsSync(filePath)) {
    return { skipped: true };
  }
  try {
    const buffer = await generateImage(prompt, size);
    fs.writeFileSync(filePath, buffer);
    return { skipped: false, success: true };
  } catch (err) {
    console.log(`  FAILED: ${path.basename(filePath)} - ${err.message}`);
    return { skipped: false, success: false };
  }
}

async function main() {
  if (!OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY environment variable.');
    process.exit(1);
  }

  ensureDir(OUTPUT_DIR);
  ensureDir(OUTFIT_DIR);
  ensureDir(ITEMS_DIR);

  const { genderedOutfitItems, situationItems } = loadOutfitData();

  let total = 0;
  let skipped = 0;
  let generated = 0;
  let failed = 0;

  for (const gender of GENDERS) {
    for (const situation of SITUATIONS) {
      for (const category of CATEGORIES) {
        const outfitPrompt = buildOutfitPrompt({ gender, situation, category });
        const outfitPath = path.join(OUTFIT_DIR, gender, situation);
        ensureDir(outfitPath);
        const outfitFile = path.join(outfitPath, `${category}.png`);
        console.log(`[${gender}/${situation}/${category}] outfit...`);
        const outfitResult = await writeImage(outfitFile, outfitPrompt, SIZE_OUTFIT);
        total += 1;
        if (outfitResult.skipped) { skipped += 1; }
        else if (outfitResult.success) { generated += 1; console.log(`  OK: ${category}.png`); }
        else { failed += 1; }

        let items;
        if (situation === 'casual' || !situationItems[situation]) {
          items = genderedOutfitItems[gender][category];
        } else {
          items = situationItems[situation][gender][category];
        }

        const itemDir = path.join(ITEMS_DIR, gender, situation, category);
        ensureDir(itemDir);

        for (const [imgKey] of items) {
          const prompt = buildItemPrompt({
            itemKey: imgKey,
            gender,
            situation,
            category,
          });
          const itemFile = path.join(itemDir, `${imgKey}.png`);
          const itemResult = await writeImage(itemFile, prompt, SIZE_ITEM);
          total += 1;
          if (itemResult.skipped) { skipped += 1; }
          else if (itemResult.success) { generated += 1; console.log(`  OK: ${imgKey}.png`); }
          else { failed += 1; }
        }
      }
    }
  }

  console.log(`\nDone. Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed} (Total: ${total})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
