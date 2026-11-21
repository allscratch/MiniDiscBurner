import React, { useCallback, useState } from 'react';
import { useDispatch, batchActions } from '../frontend-utils';
import { deleteService, disconnect, pair } from '../redux/actions';

import { useShallowEqualSelector } from '../frontend-utils';

import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';

import { Delete as DeleteIcon } from '@mui/icons-material'
import { Add as AddIcon } from '@mui/icons-material'
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material'

import ChromeIconPath from '../images/chrome-icon.svg';
import { W95Welcome } from './win95/welcome';

import SplitButton, { OptionType } from './split-button';
import {
    createService,
    doesServiceRequireChrome,
    getConnectButtonName,
    getServiceSpec,
    getSimpleServices,
    Services,
} from '../services/interface-service-manager';

import { OtherDeviceDialog } from './other-device-dialog';
import { SettingsDialog } from './settings-dialog';
import { ChangelogDialog } from './changelog-dialog';
import { AboutDialog } from './about-dialog';

import { actions as otherDialogActions } from '../redux/other-device-feature';
import { actions as appActions } from '../redux/app-feature';
import { initializeParameters } from '../custom-parameters';
import { ManageEncodersDialog } from './manage-encoders-dialog';
import serviceRegistry from '../services/registry';
import { getDefaultCodecName } from '../services/interfaces/netmd';
import { bytesToHumanReadable, formatTimeFromSeconds } from '../utils';

