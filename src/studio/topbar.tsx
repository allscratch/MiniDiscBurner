import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from '../frontend-utils';
import { actions as appActions, Views } from '../redux/app-feature';
import { openLocalLibrary } from '../redux/actions';
import { setFrenchEnabled } from '../i18n/runtime';
import { TopMenu } from '../components/topmenu';

const GUIDE_URL = 'https://www.minidisc.wiki/guides/webminidisc';
const LANGUAGE_EVENT = 'mdb-language-change';

function readFrench(): boolean {
    try {
        return localStorage.getItem('mdb-language') !== 'en';
    } catch {
        return true;
    }
}

/** Barre supérieure du design « Studio », avec le menu d'actions d'origine. */
export function StudioTopbar({
    view,
    deviceName,
    connected,
}: {
    view: Views;
    deviceName: string;
    connected: boolean;
}) {
    const dispatch = useDispatch();
    const [french, setFrench] = useState(readFrench);

    useEffect(() => {
        const sync = (event: Event) => setFrench((event as CustomEvent<boolean>).detail);
        window.addEventListener(LANGUAGE_EVENT, sync);
        return () => window.removeEventListener(LANGUAGE_EVENT, sync);
    }, []);

    const toggleLanguage = useCallback(() => {
        const next = !french;
        setFrench(next);
        setFrenchEnabled(next);
        window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: next }));
    }, [french]);

    const openSettings = useCallback(() => dispatch(appActions.showSettingsDialog(true)), [dispatch]);
    const openLibrary = useCallback(() => dispatch(openLocalLibrary()), [dispatch]);
    const openHelp = useCallback(() => window.open(GUIDE_URL, '_blank', 'noopener,noreferrer'), []);
    const goHome = useCallback(() => {
        if (view === 'FACTORY') {
            dispatch(appActions.setMainView('MAIN'));
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [dispatch, view]);

    return (
        <div className="mdb-topbar">
            <div className="mdb-brand">
                <span className="mdb-logo" aria-hidden="true">◉</span>
                MiniDiscBurner
            </div>
            <nav className="mdb-nav">
                <button type="button" className={'mdb-nav-item' + (view === 'WELCOME' ? ' active' : '')} onClick={goHome}>
                    Home
                </button>
                <button type="button" className="mdb-nav-item" onClick={openLibrary}>
                    Library
                </button>
                <button type="button" className="mdb-nav-item" onClick={openSettings}>
                    Settings
                </button>
                <button type="button" className="mdb-nav-item" onClick={openHelp}>
                    Help
                </button>
            </nav>
            <div className="mdb-spacer" />
            <div className="mdb-pill">
                <span className={'mdb-dot' + (connected ? '' : ' off')} />
                {connected ? (
                    <>
                        <strong>{deviceName || 'Appareil'}</strong> connecté
                    </>
                ) : (
                    'No device connected'
                )}
            </div>
            <button type="button" className="mdb-pill mdb-lang" onClick={toggleLanguage} title="Langue : Français / English">
                {french ? 'FR' : 'EN'}
            </button>
            <div className="mdb-menu-slot">
                <TopMenu />
            </div>
        </div>
    );
}
