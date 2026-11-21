import React from 'react';

// Décor « coucher de soleil » inspiré de la charte Countertop (atmospheric.png).
// Purement décoratif : aucun élément n'est interactif ni annoncé aux lecteurs d'écran.
const LEAVES = [
    { left: '6%', duration: 17, delay: -3, size: 13 },
    { left: '14%', duration: 22, delay: -11, size: 9 },
    { left: '27%', duration: 19, delay: -6, size: 12 },
    { left: '38%', duration: 25, delay: -16, size: 10 },
    { left: '51%', duration: 21, delay: -9, size: 13 },
    { left: '63%', duration: 18, delay: -2, size: 11 },
    { left: '74%', duration: 24, delay: -13, size: 12 },
    { left: '86%', duration: 20, delay: -7, size: 9 },
    { left: '94%', duration: 23, delay: -18, size: 13 },
];

const SWATCHES = [
    { color: '#4e4b78', label: '#4E4B78 · nuit' },
    { color: '#91595c', label: '#91595C · crépuscule' },
    { color: '#d5974d', label: '#D5974D · coucher' },
    { color: '#ffc850', label: '#FFC850 · soleil' },
    { color: '#fbeada', label: '#FBEADA · crème' },
    { color: '#1d1617', label: '#1D1617 · terre' },
];

const photoStyle = {
    '--mdb-atmosphere-photo': `url("${import.meta.env.BASE_URL}minidisc-photo.jpg")`,
} as React.CSSProperties;

export const AtmosphereBackdrop = () => (
    <div className="mdb-atmosphere" aria-hidden="true">
        <div className="mdb-atmosphere-photo" style={photoStyle} />
        <div className="mdb-atmosphere-veil" />
        <div className="mdb-atmosphere-grain" />
        {LEAVES.map((leaf, index) => (
            <span
                key={index}
                className="mdb-atmosphere-leaf"
                style={{
                    left: leaf.left,
                    width: leaf.size,
                    height: Math.round(leaf.size * 1.45),
                    animationDuration: `${leaf.duration}s`,
                    animationDelay: `${leaf.delay}s`,
                }}
            />
        ))}
    </div>
);

/** Bandeau d'échantillons repris de la preview atmosphérique. */
export const AtmosphereSwatches = () => (
    <div className="mdb-swatches" role="img" aria-label="Palette atmosphérique">
        {SWATCHES.map((swatch) => (
            <div className="mdb-swatch" key={swatch.color}>
                <i className="mdb-swatch-color" style={{ background: swatch.color }} />
                <span className="mdb-swatch-label">{swatch.label}</span>
            </div>
        ))}
    </div>
);
