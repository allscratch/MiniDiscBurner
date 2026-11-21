import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from '../frontend-utils';
import { actions as appActions, Views } from '../redux/app-feature';
import { disconnect, openLocalLibrary } from '../redux/actions';
import { setFrenchEnabled } from '../i18n/runtime';
import { TopMenu } from '../components/topmenu';

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

    const openStudio = useCallback(() => dispatch(appActions.setMainView('MAIN')), [dispatch]);
    const openSettings = useCallback(() => dispatch(appActions.setMainView('SETTINGS')), [dispatch]);
    const openLibrary = useCallback(() => dispatch(openLocalLibrary()), [dispatch]);
    const openHelp = useCallback(() => dispatch(appActions.setMainView('HELP')), [dispatch]);
    const handleDisconnect = useCallback(() => dispatch(disconnect()), [dispatch]);
    const goHome = useCallback(() => {
        if (view === 'FACTORY') {
            dispatch(appActions.setMainView('MAIN'));
        } else if (view === 'WELCOME') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Revenir à la carte Appareil sans perdre la session en cours.
            dispatch(appActions.returnToWelcome());
        }
    }, [dispatch, view]);

    return (
        <div className="mdb-topbar">
            <div className="mdb-brand">
                <span className="mdb-logo-box">
                    <img className="mdb-logo-img" src={`${import.meta.env.BASE_URL}mdb-logo.png`} alt="" />
                </span>
                MiniDiscBurner
            </div>
            <nav className="mdb-nav">
                <button type="button" className={'mdb-nav-item' + (view === 'WELCOME' ? ' active' : '')} onClick={goHome}>
                    Home
                </button>
                <button type="button" className={'mdb-nav-item' + (view === 'MAIN' ? ' active' : '')} onClick={openStudio}>
                    Studio
                </button>
                <button type="button" className="mdb-nav-item" onClick={openLibrary}>
                    Library
                </button>
                <button
                    type="button"
                    className={'mdb-nav-item' + (view === 'SETTINGS' ? ' active' : '')}
                    onClick={openSettings}
                >
                    Settings
                </button>
                <button
                    type="button"
                    className={'mdb-nav-item' + (view === 'HELP' ? ' active' : '')}
                    onClick={openHelp}
                >
                    Help
                </button>
            </nav>
            <div className="mdb-spacer" />
            <div className="mdb-pill">
                <span className={'mdb-dot' + (connected ? '' : ' off')} />
                {connected ? (
                    <>
                        <strong>{deviceName || 'Device'}</strong>{' connected'}
                    </>
                ) : (
                    'Please connect your device'
                )}
            </div>
            {connected && (
                <button type="button" className="mdb-pill mdb-disconnect" onClick={handleDisconnect} title="Close the USB session (recommended)">
                    Disconnect
                </button>
            )}
            <button type="button" className="mdb-pill mdb-lang" onClick={toggleLanguage} title="Language: French / English">
                {french ? 'FR' : 'EN'}
            </button>
            <div className="mdb-menu-slot">
                <TopMenu />
            </div>
        </div>
    );
}
