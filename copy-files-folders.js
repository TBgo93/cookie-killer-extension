import { existsSync, statSync, mkdirSync, readdirSync, copyFileSync } from 'fs';
import { join } from 'path';

function copyRecursiveSync(src, dest) {
  const exists = existsSync(src);
  const stats = exists && statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (exists && isDirectory) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    readdirSync(src).forEach((file) => {
      copyRecursiveSync(join(src, file), join(dest, file));
    });
  } else if (exists) {
    copyFileSync(src, dest);
  }
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Uso: node script.js <sourcePath> <destinationPath>');
  process.exit(1);
}

const sourcePath = args[0];
const destinationPath = args[1];

if (!existsSync(sourcePath)) {
  console.error(`Error: La ruta de origen "${sourcePath}" no existe.`);
  process.exit(1);
}

copyRecursiveSync(sourcePath, destinationPath);
console.log(`Archivos copiados de ${sourcePath} a ${destinationPath}`);
