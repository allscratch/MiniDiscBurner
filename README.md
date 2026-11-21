# MiniDiscBurner

MiniDiscBurner est un fork personnel francophone de [Web MiniDisc Pro](https://github.com/asivery/webminidisc) (interface web) et d'[ElectronWMD](https://github.com/asivery/ElectronWMD) (application desktop), adapté pour un usage local avec un enregistreur **Sony MZ‑N707**.

Transférez de l'audio vers vos appareils MiniDisc **NetMD** et **HiMD** depuis un navigateur web ou depuis l'application desktop. L'encodage ATRAC est assuré par défaut par `atracdenc`, généré localement lors de la compilation ; un encodeur distant peut toujours être configuré manuellement.

- Interface web : [https://github.com/allscratch/MiniDiscBurner](https://github.com/allscratch/MiniDiscBurner)
- Application desktop : [https://github.com/allscratch/MiniDiscBurner-Desktop](https://github.com/allscratch/MiniDiscBurner-Desktop)
- Signaler un bug : [https://github.com/allscratch/MiniDiscBurner/issues](https://github.com/allscratch/MiniDiscBurner/issues)
- Contact : allscratch@outlook.com

> **WebUSB** nécessite un navigateur Chromium (Chrome, Edge, Brave…) et une origine sécurisée, par exemple `http://localhost:5173`. Un déploiement sur GitHub Pages ne permet pas d'utiliser WebUSB.

Guide utilisateur de référence : [MiniDisc Wiki](https://www.minidisc.wiki/guides/webminidisc/start).

## Prérequis

- un enregistreur NetMD ou HiMD ;
- un câble USB (souvent USB Mini‑B) ;
- un navigateur compatible WASM et WebUSB. Safari n'est pas pris en charge.

## Installation

### Application desktop (recommandé)

Téléchargez le paquet correspondant à votre architecture depuis [les releases de MiniDiscBurner-Desktop](https://github.com/allscratch/MiniDiscBurner-Desktop/releases). Sur macOS, si le système refuse l'ouverture, lancez `xattr -cr MiniDiscBurner.app` dans un terminal.

### Version web (développement)

```bash
npm install
npm start
```

Ouvrez ensuite `http://localhost:5173` dans un navigateur Chromium.

### Spécificités système

- **macOS** : aucun pilote n'est nécessaire pour le mode NetMD standard.
- **Linux** : suivez le [guide de préparation USB](https://www.minidisc.wiki/guides/webminidisc/requirements#linux) (droits sur le périphérique). Les versions « packagées » de Chromium peuvent poser problème ; voir le [guide correspondant](https://www.minidisc.wiki/guides/webminidisc/requirements#packaged_browsers).
- **Windows** : le pilote USB doit être installé avec des droits administrateur, généralement via [Zadig](https://zadig.akeo.ie/). Redémarrez le navigateur ensuite. Voir le [guide Windows](https://www.minidisc.wiki/guides/webminidisc/requirements#windows).
- **Chrome OS** : fonctionne sans configuration supplémentaire sur un compte personnel.

## Fonctionnalités

- Téléversement audio vers les appareils NetMD et HiMD ;
- lecture et gestion des pistes, reconnaissance de morceaux ;
- téléchargement des pistes depuis une platine Sony MZ‑RH1 ;
- prise en charge des encodeurs externes pour les modes LP ;
- mode homebrew (factory) sur les appareils pris en charge, grâce à [netmd-exploits](https://github.com/asivery/netmd-exploits/) ;
- connexion à un appareil distant via [Remote NetMD](https://github.com/asivery/remote-netmd-server).

## Développement

```bash
npm install       # --legacy-peer-deps peut être nécessaire
npm start         # serveur de développement
npm run build     # compilation de production
```

Les modules WASM sont fournis dans `public/`. Les instructions pour les reconstruire se trouvent dans `extra/`.

### Contribuer et signaler un bug

Les signalements et pull requests se font exclusivement sur [le dépôt MiniDiscBurner](https://github.com/allscratch/MiniDiscBurner/issues).

### Conditions de fork amont

Web MiniDisc Pro et ses prédécesseurs sont sous licence GPL. Le projet amont demande aux forks de :

- changer le nom et la description afin d'éviter toute confusion ;
- rediriger les liens de signalement de bugs vers leur propre dépôt ;
- retirer la référence au serveur d'encodage LP fourni par le projet MiniDisc Wiki, ou obtenir son autorisation.

MiniDiscBurner applique ces trois points : le serveur d'encodage LP fourni par le MiniDisc Wiki n'est plus proposé par défaut et l'encodeur local `atracdenc` est utilisé à la place.

## Licence et crédits

Licence **GPL‑2.0**. Crédits et notices d'origine conservés : © Stefano Brilli et Asivery · LCDDot © BLackX 2008.

- [FFmpeg](https://www.ffmpeg.org/) et [ffmpegjs](https://github.com/ffmpegjs/FFmpeg) — lecture des fichiers audio ;
- [Atracdenc](https://github.com/dcherednik/atracdenc/) — encodage ATRAC3 (LP2/LP4) ;
- [Emscripten](https://emscripten.org/) — exécution de FFmpeg et Atracdenc dans le navigateur ;
- [netmd-js](https://github.com/cybercase/netmd-js) — commandes NetMD en JavaScript ;
- [netmd-exploits](https://github.com/asivery/netmd-exploits/) — mode factory et téléchargement des pistes ;
- [netmd-tocmanip](https://github.com/asivery/netmd-tocmanip/) — manipulation de la table des matières ;
- [linux-minidisc](https://github.com/linux-minidisc/linux-minidisc) — base de netmd-js ;
- [Material UI](https://material-ui.com/) et [React95](https://react95.io/) — interfaces utilisateur.
