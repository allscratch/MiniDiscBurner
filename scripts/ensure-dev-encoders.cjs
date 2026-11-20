const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Le serveur de développement doit servir un encoders.json valide : sans lui,
// Vite renvoie le HTML de l'application et l'interface démarre sans encodeur.
// Les artefacts générés sont volontairement ignorés par Git (voir .gitignore),
// donc on les reconstruit uniquement s'ils manquent.
const root = path.resolve(__dirname, '..');
const manifest = path.join(root, 'public', 'encoders.json');
const encoderDir = path.join(root, 'public', 'encoders');
const requiredEncoders = ['atracdenc.wme', 'remote-encoder.wme'];

const isReady =
    fs.existsSync(manifest) &&
    requiredEncoders.every((file) => fs.existsSync(path.join(encoderDir, file)));

if (isReady) {
    console.log('MiniDiscBurner: encodeurs de développement déjà présents.');
    process.exit(0);
}

console.log('MiniDiscBurner: préparation des encodeurs de développement...');
const result = spawnSync('npm', ['run', 'prepare-dev-encoders'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
});
process.exit(result.status ?? 1);
