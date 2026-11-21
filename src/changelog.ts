import { ChangelogVersion } from "./bridge-types";

export const CHANGELOG: ChangelogVersion[] = [
    {
        name: "MiniDiscBurner 1.0",
        contents: [
            "Fork personnel de Web MiniDisc Pro 1.6.2",
            "Interface disponible en français",
            "Nouvelle identité visuelle et nouvelle icône",
        ],
    },
    {
        name: "Version 1.6.2",
        contents: [
            "Correction d’une condition de concurrence lors de la configuration de l’encodeur",
            "Meilleure prise en charge des Walkmans réseau",
            "Utilisation par défaut de l’exploit d’export ATRAC plus lent sur les machines MacOS",
        ],
    },
    {
        name: "Version 1.6.1",
        contents: [
            "Correction des encodeurs SP",
        ],
    },
    {
        name: "Version 1.6.0",
        contents: [
            "Séparation complète des encodeurs de l’application principale, permettant aux utilisateurs d’installer leurs propres encodeurs.",
            "Diverses corrections de bugs mineures",
        ],
    },
    {
        name: "Version 1.5.4",
        contents: [
            "Correction des allers-retours de recherche sur HiMD à chaque téléversement d’une piste",
            "Correction de la suppression des pistes groupées en HiMD",
        ],
    },
    {
        name: "Version 1.5.3",
        contents: [
            "Ajout de la possibilité de voir le temps / les octets utilisés sur le disque actuel",
            "Correction des workers HiMD",
            "Correction de l’extension incorrecte appliquée aux fichiers extraits",
        ],
    },
    {
        name: "Version 1.5.2",
        contents: [
            "Ajout de la possibilité de formater des MD en HiMD sur les appareils pris en charge",
            "Correction de la reconnaissance de morceaux",
            "Correction des problèmes de reconnaissance des codecs",
        ],
    },
    {
        name: "Version 1.5.1",
        contents: [
            "Passage à des calculs d’espace de stockage en octets pour HiMD",
            "Mise à jour des bibliothèques de prise en charge HiMD",
            "Correction de quelques problèmes de stabilité liés à l’encodeur distant",
            "Correction de quelques problèmes de reconnaissance des pistes",
            "Correction de la prise en charge des titres pleine largeur",
        ]
    },
    {
        name: "Version 1.5.0",
        contents: [
            "Refonte de l’interface - mise à jour de toutes les dépendances obsolètes",
            ["Une question ou une suggestion ? ", { type: 'link', url: 'mailto:allscratch@outlook.com', content: "Contactez-moi" }, " !"],
            "Déblocage du téléversement mono sur certains appareils non exploitables (platines Sony et quelques lecteurs portables Panasonic)",
            "Ajout d’un champ de nom d’appareil en mode homebrew",
            "Ajout de la gestion des erreurs irrécupérables",
            "Ajout de la prise en charge des bibliothèques distantes",
            {
                type: 'sublist',
                name: "Mise à jour vers himd-js 0.2.0",
                content: [
                    ["Passage de ", { type: 'code', content: "fatfs" }, " à ", { type: 'code', content: "nufatfs" }],
                    "Ajout de la prise en charge de la suppression de pistes en mode HiMD"
                ]
            },
            {
                type: 'sublist',
                name: "Mise à jour vers netmd-exploits 0.5.8",
                content: ["Amélioration de la compatibilité des exploits RH1"]
            },
            "Correction des incohérences de l’interface",
            "Correction de nombreux bugs concernant la communication avec Sharp et certains appareils Sony"
        ]
    },
    {
        name: "Version 1.4.2",
        contents: [
            {
                type: 'sublist',
                name: "Mise à jour vers netmd-exploits 0.5.4",
                content: ["Ajout de la prise en charge du téléversement SP MONO"]
            },
            {
                type: 'sublist',
                name: "Mise à jour vers himd-js 0.1.10",
                content: ["Ajout de la prise en charge de l’effacement des disques HiMD"]
            },
            "Ajout d’une fenêtre d’avertissement pour les disques protégés",
            "Ajout d’un raccourci vers l’accélération SP dans le menu Raccourcis homebrew"
        ]
    },
    {
        name: "Version 1.4.1",
        contents: [
            {
                type: 'sublist',
                name: "Mise à jour vers netmd-exploits 0.5.3",
                content: [
                    "Ajout de la prise en charge du mode HiMD complet pour Hn1.10A et Hn1.000",
                    "Ajout de la prise en charge du téléchargement ATRAC pour Hn1.10A et Hn1.000"
                ]
            },
            "Ajout de la prise en charge du téléversement des fichiers MKA",
            "Correction des fichiers MP3 téléversés vers HiMD toujours à 128kbps"
        ]
    },
    {
        name: "Version 1.4.0",
        contents: [
            {
                type: 'sublist',
                name: "Ajout de la prise en charge complète de HiMD",
                content: [
                    "Ajout de la prise en charge de la modification des métadonnées HiMD",
                    "Ajout de la prise en charge du téléchargement HiMD ATRAC3 / ATRAC3+ / LPCM / MP3",
                    "Ajout de la prise en charge du téléversement MP3 en HiMD"
                ]
            },
            {
                type: 'sublist',
                name: "Mise à jour vers netmd-exploits 0.5.1",
                content: [
                    "Ajout de la possibilité de télécharger des données ATRAC depuis des MD standard à l’aide de lecteurs portables HiMD",
                    "Ajout de la possibilité de téléverser des fichiers AEA vers les MD sur les appareils pris en charge",
                    "Correction de Tetris sur les lecteurs portables Sony classiques",
                    "(Espérons-le) Correction du bug d’inversion des canaux L/R"
                ]
            },
            "Ajout des raccourcis du mode homebrew dans l’interface principale",
            "Ajout d’un indicateur de progression dans le titre de l’onglet pendant le téléversement",
            "Ajout d’une option pour archiver les disques au format ZIP",
            "Ajout d’une option pour convertir automatiquement les pistes extraites en WAV",
            "Ajout d’une option pour supprimer TrProtect de tous les fichiers via le mode homebrew",
            "Ajout de l’export CSV à la commande d’archivage du disque",
            "Ajout du titre pleine largeur à la boîte de dialogue de progression du téléversement",
            "Ajout d’un avertissement lorsqu’un encodeur incomplet est utilisé",
            "Ajout d’une option pour renommer les pistes dans la boîte de dialogue de reconnaissance de morceaux",
            "Regroupement de tous les paramètres dans une seule boîte de dialogue",
            "Correction du tableau des horodatages en mode homebrew",
            "Correction de l’export CSV qui omettait le premier groupe si toutes les pistes sont groupées",
            "Correction de la modification du titre du disque qui restait possible même si le disque était protégé en écriture",
            "Correction de l’ordre incorrect lors du téléversement de pistes LP2 et LP4 préencodées",
            "Correction de l’absence du titre d’origine d’un morceau dans la boîte de dialogue de reconnaissance, lorsqu’il avait été nettoyé"
        ]
    },
    {
        name: "Version 1.3.2",
        contents: [
            "Annulation de la version 1.3.1",
            "Extraction Type-R nettement plus stable, suppression des avertissements Type-R et réactivation de la reconnaissance de morceaux basée sur les exploits pour les appareils Type-R",
            [
                "Correction des encodeurs externes exigeant le chemin racine dans l’URL (ticket ",
                { type: 'link', url: "https://github.com/allscratch/MiniDiscBurner/issues", content: "#11" },
                ")"
            ],
            [
                "Correction de la suppression des informations SCMS (ticket ",
                { type: 'link', url: "https://github.com/cybercase/webminidisc/issues/110", content: "#110" },
                ")"
            ]
        ]
    },
    {
        name: "Version 1.3.1",
        contents: [
            "Désactivation des routines d’écriture EEPROM lors de l’entrée en mode homebrew sur les appareils Type-R",
            "[Temporaire] Désactivation de la reconnaissance de pistes basée sur les exploits pour les appareils Type-R"
        ]
    },
    {
        name: "Version 1.3.0",
        contents: [
            "Renommage du « mode usine » en « mode homebrew »",
            "Ajout de la normalisation des pistes",
            [
                "Ajout de la possibilité d’utiliser un ",
                { type: 'link', clickHandler: 'openSettings', content: "encodeur LP haute qualité" }
            ],
            "Ajout de la reconnaissance de morceaux",
            "Ajout de l’importation et de l’exportation des listes de pistes CSV",
            "Ajout de la prise en charge de ReplayGain",
            "Ajout de l’affichage du temps restant dans la boîte de dialogue de conversion",
            "Ajout de la possibilité d’exporter et d’importer les listes de pistes des disques vers des fichiers CSV",
            "Correction de l’enregistrement des pistes depuis l’entrée ligne",
            {
                type: 'sublist',
                name: "Mise à jour vers netmd-exploits 0.4.0",
                content: [
                    "Ajout du transfert ATRAC en lot via USB (accélération du transfert SP d’environ 1,1x à environ 3x)",
                    "Ajout de la prise en charge du transfert ATRAC basé sur IRQ pour les appareils Type-R",
                    "Ajout de la prise en charge de la modification et du clonage directs de la TOC pour les appareils Type-R",
                    [
                        "Désactivation de Tetris en raison d’un bug suspecté (si vous avez essayé de lancer Tetris et ne pouvez plus téléverser de pistes, veuillez me contacter)"
                    ],
                    "Ajout de la possibilité de forcer un appareil 2x à enregistrer en SP à 4x"
                ]
            },
            {
                type: 'sublist',
                name: "Mise à jour vers netmd-js 4.1.0",
                content: ["Accélération du chiffrement"]
            }
        ]
    },
    {
        name: "Version 1.2.2",
        contents: [
            "Ajout d’un bouton pour activer l’extraction ATRAC dans l’interface principale.",
            "Corrections de bugs de l’extraction ATRAC et meilleure compatibilité."
        ]
    },
    {
        name: "Version 1.2.1",
        contents: [
            "Meilleure dénomination du mode usine",
            "Correction d’un bug dans la détection automatique ATRAC"
        ]
    },
    {
        name: "Version 1.2.0",
        contents: [
            {
                type: 'sublist',
                name: "Ajout de la prise en charge du mode usine pour les lecteurs portables Sony. Il est accessible depuis le menu des points de suspension",
                content: [
                    "Ajout de la possibilité de transférer de la musique de NetMD vers le PC via USB",
                    "Ajout de la possibilité de modifier la ToC octet par octet",
                    "Ajout de la possibilité de télécharger et de téléverser la ToC",
                    "Ajout de la possibilité d’extraire la RAM et la ROM des appareils",
                    "Ajout de la possibilité de charger et de jouer à Tetris (merci Sir68k !)"
                ]
            },
            "Ajout de la détection automatique ATRAC3 (pour les WAV et les OMA)",
            "Meilleure prise en charge des chaînes hi-fi",
            "Correction des limites de longueur des titres",
            "Correction du bug de corruption des titres"
        ]
    },
    {
        name: "Version 1.1.1",
        contents: [
            "Prévention de la mise en veille pendant le téléversement des pistes",
            "Correction de quelques petits bugs"
        ]
    },
    {
        name: "Version 1.1.0",
        contents: [
            "Meilleure prise en charge des appareils Kenwood NetMD",
            "Ajout de la possibilité d’éjecter et de changer le disque",
            "Correction de quelques bugs de blocage du téléversement"
        ]
    },
    {
        name: "Version 0.3.0",
        contents: [
            [
                "Ajout de la prise en charge de ",
                { type: 'link', url: "https://github.com/asivery/remote-netmd-server", content: "NetMD distant" }
            ],
            "Correction de nombreux bugs concernant le téléversement NetMD et les LAM Sony",
            "Ajout de la prise en charge du téléchargement des pistes via NetMD depuis l’enregistreur Sony MZ-RH1",
            "Nombreuses modifications de programmation"
        ]
    },
    {
        name: "Version 0.2.4",
        contents: [
            "Ajout de la boîte de dialogue du journal des modifications",
            "Ajout d’un auto-test de base",
            [
                "Ajout de la prise en charge complète des appareils Sony de la série LAM (ticket ",
                { type: 'link', url: "https://github.com/cybercase/webminidisc/issues/29", content: "#29" },
                ", ",
                { type: 'link', url: "https://github.com/cybercase/webminidisc/issues/60", content: "#60" },
                ")"
            ],
            {
                type: 'sublist',
                name: 'Refonte de la boîte de dialogue de conversion',
                content: [
                    "Ajout de la possibilité de renommer les pistes avant de les envoyer à l’enregistreur",
                    "Ajout d’un aperçu en direct des titres des pistes selon le format sélectionné",
                    ["Ajout d’un avertissement lors de l’utilisation d’un trop grand nombre de caractères (ticket ", { type: 'link', url: "https://github.com/cybercase/webminidisc/issues/66", content: "#66"}, ")"]
                ]
            }
        ]
    }
];
