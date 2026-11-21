import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { batchActions, useDispatch } from '../frontend-utils';
import { forAnyDesktop, forWideDesktop, useShallowEqualSelector } from '../frontend-utils';

import { actions as appActions } from '../redux/app-feature';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';
import { CustomParameterRendered } from './custom-parameters-renderer';
import { CustomParameters, initializeParameters, isAllValid } from '../custom-parameters';
import { SettingInterface } from '../bridge-types';
import { LibraryServices } from '../services/library-services';
import { EncoderStorageManager } from '../services/audio/apiv1/dynamic-encoders';
import { AudioEncoderV1Metadata } from '../services/audio/apiv1/external-interface';
import serviceRegistry from '../services/registry';

function deepCompare<T>(a: T, b: T) {
    if (typeof a !== 'object') {
        return a === b;
    }
    if (Array.isArray(a)) {
        for (const e in a) {
            if (a[e] !== (b as any)[e]) return false;
        }
        return true;
    }
    for (const [k, v] of Object.entries(a as any)) {
        if (!deepCompare(v, (b as any)[k])) return false;
    }
    return true;
}

const useStyles = makeStyles()((theme) => ({
    wider: {
        minWidth: 150,
    },
    encoderDescription: {
        marginTop: theme.spacing(1),
        fontSize: 12,
        opacity: 0.75,
    },
    marginApply: {
        marginLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    noLeftMargin: {
        marginLeft: 0,
    },
    main: {
        [forAnyDesktop(theme)]: {
            height: 600,
        },
        [forWideDesktop(theme)]: {
            height: 700,
        },
    },
}));

/** Une ligne « paramètre » de la grille (libellé + contrôle), fidèle à la preview. */
const SimpleField = ({
    children,
    name,
    description,
    classes,
}: {
    name: string;
    children: ReactElement<any, any>;
    classes: ReturnType<typeof useStyles>['classes'];
    description?: string;
}) => {
    const row = (
        <div className="mdb-setting-row">
            <span className="mdb-setting-label">
                <b>{name}</b>
                {description ? <small>{description}</small> : null}
            </span>
            <span className="mdb-setting-control">{children}</span>
        </div>
    );
    return description ? <Tooltip title={description}>{row}</Tooltip> : row;
};

const NativeFields = ({ section, classes }: { section: string; classes: any }) => {
    if (!window.native?.getSettings) return <></>;

    const [settings, setSettings] = useState<SettingInterface[]>([]);
    const [_state, _updateState] = useState({});
    useEffect(() => {
        (async () => {
            const settings = await window.native!.getSettings!();
            setSettings(settings);
        })();
    }, [_state]);

    const filtered = settings.filter((e) => e.family === section);
    const updateState = () => _updateState({});

    return filtered.map((entry) => {
        if (entry.type === 'action') {
            return (
                <SimpleField name={entry.name} classes={classes} key={entry.family + entry.name}>
                    <Button onClick={() => entry.update(true)}>Go</Button>
                </SimpleField>
            );
        } else if (entry.type === 'boolean') {
            return (
                <SimpleField name={entry.name} classes={classes} key={entry.family + entry.name}>
                    <Switch checked={entry.state as boolean} onChange={(e) => entry.update(!entry.state).then(updateState)} />
                </SimpleField>
            );
        } else {
            return (
                <CustomParameterRendered
                    parameter={{
                        type: entry.type,
                        userFriendlyName: entry.name,
                        varName: entry.family + entry.name,
                    }}
                    values={{ [entry.family + entry.name]: entry.state }}
                    parameterChangeCallback={(_, nv) => entry.update(nv).then(updateState)}
                    customClass={classes.marginApply}
                />
            );
        }
    });
};

/**
 * Paramètres affichés directement dans la page (écran « Paramètres » de la
 * barre de navigation), comme dans la preview atmosphérique validée.
 * Toutes les options historiques de Web MiniDisc Pro sont conservées.
 */
export const SettingsContent = () => {
    const dispatch = useDispatch();
    const { classes } = useStyles();

    // Apparence
    const { colorTheme, vintageMode } = useShallowEqualSelector((state) => state.appState);

    // Fonctionnalités
    const { fullWidthSupport } = useShallowEqualSelector((state) => state.appState);
    const {
        archiveDiscCreateZip,
        factoryModeUseSlowerExploit,
        factoryModeShortcuts,
        factoryModeNERAWDownload,
        discProtectedDialogDisabled,
        manageEncodersDialogVisible,
    } = useShallowEqualSelector((state) => state.appState);

    // Encodage / bibliothèque
    const {
        audioExportServiceId: globalStateAudioExportServiceId,
        audioExportServiceConfig: globalStateAudioExportServiceConfig,
        libraryService: globalStateLibraryService,
        libraryServiceConfig: globalStateLibraryServiceConfig,
    } = useShallowEqualSelector((state) => state.appState);
    const [currentExportServiceId, setCurrentExportServiceId] = useState('');
    const [currentExportServiceConfig, setExportServiceConfig] = useState<CustomParameters>({});
    const [currentLibraryService, setCurrentLibraryService] = useState(globalStateLibraryService);
    const [currentLibraryServiceConfig, setLibraryServiceConfig] = useState(globalStateLibraryServiceConfig);
    const [availableEncoderServices, setAvailableEncoderServices] = useState<AudioEncoderV1Metadata[]>([]);
    const currentService =
        currentExportServiceId && EncoderStorageManager.INSTANCE.hasEncoder(currentExportServiceId)
            ? EncoderStorageManager.INSTANCE.getEncoderMetadata(currentExportServiceId)
            : null;
    const currentLibrary = LibraryServices[currentLibraryService ?? -1];

    const reloadAvailableEncodersList = useCallback(
        () => setAvailableEncoderServices(EncoderStorageManager.INSTANCE.listAvailableEncodersMetadata()),
        [setAvailableEncoderServices]
    );

    useEffect(() => {
        setCurrentExportServiceId(globalStateAudioExportServiceId ?? '');
        setExportServiceConfig(globalStateAudioExportServiceConfig);
        reloadAvailableEncodersList();
    }, [globalStateAudioExportServiceId, globalStateAudioExportServiceConfig]);

    useEffect(() => {
        if (EncoderStorageManager.INSTANCE) {
            reloadAvailableEncodersList();
        }
    }, [manageEncodersDialogVisible]);

    const applyAndStoreAudioServiceConfig = useCallback((serviceId: string | null, config: CustomParameters) => {
        if (!serviceId || !EncoderStorageManager.INSTANCE.hasEncoder(serviceId)) return;
        const service = EncoderStorageManager.INSTANCE.getEncoderMetadata(serviceId);
        if (service.customParameters) {
            if (!isAllValid(service.customParameters, config)) {
                return;
            }
        }

        dispatch(
            batchActions([
                appActions.setAudioExportServiceId(serviceId),
                appActions.setAudioExportServiceConfig(config),
            ])
        );

        serviceRegistry.audioExportService = EncoderStorageManager.INSTANCE.getEncoder(serviceId, config).instance;
    }, []);

    // Apparence
    const handleThemeChange = useCallback(
        (event: any) => dispatch(appActions.setDarkMode(event.target.value as any)),
        [dispatch]
    );
    const handleToggleVintageMode = useCallback(() => {
        dispatch(appActions.setVintageMode(!vintageMode));
    }, [dispatch, vintageMode]);

    // Fonctionnalités
    const handleToggleFullWidth = useCallback(() => {
        dispatch(appActions.setFullWidthSupport(!fullWidthSupport));
    }, [dispatch, fullWidthSupport]);
    const handleToggleDiscProtectedDialogDisabled = useCallback(() => {
        dispatch(appActions.disableDiscProtectedDialog(!discProtectedDialogDisabled));
    }, [dispatch, discProtectedDialogDisabled]);
    const handleToggleArchiveDiscCreateZip = useCallback(() => {
        dispatch(appActions.setArchiveDiscCreateZip(!archiveDiscCreateZip));
    }, [dispatch, archiveDiscCreateZip]);
    const handleToggleFactoryModeUseSlowerExploits = useCallback(() => {
        dispatch(appActions.setFactoryModeUseSlowerExploit(!factoryModeUseSlowerExploit));
    }, [dispatch, factoryModeUseSlowerExploit]);
    const handleToggleFactoryModeShortcuts = useCallback(() => {
        dispatch(appActions.setFactoryModeShortcuts(!factoryModeShortcuts));
    }, [dispatch, factoryModeShortcuts]);
    const handleToggleFactoryModeNERAWDownload = useCallback(() => {
        dispatch(appActions.setFactoryModeNERAWDownload(!factoryModeNERAWDownload));
    }, [dispatch, factoryModeNERAWDownload]);
    const showManageEncodersDialog = useCallback(() => {
        dispatch(appActions.showManageEncodersDialog(true));
    }, [dispatch]);

    // Encodage
    const handleExportServiceChanges = useCallback((event: any) => {
        const serviceId = event.target.value as string;
        setCurrentExportServiceId(serviceId);
        dispatch(appActions.setAudioExportServiceId(serviceId));
        if (!serviceId || !EncoderStorageManager.INSTANCE.hasEncoder(serviceId)) return;

        const metadata = EncoderStorageManager.INSTANCE.getEncoderMetadata(serviceId);
        const params = initializeParameters(metadata.customParameters);
        applyAndStoreAudioServiceConfig(serviceId, params);
        setExportServiceConfig(params);
    }, []);

    const handleExportServiceParameterChange = useCallback((varName: string, value: string | number | boolean) => {
        setExportServiceConfig((oldData) => {
            const newData = { ...oldData };
            newData[varName] = value;
            dispatch(appActions.setAudioExportServiceConfig(newData));
            return newData;
        });
    }, []);

    // Bibliothèque
    const handleLibraryServiceChanges = useCallback((event: any) => {
        const serviceId = event.target.value as number;
        setCurrentLibraryService(serviceId);
        if (serviceId === -1) return;
        setLibraryServiceConfig(initializeParameters(LibraryServices[serviceId].customParameters));
    }, []);

    const handleLibraryServiceParameterChange = useCallback((varName: string, value: string | number | boolean) => {
        setLibraryServiceConfig((oldData) => {
            const newData = { ...oldData };
            newData[varName] = value;
            return newData;
        });
    }, []);

    return (
        <div className="mdb-settings-grid">
            <section className="mdb-card mdb-settings-card">
                <h3 className="mdb-settings-title">Appearance</h3>
                <SimpleField name="Color theme" description="Light, dark or device theme" classes={classes}>
                    <Select className={classes.wider} value={colorTheme} onChange={handleThemeChange}>
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="system">Device Theme</MenuItem>
                    </Select>
                </SimpleField>
                <SimpleField name="Retro Mode (beta)" description="Windows 95-inspired vintage interface" classes={classes}>
                    <Switch checked={vintageMode} onChange={handleToggleVintageMode} />
                </SimpleField>
                <NativeFields classes={classes} section="Appearance" />
            </section>

            <section className="mdb-card mdb-settings-card">
                <h3 className="mdb-settings-title">Functionality</h3>
                <SimpleField
                    name="Enable full width title editing"
                    description="Hiragana and Kanji alphabets"
                    classes={classes}
                >
                    <Switch checked={fullWidthSupport} onChange={handleToggleFullWidth} />
                </SimpleField>
                <SimpleField
                    name="Enable disc-protected warning dialog"
                    description="Ask for confirmation before writing"
                    classes={classes}
                >
                    <Switch checked={!discProtectedDialogDisabled} onChange={handleToggleDiscProtectedDialogDisabled} />
                </SimpleField>
                <SimpleField
                    name="Create a ZIP file when using 'Archive Disc'"
                    description="May increase memory usage in homebrew mode"
                    classes={classes}
                >
                    <Switch checked={archiveDiscCreateZip} onChange={handleToggleArchiveDiscCreateZip} />
                </SimpleField>
                <SimpleField
                    name="Use the slower exploit for ATRAC ripping"
                    description="Fixes a lock-up on some Apple ARM Macs"
                    classes={classes}
                >
                    <Switch checked={factoryModeUseSlowerExploit} onChange={handleToggleFactoryModeUseSlowerExploits} />
                </SimpleField>
                <SimpleField
                    name="Enable homebrew mode shortcuts"
                    description="Quick access to homebrew features"
                    classes={classes}
                >
                    <Switch checked={factoryModeShortcuts} onChange={handleToggleFactoryModeShortcuts} />
                </SimpleField>
                <SimpleField
                    name="Download raw streams from netmd-exploits"
                    description="Expert feature: .NERAW files"
                    classes={classes}
                >
                    <Switch checked={factoryModeNERAWDownload} onChange={handleToggleFactoryModeNERAWDownload} />
                </SimpleField>
                <NativeFields classes={classes} section="Functionality" />
            </section>

            <section className="mdb-card mdb-settings-card">
                <h3 className="mdb-settings-title">Encoding</h3>
                <SimpleField name="Installed encoders" description="Local or remote encoder" classes={classes}>
                    <Button onClick={showManageEncodersDialog}>Manage</Button>
                </SimpleField>
                <SimpleField name="LP / HiMD encoder to use" description="Atracdenc or remote encoder" classes={classes}>
                    <Select className={classes.wider} value={currentExportServiceId} onChange={handleExportServiceChanges}>
                        {availableEncoderServices.map((n, i) => (
                            <MenuItem value={n.encoderId} key={`encoder-${i}`}>
                                {n.userFriendlyName}
                            </MenuItem>
                        ))}
                        {availableEncoderServices.length === 0 && (
                            <MenuItem disabled value="">
                                No encoders installed
                            </MenuItem>
                        )}
                    </Select>
                </SimpleField>
                {currentService && (
                    <>
                        <Typography className={classes.encoderDescription}>{currentService.metadata.description}</Typography>
                        <Typography className={classes.encoderDescription}>
                            Version {currentService.metadata.version}
                        </Typography>
                        <Box>
                            {currentService.customParameters?.map((n) => (
                                <CustomParameterRendered
                                    parameter={n}
                                    values={currentExportServiceConfig!}
                                    parameterChangeCallback={handleExportServiceParameterChange}
                                    customClass={classes.noLeftMargin}
                                />
                            ))}
                        </Box>
                    </>
                )}
                <NativeFields classes={classes} section="Encoding" />
            </section>

            <section className="mdb-card mdb-settings-card">
                <h3 className="mdb-settings-title">Library</h3>
                <SimpleField name="Library to use" description="Local files or remote library" classes={classes}>
                    <Select className={classes.wider} value={currentLibraryService} onChange={handleLibraryServiceChanges}>
                        <MenuItem value={-1} key="library-none">
                            None
                        </MenuItem>
                        {LibraryServices.map((n, i) => (
                            <MenuItem value={i} key={`lib-${i}`}>
                                {n.name}
                            </MenuItem>
                        ))}
                    </Select>
                </SimpleField>
                {currentLibrary && (
                    <>
                        <Typography className={classes.encoderDescription}>{currentLibrary.description}</Typography>
                        <Box>
                            {currentLibrary.customParameters?.map((n) => (
                                <CustomParameterRendered
                                    parameter={n}
                                    values={currentLibraryServiceConfig!}
                                    parameterChangeCallback={handleLibraryServiceParameterChange}
                                    customClass={classes.noLeftMargin}
                                />
                            ))}
                        </Box>
                    </>
                )}
                <SimpleField name="Version" description="MiniDiscBurner 1.0 · Web MiniDisc Pro 1.6.2" classes={classes}>
                    <span className="mdb-pill">GPL-2.0</span>
                </SimpleField>
            </section>
        </div>
    );
};
