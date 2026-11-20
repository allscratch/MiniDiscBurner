import React, { useCallback, useState } from 'react';
import { useDispatch, batchActions } from '../frontend-utils';
import { deleteService, pair } from '../redux/actions';

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
    } = useShallowEqualSelector((state) => state.appState);
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
                dispatch(pair(instance, getServiceSpec(availableServices[i])!));
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

    return (
        <React.Fragment>
            <div className="mdb-hero">
                <section className="mdb-card mdb-transfer-card">
                    <div className="mdb-eyebrow">Transfer studio</div>
                    <Typography component="h1" className="mdb-h1">
                        Transfer your music
                        <br />
                        to your MiniDisc.
                    </Typography>
                    <Typography component="p" className="mdb-lead">
                        Drop your files, choose the format and let MiniDiscBurner do the rest. Your recorder is ready.
                    </Typography>

                    {browserSupported ? (
                        <React.Fragment>
                            <button
                                type="button"
                                className="mdb-drop"
                                onClick={() => options[lastSelectedService]?.handler()}
                                disabled={connectingInProgress}
                            >
                                <div className="mdb-drop-icon" aria-hidden="true">↥</div>
                                <strong>Connect your recorder</strong>
                                <small>Select a model and press connect to begin</small>
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
                                    <span>First time here? Read the guide</span> <OpenInNewIcon fontSize="inherit" />
                                </Link>
                            </div>

                            <FormControl error={true} style={{ visibility: pairingFailed ? 'visible' : 'hidden' }}>
                                <FormHelperText>{pairingMessage}</FormHelperText>
                            </FormControl>
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
                                        <b>Notice for users of the Vivaldi web browser</b> <br />
                                    </Alert>
                                </Tooltip>
                            )}
                            <div className="mdb-formats">MP3 · WAV · FLAC · OGG · ATRAC · SP / LP2 / LP4 / HiMD</div>
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
                </section>

                <aside className="mdb-card mdb-device-card">
                    <h2 className="mdb-h2">Device</h2>
                    <div className="mdb-device-head">
                        <div className="mdb-disc" aria-hidden="true" />
                        <div>
                            <div className="mdb-device-name">NetMD recorder</div>
                            <div className="mdb-device-meta">WebUSB · Chromium / Edge</div>
                        </div>
                    </div>
                    <div className="mdb-meter-label">
                        <span>No device connected</span>
                        <strong>—</strong>
                    </div>
                    <div className="mdb-meter"><i /></div>
                    <div className="mdb-meter-label">
                        <span>Ready to connect</span>
                        <span>NetMD</span>
                    </div>
                    <div className="mdb-quick">
                        <button type="button" disabled><span aria-hidden="true">✎</span> Rename disc</button>
                        <button type="button" disabled><span aria-hidden="true">↻</span> Reload TOC</button>
                        <button type="button" disabled><span aria-hidden="true">⌫</span> Wipe disc</button>
                        <button type="button" disabled><span aria-hidden="true">⇩</span> Export CSV</button>
                    </div>
                </aside>
            </div>
            <SettingsDialog />
            <ManageEncodersDialog />
            <AboutDialog />
            <ChangelogDialog />
            <OtherDeviceDialog />
        </React.Fragment>
    );
};

export default Welcome;
