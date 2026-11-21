import React, { ReactNode, useCallback, useMemo } from 'react';
import { useDispatch } from '../frontend-utils';
import { actions as appActions } from '../redux/app-feature';
import { CHANGELOG } from '../changelog';
import { ChangelogEntry } from '../bridge-types';

/**
 * Écran « Aide » intégré à la page, calqué sur design-preview/atmospheric.html.
 * Les ressources sont de vrais liens et les actions internes changent de vue :
 * aucune fenêtre popup n'est ouverte depuis cet écran.
 */
export default function HelpScreen() {
    const dispatch = useDispatch();

    const openSettings = useCallback(() => {
        dispatch(appActions.setMainView('SETTINGS'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dispatch]);

    const changelog = useMemo(() => {
        const entries = [...CHANGELOG];
        if (window.native?.wrapperChangelog) {
            main: for (const injection of window.native.wrapperChangelog) {
                if (injection.before === null) {
                    entries.push(injection.entry);
                } else {
                    for (let i = 0; i < entries.length; i++) {
                        if (entries[i].name === injection.before) {
                            entries.splice(i, 0, injection.entry);
                            continue main;
                        }
                    }
                }
            }
        }
        return entries;
    }, []);

    const changelogContent = useMemo(() => {
        const renderElement = (element: ChangelogEntry): ReactNode => {
            if (typeof element === 'string') return element;
            if (Array.isArray(element)) {
                return <>{element.map((entry, i) => <React.Fragment key={i}>{renderElement(entry)}</React.Fragment>)}</>;
            }
            if (element.type === 'code') return <code>{element.content}</code>;
            if (element.type === 'link') {
                const handler = element.clickHandler === 'openSettings' ? openSettings : undefined;
                return (
                    <a href={element.url ?? '#'} onClick={handler} target={element.url ? '_blank' : undefined} rel="noopener noreferrer">
                        {element.content}
                    </a>
                );
            }
            if (element.type === 'sublist') {
                return (
                    <>
                        {element.name}
                        {renderList(element.content)}
                    </>
                );
            }
            return null;
        };

        const renderList = (elements: ChangelogEntry[]) => (
            <ul>{elements.map((entry, i) => <li key={i}>{renderElement(entry)}</li>)}</ul>
        );

        return changelog.map((version) => (
            <section className="mdb-changelog-version" key={version.name}>
                <h4>{version.name}</h4>
                {renderList(version.contents)}
            </section>
        ));
    }, [changelog, openSettings]);

    return (
        <div className="mdb-help-screen">
            <div className="mdb-help-grid">
                <section className="mdb-card mdb-help-card">
                    <div className="mdb-eyebrow">Getting started</div>
                    <h2>Getting started guide</h2>
                    <p>Connect a NetMD recorder with a Chromium browser, add your files and start the recording.</p>
                    <a
                        className="mdb-help-link"
                        href="https://www.minidisc.wiki/guides/webminidisc"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Getting started guide
                    </a>
                    <button type="button" className="mdb-help-link" onClick={openSettings}>
                        Upload settings
                    </button>
                </section>

                <section className="mdb-card mdb-help-card">
                    <div className="mdb-eyebrow">Resources</div>
                    <h2>Help and community</h2>
                    <p>Documentation, frequently asked questions and links to the original projects.</p>
                    <a className="mdb-help-link" href="https://www.minidisc.wiki/guides/start" target="_blank" rel="noopener noreferrer">
                        FAQ
                    </a>
                    <a
                        className="mdb-help-link"
                        href="https://www.minidisc.wiki/guides/webminidisc"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Documentation
                    </a>
                    <a
                        className="mdb-help-link"
                        href="https://github.com/allscratch/MiniDiscBurner"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub
                    </a>
                    <a className="mdb-help-link" href="https://minidisc.wiki/discord" target="_blank" rel="noopener noreferrer">
                        Discord
                    </a>
                </section>

                <section className="mdb-card mdb-help-card">
                    <div className="mdb-eyebrow">About</div>
                    <h2>About MiniDiscBurner</h2>
                    <p>Personal fork of Web MiniDisc Pro 1.6.2, built on netmd-js and ElectronWMD.</p>
                    <a className="mdb-help-link" href="#mdb-about-credits">
                        About
                    </a>
                    <a className="mdb-help-link" href="#mdb-changelog-inline">
                        Changelog
                    </a>
                </section>
            </div>

            <section className="mdb-card mdb-help-credits" id="mdb-about-credits">
                Licence GPL‑2.0 · © Stefano Brilli et Asivery · LCDDot © BLackX 2008 · MiniDisc logo from Wikipedia · MiniDisc icon from Icons8.
                <br />
                Fork de Web MiniDisc Pro · Renderer asivery/webminidisc · Shell desktop asivery/ElectronWMD.
            </section>

            <section className="mdb-card mdb-help-changelog" id="mdb-changelog-inline">
                <h3 className="mdb-settings-title">Changelog</h3>
                <div className="mdb-changelog-inline">{changelogContent}</div>
            </section>
        </div>
    );
}
