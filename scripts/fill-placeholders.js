const fs = require('fs');
const path = require('path');
const vm = require('vm');

const OUTPUT_DIR = path.join(__dirname, '..', 'ai-images');
const OUTFIT_DIR = path.join(OUTPUT_DIR, 'outfits');
const ITEMS_DIR = path.join(OUTPUT_DIR, 'items');

const SITUATIONS = ['casual', 'commute', 'date', 'exercise'];
const CATEGORIES = ['veryHot', 'hot', 'warm', 'mild', 'cool', 'chilly', 'cold', 'veryCold', 'freezing'];
const GENDERS = ['male', 'female'];

const ITEM_LABELS = {
  beanie: 'Beanie',
  blazer: 'Blazer',
  blouse: 'Blouse',
  boots: 'Boots',
  cap: 'Cap',
  cardigan: 'Cardigan',
  chinos: 'Chinos',
  dress: 'Dress',
  dressShoes: 'Dress Shoes',
  earMuffs: 'Earmuffs',
  field_jacket: 'Field Jacket',
  fleece_leggings: 'Fleece Leggings',
  fleece_longSleeve: 'Fleece Top',
  fleece_pants: 'Fleece Pants',
  fleece_puffer: 'Fleece Puffer',
  fleece_slacks: 'Fleece Slacks',
  fleece_sweatshirt: 'Fleece Sweatshirt',
  fleece_training_pants: 'Training Pants',
  functional_longSleeve: 'Sport Top',
  functional_tshirt: 'Sport Tee',
  gloves: 'Gloves',
  heat_tech: 'Heat Tech',
  jacket: 'Jacket',
  jeans: 'Jeans',
  jumper: 'Jumper',
  knit: 'Knit Sweater',
  knit_tshirt: 'Knit Tee',
  knit_vest: 'Knit Vest',
  leather_jacket: 'Leather Jacket',
  leggings: 'Leggings',
  loafers: 'Loafers',
  longSleeve: 'Long Sleeve',
  neck_warmer: 'Neck Warmer',
  puffer: 'Puffer Coat',
  puffer_vest: 'Puffer Vest',
  sandals: 'Sandals',
  scarf: 'Scarf',
  shirt: 'Shirt',
  shorts: 'Shorts',
  skirt: 'Skirt',
  slacks: 'Slacks',
  sneakers: 'Sneakers',
  sunglasses: 'Sunglasses',
  sweatshirt: 'Sweatshirt',
  tanktop: 'Tank Top',
  training_jacket: 'Training Jacket',
  training_leggings: 'Training Leggings',
  training_pants: 'Training Pants',
  trenchCoat: 'Trench Coat',
  tshirt: 'T-Shirt',
  turtleneck: 'Turtleneck',
  windbreaker: 'Windbreaker',
  winterBoots: 'Winter Boots',
  woolCoat: 'Wool Coat',
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

async function downloadPlaceholder(url, filePath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch placeholder: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
}

async function createPlaceholder(filePath, text, width, height) {
  if (fs.existsSync(filePath)) {
    return { skipped: true };
  }

  const encodedText = encodeURIComponent(text);
  const url = `https://placehold.co/${width}x${height}/e2e8f0/475569/png?text=${encodedText}`;

  await downloadPlaceholder(url, filePath);
  return { skipped: false };
}

async function main() {
  ensureDir(OUTPUT_DIR);
  ensureDir(OUTFIT_DIR);
  ensureDir(ITEMS_DIR);

  const { genderedOutfitItems, situationItems } = loadOutfitData();

  let total = 0;
  let created = 0;
  let skipped = 0;

  for (const gender of GENDERS) {
    for (const situation of SITUATIONS) {
      for (const category of CATEGORIES) {
        // Outfit image
        const outfitPath = path.join(OUTFIT_DIR, gender, situation);
        ensureDir(outfitPath);
        const outfitFile = path.join(outfitPath, `${category}.png`);
        const outfitText = `${gender === 'male' ? 'Men' : 'Women'}\\n${situation}\\n${category}`;

        try {
          const result = await createPlaceholder(outfitFile, outfitText, 1024, 1536);
          total++;
          if (result.skipped) {
            skipped++;
          } else {
            created++;
            console.log(`Created: ${outfitFile}`);
          }
        } catch (err) {
          console.error(`Failed: ${outfitFile} - ${err.message}`);
        }

        // Item images
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
          const itemText = ITEM_LABELS[imgKey] || imgKey;

          try {
            const result = await createPlaceholder(itemFile, itemText, 1024, 1024);
            total++;
            if (result.skipped) {
              skipped++;
            } else {
              created++;
              console.log(`Created: ${itemFile}`);
            }
          } catch (err) {
            console.error(`Failed: ${itemFile} - ${err.message}`);
          }
        }
      }
    }
  }

  console.log(`\nDone! Created ${created} placeholders, skipped ${skipped} existing (${total} total).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
