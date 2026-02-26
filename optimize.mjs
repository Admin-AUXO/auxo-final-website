import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function optimizeImages(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await optimizeImages(filePath);
    } else if (file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png')) {
      const ext = path.extname(file);
      const webpPath = filePath.replace(new RegExp(`${ext}$`), '.webp');
      
      console.log(`Optimizing: ${file}`);
      
      try {
        await sharp(filePath)
          .resize({ width: 1920, withoutEnlargement: true }) // avoid gigantic images
          .webp({ quality: 75 })
          .toFile(webpPath);
        
        // Remove original file
        fs.unlinkSync(filePath);
        console.log(`Saved: ${path.basename(webpPath)}`);
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }
  }
}

(async () => {
  const startDir = path.join(process.cwd(), 'public/images');
  console.log(`Starting image optimization in ${startDir}...`);
  await optimizeImages(startDir);
  console.log('Done!');
})();
