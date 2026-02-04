const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Stable Horde - Free distributed Stable Diffusion (no API key required for anonymous use)
const HORDE_API = 'https://stablehorde.net/api/v2';

const OUTPUT_DIR = path.join(__dirname, '..', 'ai-images');
const OUTFIT_DIR = path.join(OUTPUT_DIR, 'outfits');
const ITEMS_DIR = path.join(OUTPUT_DIR, 'items');

const SITUATIONS = ['casual', 'commute', 'date', 'exercise'];
const CATEGORIES = ['veryHot', 'hot', 'warm', 'mild', 'cool', 'chilly', 'cold', 'veryCold', 'freezing'];
const GENDERS = ['male', 'female'];

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
  veryHot: 'summer',
  hot: 'warm summer',
  warm: 'spring',
  mild: 'mild autumn',
  cool: 'cool autumn',
  chilly: 'chilly fall',
  cold: 'cold winter',
  veryCold: 'freezing winter',
  freezing: 'extreme cold winter',
};

const SITUATION_PROMPTS = {
  casual: 'casual streetwear',
  commute: 'office business casual',
  date: 'stylish date outfit',
  exercise: 'athletic sportswear',
};

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

function buildItemPrompt({ itemKey, gender, situation, category }) {
  const itemLabel = ITEM_LABELS[itemKey] || itemKey.replace(/_/g, ' ');
  const genderLabel = gender === 'male' ? "men's" : "women's";
  const situationLabel = SITUATION_PROMPTS[situation] || 'casual';
  const tempLabel = TEMP_PROMPTS[category] || 'mild weather';
  return `fashion product photography, ${genderLabel} ${itemLabel}, ${situationLabel} style for ${tempLabel}, studio lighting, white background, high quality, professional, minimalist, centered`;
}

function buildOutfitPrompt({ gender, situation, category }) {
  const genderLabel = gender === 'male' ? "men's" : "women's";
  const situationLabel = SITUATION_PROMPTS[situation] || 'casual';
  const tempLabel = TEMP_PROMPTS[category] || 'mild weather';
  return `fashion lookbook photography, ${genderLabel} complete outfit on mannequin, ${situationLabel} style for ${tempLabel}, studio lighting, neutral background, full body view, high quality, professional`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isPlaceholder(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size < 50000;
  } catch {
    return true;
  }
}

async function generateWithHorde(prompt, width, height) {
  // Submit generation request
  const submitRes = await fetch(`${HORDE_API}/generate/async`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': '0000000000', // Anonymous API key
    },
    body: JSON.stringify({
      prompt: prompt + ', high quality, detailed',
      params: {
        width: Math.min(width, 1024),
        height: Math.min(height, 1024),
        steps: 25,
        cfg_scale: 7,
        sampler_name: 'k_euler_a',
      },
      nsfw: false,
      censor_nsfw: true,
      models: ['stable_diffusion'],
    }),
  });

  if (!submitRes.ok) {
    const error = await submitRes.text();
    throw new Error(`Submit failed: ${error}`);
  }

  const submitData = await submitRes.json();
  const jobId = submitData.id;

  if (!jobId) {
    throw new Error('No job ID returned');
  }

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 120; // 10 minutes max

  while (attempts < maxAttempts) {
    await sleep(5000);
    attempts++;

    const checkRes = await fetch(`${HORDE_API}/generate/check/${jobId}`);
    if (!checkRes.ok) continue;

    const checkData = await checkRes.json();

    if (checkData.done) {
      // Get the result
      const statusRes = await fetch(`${HORDE_API}/generate/status/${jobId}`);
      if (!statusRes.ok) throw new Error('Failed to get status');

      const statusData = await statusRes.json();
      const generations = statusData.generations;

      if (generations && generations.length > 0 && generations[0].img) {
        // Image is base64 encoded
        return Buffer.from(generations[0].img, 'base64');
      }
      throw new Error('No image in response');
    }

    if (checkData.faulted) {
      throw new Error('Generation faulted');
    }

    // Still processing
    process.stdout.write('.');
  }

  throw new Error('Timeout waiting for generation');
}

async function generateImage(filePath, prompt, width, height) {
  if (fs.existsSync(filePath) && !isPlaceholder(filePath)) {
    return { skipped: true };
  }

  try {
    const buffer = await generateWithHorde(prompt, width, height);
    fs.writeFileSync(filePath, buffer);
    return { skipped: false, success: true };
  } catch (err) {
    console.log(`\n  Error: ${err.message}`);
    return { skipped: false, success: false };
  }
}

async function main() {
  ensureDir(OUTPUT_DIR);
  ensureDir(OUTFIT_DIR);
  ensureDir(ITEMS_DIR);

  const { genderedOutfitItems, situationItems } = loadOutfitData();

  let total = 0;
  let created = 0;
  let skipped = 0;
  let failed = 0;

  const tasks = [];

  // Collect all tasks
  for (const gender of GENDERS) {
    for (const situation of SITUATIONS) {
      for (const category of CATEGORIES) {
        // Outfit
        const outfitPath = path.join(OUTFIT_DIR, gender, situation);
        ensureDir(outfitPath);
        const outfitFile = path.join(outfitPath, `${category}.png`);
        const outfitPrompt = buildOutfitPrompt({ gender, situation, category });
        tasks.push({ file: outfitFile, prompt: outfitPrompt, width: 512, height: 576, type: 'outfit' });

        // Items
        let items;
        if (situation === 'casual' || !situationItems[situation]) {
          items = genderedOutfitItems[gender][category];
        } else {
          items = situationItems[situation][gender][category];
        }

        const itemDir = path.join(ITEMS_DIR, gender, situation, category);
        ensureDir(itemDir);

        for (const [imgKey] of items) {
          const itemFile = path.join(itemDir, `${imgKey}.png`);
          const itemPrompt = buildItemPrompt({ itemKey: imgKey, gender, situation, category });
          tasks.push({ file: itemFile, prompt: itemPrompt, width: 512, height: 512, type: 'item' }); // 576x576 limit for free tier
        }
      }
    }
  }

  // Filter to only placeholder images
  const pendingTasks = tasks.filter(t => !fs.existsSync(t.file) || isPlaceholder(t.file));

  console.log(`Found ${tasks.length} total images.`);
  console.log(`Need to generate ${pendingTasks.length} images (rest are already AI-generated).\n`);

  if (pendingTasks.length === 0) {
    console.log('All images are already generated!');
    return;
  }

  // Process tasks
  for (let i = 0; i < pendingTasks.length; i++) {
    const task = pendingTasks[i];
    total++;

    process.stdout.write(`[${i + 1}/${pendingTasks.length}] ${path.basename(task.file)} `);

    const result = await generateImage(task.file, task.prompt, task.width, task.height);

    if (result.skipped) {
      console.log('SKIPPED');
      skipped++;
    } else if (result.success) {
      console.log(' CREATED');
      created++;
    } else {
      console.log(' FAILED');
      failed++;
    }

    // Small delay between requests
    await sleep(1000);
  }

  console.log(`\n========================================`);
  console.log(`Done!`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total processed: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
