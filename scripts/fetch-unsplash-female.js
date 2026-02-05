const fs = require('fs');
const path = require('path');
const vm = require('vm');

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API = 'https://api.unsplash.com';

const OUTPUT_DIR = path.join(__dirname, '..', 'ai-images');
const OUTFIT_DIR = path.join(OUTPUT_DIR, 'outfits');
const ITEMS_DIR = path.join(OUTPUT_DIR, 'items');

const SITUATIONS = ['casual', 'commute', 'date', 'exercise'];
const CATEGORIES = ['veryHot', 'hot', 'warm', 'mild', 'cool', 'chilly', 'cold', 'veryCold', 'freezing'];
const GENDER = 'female';

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

const TEMP_LABELS = {
  veryHot: 'summer',
  hot: 'hot weather',
  warm: 'spring',
  mild: 'autumn',
  cool: 'cool weather',
  chilly: 'chilly weather',
  cold: 'winter',
  veryCold: 'cold winter',
  freezing: 'extreme cold',
};

const SITUATION_LABELS = {
  casual: 'casual',
  commute: 'office',
  date: 'date',
  exercise: 'athletic',
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Track requests for rate limiting (50/hour for free tier)
let requestCount = 0;
let firstRequestTime = null;

async function rateLimitedFetch(url) {
  if (firstRequestTime === null) {
    firstRequestTime = Date.now();
  }

  // If we've made 48 requests, check if we need to wait
  if (requestCount >= 48) {
    const elapsed = Date.now() - firstRequestTime;
    const oneHour = 60 * 60 * 1000;
    if (elapsed < oneHour) {
      const waitTime = oneHour - elapsed + 5000; // extra 5s buffer
      console.log(`\nRate limit approaching. Waiting ${Math.ceil(waitTime / 60000)} minutes...`);
      await sleep(waitTime);
    }
    requestCount = 0;
    firstRequestTime = Date.now();
  }

  requestCount++;
  return fetch(url);
}

async function searchAndDownload(query, filePath, orientation) {
  const encodedQuery = encodeURIComponent(query);
  const orientationParam = orientation ? `&orientation=${orientation}` : '';
  const url = `${UNSPLASH_API}/search/photos?query=${encodedQuery}&per_page=1${orientationParam}&client_id=${UNSPLASH_ACCESS_KEY}`;

  const res = await rateLimitedFetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unsplash search failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No results for: ${query}`);
  }

  const photo = data.results[0];
  // Use "regular" size (1080px width)
  const imageUrl = photo.urls.regular;

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    throw new Error(`Failed to download image: ${imgRes.status}`);
  }

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return { photographer: photo.user.name, url: photo.links.html };
}

async function main() {
  if (!UNSPLASH_ACCESS_KEY) {
    console.error('Missing UNSPLASH_ACCESS_KEY environment variable.');
    process.exit(1);
  }

  const { genderedOutfitItems, situationItems } = loadOutfitData();

  // Collect all tasks for female
  const tasks = [];

  for (const situation of SITUATIONS) {
    for (const category of CATEGORIES) {
      // Outfit
      const outfitPath = path.join(OUTFIT_DIR, GENDER, situation);
      ensureDir(outfitPath);
      const outfitFile = path.join(outfitPath, `${category}.png`);
      const sitLabel = SITUATION_LABELS[situation];
      const tempLabel = TEMP_LABELS[category];
      const outfitQuery = `women ${sitLabel} outfit ${tempLabel} fashion`;
      tasks.push({ file: outfitFile, query: outfitQuery, type: 'outfit', orientation: 'portrait' });

      // Items
      let items;
      if (situation === 'casual' || !situationItems[situation]) {
        items = genderedOutfitItems[GENDER][category];
      } else {
        items = situationItems[situation][GENDER][category];
      }

      const itemDir = path.join(ITEMS_DIR, GENDER, situation, category);
      ensureDir(itemDir);

      for (const [imgKey] of items) {
        const itemFile = path.join(itemDir, `${imgKey}.png`);
        const itemLabel = ITEM_LABELS[imgKey] || imgKey.replace(/_/g, ' ');
        const itemQuery = `women ${itemLabel} fashion product`;
        tasks.push({ file: itemFile, query: itemQuery, type: 'item', orientation: 'squarish' });
      }
    }
  }

  console.log(`Total female images to fetch: ${tasks.length}`);
  console.log(`Unsplash free tier: 50 requests/hour`);
  console.log(`Estimated time: ~${Math.ceil(tasks.length / 48)} hour(s)\n`);

  // Attribution log
  const attributions = [];
  let success = 0;
  let failed = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    process.stdout.write(`[${i + 1}/${tasks.length}] ${path.basename(task.file)} ... `);

    try {
      // Delete existing file first
      if (fs.existsSync(task.file)) {
        fs.unlinkSync(task.file);
      }

      const result = await searchAndDownload(task.query, task.file, task.orientation);
      console.log(`OK (by ${result.photographer})`);
      attributions.push({ file: task.file, photographer: result.photographer, url: result.url });
      success++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }

    // Small delay between requests
    await sleep(500);
  }

  // Save attributions (Unsplash requires attribution)
  const attrPath = path.join(OUTPUT_DIR, 'unsplash-attributions.json');
  fs.writeFileSync(attrPath, JSON.stringify(attributions, null, 2));

  console.log(`\n========================================`);
  console.log(`Done!`);
  console.log(`  Success: ${success}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Attributions saved to: ${attrPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
