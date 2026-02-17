import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Quick and dirty regex to extract imageKeys from data/foods.ts
// We use regex to avoid needing to compile TS on the fly just for this check
function extractImageKeys(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /imageKey:\s*"([^"]+)"/g;
    const keys = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        keys.push(match[1]);
    }
    return keys;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const FOODS_FILE = path.join(projectRoot, 'data', 'foods.ts');
const IMAGES_DIR = path.join(projectRoot, 'public', 'images', 'foods');

console.log('🔍 Validating Image Consistency...');

// 1. Get all expected keys
if (!fs.existsSync(FOODS_FILE)) {
    console.error(`❌ Foods file not found at ${FOODS_FILE}`);
    process.exit(1);
}
const expectedKeys = extractImageKeys(FOODS_FILE);
console.log(`📋 Found ${expectedKeys.length} food items defined.`);

// 2. Get all actual files
if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Images directory not found at ${IMAGES_DIR}`);
    process.exit(1);
}
const files = fs.readdirSync(IMAGES_DIR);
const existingImages = new Set(files.filter(f => f.endsWith('.webp')));

// 3. Validate
const missingImages = [];
expectedKeys.forEach(key => {
    const expectedFilename = `${key}.webp`;
    if (!existingImages.has(expectedFilename)) {
        missingImages.push(key);
    }
});

if (missingImages.length > 0) {
    console.error('\n❌ MISSING IMAGES DETECTED:');
    console.error('The following imageKeys do not have a corresponding .webp file in public/images/foods/:');
    missingImages.forEach(key => console.error(`   - ${key}  (expected: ${key}.webp)`));
    console.error('\nBuild failed. Please add the missing images.');
    process.exit(1);
}

console.log('✅ All images present and accounted for.');
process.exit(0);