const useStyles = makeStyles()((theme) => ({
    main: {
        position: 'relative',
        flex: '1 1 auto',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
    buttonBox: {
        marginTop: theme.spacing(3),
        minWidth: 200,
    },
    deleteButton: {
        width: theme.spacing(2),
        height: theme.spacing(2),
        verticalAlign: 'middle',
        marginLeft: theme.spacing(-0.5),
        marginRight: theme.spacing(1.5),
    },
    standardOption: {
        marginLeft: theme.spacing(3),
    },
    spacing: {
        marginTop: theme.spacing(1),
    },
    notice: {
        marginTop: theme.spacing(2),
        backgroundColor: 'unset',
    },
    chromeLogo: {
        marginTop: theme.spacing(1),
        width: 96,
        height: 96,
    },
    why: {
        alignSelf: 'flex-start',
        marginTop: theme.spacing(3),
    },
    headBox: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    connectContainer: {
        flex: '1 1 auto',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
    supportContainer: {
        flex: '1 1 auto',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
}));

const MINIDISC_PHOTO = `${import.meta.env.BASE_URL}minidisc-photo.jpg`;

/** Petit indicateur d'étape, purement décoratif. */
function StepIndicator({ active }: { active: 1 | 2 }) {
    return (
        <div className="mdb-steps" aria-hidden="true">
            <span className={'mdb-step' + (active === 1 ? ' active' : '')} />
            <span className={'mdb-step' + (active === 2 ? ' active' : '')} />
        </div>
    );
}

/** Carte photo du MiniDisc, commune aux deux états de l'accueil. */
function MiniDiscVisual() {
    return (
        <div className="mdb-visual" aria-hidden="true">
            <span className="mdb-deco mdb-deco-a" />
            <span className="mdb-deco mdb-deco-b" />
            <div className="mdb-photo-card">
                <img src={MINIDISC_PHOTO} alt="" />
                <div className="mdb-photo-caption"><span className="mdb-caption-dot" /> MiniDisc · 64 mm</div>
            </div>
        </div>
    );
}

export const Welcome = (props: {}) => {
    const { classes } = useStyles();
    const dispatch = useDispatch();
    const {
        browserSupported,
        runningChrome,
        availableServices,
        pairingFailed,
        pairingMessage,
        vintageMode,
        lastSelectedService,
        connectingInProgress,
        deviceConnected,
    } = useShallowEqualSelector((state) => state.appState);
    const { deviceName, disc } = useShallowEqualSelector((state) => state.main);
    const simpleServicesLength = getSimpleServices().length;
    if (pairingMessage.toLowerCase().match(/denied/)) {
        // show linux instructions
    }
    // Access denied.

    const deleteCustom = useCallback(
        (event: React.SyntheticEvent, index: number) => {
            event.stopPropagation();
            dispatch(deleteService(index));
        },
        [dispatch]
    );

    const [showWhyUnsupported, setWhyUnsupported] = useState(false);
    const handleLearnWhy = (event: React.SyntheticEvent) => {
        event.preventDefault();
        setWhyUnsupported(true);
    };

    const forceContinue = (event: React.SyntheticEvent) => {
        event.preventDefault();
        dispatch(appActions.setBrowserSupported(true));
    };

    const handleOpenStudio = useCallback(() => dispatch(appActions.setMainView('MAIN')), [dispatch]);
    const handleDisconnect = useCallback(() => dispatch(disconnect()), [dispatch]);

    if (vintageMode) {
        const p = {
            dispatch,
            pairingFailed,
            pairingMessage,
            createService: () => createService(availableServices[lastSelectedService]) ?? null,
            spec: getServiceSpec(availableServices[lastSelectedService])!,
            connectName: getConnectButtonName(availableServices[lastSelectedService]),
        };
        return <W95Welcome {...p}></W95Welcome>;
    }

    const options: OptionType[] = availableServices.map((n, i) => ({
        name: getConnectButtonName(n),
        switchTo: true,
        handler: () => {
            const instance = createService(availableServices[i]);
            if (instance) {
                dispatch(appActions.setLastSelectedService(i));
                dispatch(pair(instance, getServiceSpec(availableServices[i])!, false));
            }
        },
        id: i,
        disabled: !runningChrome && doesServiceRequireChrome(availableServices[i]),
    }));

    const firstService = Services.find((n) => n.customParameters);
    if (firstService) {
        options.push({
            name: 'Add Custom Device',
            switchTo: false,
            handler: () =>
                dispatch(
                    batchActions([
                        otherDialogActions.setVisible(true),
                        otherDialogActions.setSelectedServiceIndex(0),
                        otherDialogActions.setCustomParameters(initializeParameters(firstService.customParameters)),
                    ])
                ),
            customAddIcon: true,
        });
    }

    const mapToEntry = (option: OptionType) => {
        return option.id >= simpleServicesLength ? (
            <React.Fragment>
                <IconButton aria-label="delete" className={classes.deleteButton} size="small" onClick={(e) => deleteCustom(e, option.id)}>
                    <DeleteIcon />
                </IconButton>
                {option.name}
            </React.Fragment>
        ) : option.customAddIcon ? (
            <React.Fragment>
                <IconButton aria-label="add custom device" className={classes.deleteButton} size="small">
                    <AddIcon />
                </IconButton>
                {option.name}
            </React.Fragment>
        ) : (
            <span className={classes.standardOption}>{option.name}</span>
        );
    };

    const minidiscSpec = serviceRegistry.netmdSpec;
    const usedPercent = disc && disc.total > 0 ? Math.round(((disc.total - disc.left) * 100) / disc.total) : 0;
    const usesTimeCapacity = minidiscSpec?.measurementUnits === 'frames';
    const capacityMinutes = usesTimeCapacity && disc ? Math.round(disc.total / 60) : 0;
    const nominalCapacity = [60, 74, 80].reduce(
        (closest, value) => (Math.abs(value - capacityMinutes) < Math.abs(closest - capacityMinutes) ? value : closest),
        80
    );
    const capacityLabel = !disc
        ? 'No disc loaded'
        : usesTimeCapacity
        ? `≈ ${nominalCapacity} min (SP) · ${nominalCapacity * 2} min (LP2) · ${nominalCapacity * 4} min (LP4)`
        : bytesToHumanReadable(disc.total);
    const remainingLabel = !disc
        ? '—'
        : usesTimeCapacity
        ? `${formatTimeFromSeconds(disc.left)} remaining`
        : `${bytesToHumanReadable(disc.left)} remaining`;
    const codecLabel = minidiscSpec ? getDefaultCodecName(minidiscSpec) : 'SP';

    return (
        <React.Fragment>
            {deviceConnected ? (
                <div className="mdb-hero mdb-hero-single">
                    <section className="mdb-card mdb-device-card">
                        <MiniDiscVisual />
                        <div className="mdb-card-content">
                        <div className="mdb-section-head">
                            <div className="mdb-eyebrow">Step 2 · Device</div>
                            <StepIndicator active={2} />
                        </div>
                        <div className="mdb-device-head">
                            <div className="mdb-disc" aria-hidden="true" />
                            <div>
                                <div className="mdb-device-name">{deviceName || 'NetMD recorder'}</div>
                                <div className="mdb-device-meta"><span className="mdb-badge">READY</span> NetMD · USB</div>
                            </div>
                        </div>
                        <div className="mdb-meter-label">
                            <span>Disc space used</span>
                            <strong>{disc ? `${usedPercent} %` : '—'}</strong>
                        </div>
                        <div className="mdb-meter"><i style={{ width: `${usedPercent}%` }} /></div>
                        <div className="mdb-meter-label">
                            <span>{remainingLabel}</span>
                            <span>{codecLabel} · {capacityLabel}</span>
                        </div>
                        <div className="mdb-device-status">
                            {disc ? (disc.writeProtected ? 'Write protected disc' : 'Disc ready · TOC loaded') : 'No disc loaded'}
                        </div>
                        <div className="mdb-device-actions">
                            <button type="button" className="mdb-btn" onClick={handleOpenStudio}>
                                Open transfer studio
                            </button>
                            <button type="button" className="mdb-btn mdb-btn-danger" onClick={handleDisconnect}>
                                Disconnect
                            </button>
                        </div>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="mdb-hero mdb-hero-single">
                    <section className="mdb-card mdb-transfer-card">
                        <MiniDiscVisual />
                        <div className="mdb-card-content">
                        <div className="mdb-section-head">
                            <div className="mdb-eyebrow">Step 1 · Connection</div>
                            <StepIndicator active={1} />
                        </div>
                        <Typography component="h1" className="mdb-h1">
                            Your music, <span className="mdb-accent-text">on MiniDisc.</span>
                            <br />Finally simple.
                        </Typography>
                        <Typography component="p" className="mdb-lead">
                            Connect your NetMD recorder, choose your tracks and let MiniDiscBurner take care of the rest. A clear interface, from the first click to the final recording.
                        </Typography>

                        {browserSupported ? (
                            <React.Fragment>
                                <div className="mdb-actions">
                                    <button
                                        type="button"
                                        className="mdb-drop"
                                        onClick={() => options[lastSelectedService]?.handler()}
                                        disabled={connectingInProgress}
                                    >
                                        <span className="mdb-drop-icon" aria-hidden="true">⌁</span>
                                        <strong>Connect a NetMD device</strong>
                                        <small>WebUSB · Chromium / Edge / Brave</small>
                                    </button>

                                    <div className="mdb-row">
                                        <SplitButton
                                            options={options}
                                            color="primary"
                                            width={200}
                                            disabled={doesServiceRequireChrome(availableServices[lastSelectedService]) && !runningChrome}
                                            selectedIndex={lastSelectedService}
                                            dropdownMapping={mapToEntry}
                                            loading={connectingInProgress}
                                        />
                                        <Link
                                            className="mdb-btn mdb-btn-ghost"
                                            rel="noopener noreferrer"
                                            target="_blank"
                                            href="https://www.minidisc.wiki/guides/webminidisc"
                                        >
                                            <span>Getting started guide</span> <OpenInNewIcon fontSize="inherit" />
                                        </Link>
                                    </div>
                                </div>

                                {pairingFailed && (
                                    <FormControl error={true}>
                                        <FormHelperText>{pairingMessage}</FormHelperText>
                                    </FormControl>
                                )}
                                {!window.native?.interface && (
                                    <Tooltip
                                        title={
                                            <span>
                                                Vivaldi's implementation of WebUSB is broken.
                                                <br />
                                                If you are using Vivaldi, most of this app's features will be broken.
                                                <br />
                                                Please switch to a different Chromium-based browser.
                                            </span>
                                        }
                                    >
                                        <Alert severity="info" className={classes.notice}>
                                            <b>Notice for users of the Vivaldi web browser</b>
                                        </Alert>
                                    </Tooltip>
                                )}
                                <div className="mdb-features">
                                    <span className="mdb-feature"><b>01</b> WebUSB</span>
                                    <span className="mdb-feature"><b>02</b> Local encoding</span>
                                    <span className="mdb-feature"><b>03</b> SP · LP2 · LP4</span>
                                </div>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Typography component="h2" variant="subtitle1">
                                    This Web browser is not supported.&nbsp;
                                    <Link rel="noopener noreferrer" href="#" onClick={handleLearnWhy}>
                                        Learn Why
                                    </Link>
                                </Typography>

                                <Link rel="noopener noreferrer" target="_blank" href="https://www.google.com/chrome/">
                                    <img alt="Chrome Logo" src={ChromeIconPath} className={classes.chromeLogo} />
                                </Link>

                                <Typography component="h2" variant="subtitle1">
                                    Try using{' '}
                                    <Link rel="noopener noreferrer" target="_blank" href="https://www.google.com/chrome/">
                                        Chrome
                                    </Link>{' '}
                                    instead
                                </Typography>

                                <Typography component="p" variant="subtitle1">
                                    If you want to connect to a remote device, click{' '}
                                    <Link rel="noopener noreferrer" href="#" onClick={forceContinue}>
                                        here
                                    </Link>{' '}
                                    to load the app anyway.
                                </Typography>

                                {showWhyUnsupported ? (
                                    <>
                                        <Typography component="p" variant="body2" className={classes.why}>
                                            MiniDiscBurner requires a browser that supports both{' '}
                                            <Link rel="noopener noreferrer" target="_blank" href="https://wicg.github.io/webusb/">
                                                WebUSB
                                            </Link>{' '}
                                            and{' '}
                                            <Link rel="noopener noreferrer" target="_blank" href="https://webassembly.org/">
                                                WebAssembly
                                            </Link>
                                            .
                                        </Typography>
                                        <ul>
                                            <li>WebUSB is needed to control the NetMD device via the USB connection to your computer.</li>
                                            <li>WebAssembly is used to convert the music to a MiniDisc compatible format</li>
                                        </ul>
                                    </>
                                ) : null}
                            </React.Fragment>
                        )}
                        </div>
                    </section>
                </div>
            )}
            <SettingsDialog />
            <ManageEncodersDialog />
            <AboutDialog />
            <ChangelogDialog />
            <OtherDeviceDialog />
        </React.Fragment>
    );
};

export default Welcome;
