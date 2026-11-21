import React from 'react';
import { SettingsContent } from '../components/settings-dialog';

/** Écran « Paramètres » intégré à la page (plus de boîte modale). */
export default function SettingsScreen() {
    return (
        <div className="mdb-settings-screen">
            <SettingsContent />
        </div>
    );
}
