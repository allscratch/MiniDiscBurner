import React, { useMemo, lazy, Suspense, useEffect } from 'react';
import { belowDesktop, forAnyDesktop, forWideDesktop, useDispatch, useShallowEqualSelector, useThemeDetector } from '../frontend-utils';

import CssBaseline from '@mui/material/CssBaseline';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { W95App } from './win95/app';
import { validateAndLoadEncoders } from '../redux/actions';
import { EncoderDownloadDialog } from './encoder-download-dialog';
import { StudioTopbar } from '../studio/topbar';
import { AtmosphereBackdrop, AtmosphereSwatches } from '../studio/atmosphere';
import SettingsScreen from '../studio/settings-screen';
import HelpScreen from '../studio/help-screen';
import '../studio/studio.css';
import '../studio/atmosphere.css';
import '../studio/settings.css';
import '../studio/preview-fidelity.css';

const Toc = lazy(() => import('./factory/factory'));
const Controls = lazy(() => import('./controls'));
const Welcome = lazy(() => import('./welcome'));
const Main = lazy(() => import('./main'));
const useStyles = makeStyles()((theme) => ({
    // Le design « Studio » remplace l'ancien panneau étroit (600/700 px) par
    // une mise en page large en deux colonnes ; les classes ci-dessous sont
    // conservées pour ne pas casser les appels à cx() plus bas.
    layout: {
        width: '100%',
        maxWidth: 1180,
        height: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
    },

    paper: {
        position: 'relative',
        display: 'block',
        width: '100%',
        height: 'auto',
        padding: 0,
        margin: 0,
        background: 'transparent',
        boxShadow: 'none',
    },
    bottomBar: {
        display: 'flex',
        alignItems: 'center',
        [belowDesktop(theme)]: {
            flexWrap: 'wrap',
        },
        marginLeft: -theme.spacing(2),
    },
    copyrightTypography: {
        textAlign: 'center',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1000,
        color: '#fff',
    },
    minidiscLogo: {
        width: 48,
    },
    controlsContainer: {
        flex: '0 0 auto',
        width: '100%',
        paddingRight: theme.spacing(8),
        [belowDesktop(theme)]: {
            paddingLeft: 0,
        },
    },
}));

const themeCommons = {
    shape: { borderRadius: 14 },
    typography: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiSelect: {
            defaultProps: { variant: 'standard' as const },
        },
        MuiPaper: {
            defaultProps: { elevation: 1 },
            styleOverrides: {
                root: {
                    borderRadius: 16,
                },
                elevation24: {
                    backgroundImage: 'none !important',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                },
            },
        },
        MuiDialog: {
            defaultProps: {
                PaperProps: {
                    elevation: 0,
                },
            },
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                },
            },
        },
        MuiMenu: {
            defaultProps: {
                PaperProps: {
                    elevation: 24,
                },
            },
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                },
            },
        },
        MuiTextField: {
            defaultProps: { variant: 'standard' as const },
        },
    },
};

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            light: '#8ec7ff',
            main: '#5aa9ff',
            dark: '#2f6fc4',
            contrastText: '#06121f',
        },
        secondary: {
            light: '#ff8a80',
            main: '#ff5252',
            dark: '#c62828',
        },
        text: {
            primary: '#eef1f5',
            secondary: '#9aa5b4',
            disabled: 'rgba(238, 241, 245, 0.4)',
        },
        divider: '#2a313d',
        background: {
            default: '#0a0e16',
            paper: '#141a22',
        },
        action: {
            active: '#fff',
            hover: 'rgba(255, 255, 255, 0.08)',
            hoverOpacity: 0.08,
            selected: 'rgba(90, 169, 255, 0.16)',
            selectedOpacity: 0.16,
            disabled: 'rgba(255, 255, 255, 0.3)',
            disabledBackground: 'rgba(255, 255, 255, 0.12)',
            disabledOpacity: 0.38,
            focus: 'rgba(90, 169, 255, 0.18)',
            focusOpacity: 0.18,
            activatedOpacity: 0.24,
        },
    },
    ...themeCommons,
    components: {
        ...themeCommons.components,
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: '#0a0e16',
                },
            },
        },
    },
});

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            light: '#8ec7ff',
            main: '#1e7ad1',
            dark: '#0d4f8f',
            contrastText: '#fff',
        },
        secondary: {
            light: '#ff8a80',
            main: '#d32f2f',
            dark: '#b71c1c',
            contrastText: '#fff',
        },
        error: {
            light: '#e57373',
            main: '#f44336',
            dark: '#d32f2f',
            contrastText: '#fff',
        },
        warning: {
            light: '#ffb74d',
            main: '#ff9800',
            dark: '#f57c00',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        info: {
            light: '#64b5f6',
            main: '#2196f3',
            dark: '#1976d2',
            contrastText: '#fff',
        },
        success: {
            light: '#81c784',
            main: '#4caf50',
            dark: '#388e3c',
            contrastText: 'rgba(0, 0, 0, 0.87)',
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.54)',
            disabled: 'rgba(0, 0, 0, 0.38)',
        },
        divider: '#dbe4ef',
        background: {
            paper: '#fff',
            default: '#f4f7fb',
        },
        action: {
            active: 'rgba(0, 0, 0, 0.54)',
            hover: 'rgba(30, 122, 209, 0.06)',
            hoverOpacity: 0.06,
            selected: 'rgba(30, 122, 209, 0.12)',
            selectedOpacity: 0.12,
            disabled: 'rgba(0, 0, 0, 0.26)',
            disabledBackground: 'rgba(0, 0, 0, 0.12)',
            disabledOpacity: 0.38,
            focus: 'rgba(30, 122, 209, 0.14)',
            focusOpacity: 0.14,
            activatedOpacity: 0.12,
        },
    },
    ...themeCommons,
    components: {
        ...themeCommons.components,
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: '#f4f7fb',
                },
            },
        },
    },
});

const InternalApp = () => {
    const { mainView, loading, deviceConnected } = useShallowEqualSelector((state) => state.appState);
    const { deviceName } = useShallowEqualSelector((state) => state.main);
    const { classes, cx } = useStyles();
    const dispatch = useDispatch();

    // At init, connect to server and check for encoders.
    useEffect(() => {
        dispatch(validateAndLoadEncoders(true));
    }, []);

    return (
        <React.Fragment>
            <CssBaseline />

            <Suspense
                fallback={
                    <Backdrop open={true}>
                        <CircularProgress color="info" />
                    </Backdrop>
                }
            >
                <main className={cx(classes.layout, 'mdb-shell')}>
                    <AtmosphereBackdrop />
                    <div className="mdb-shell-inner">
                        <StudioTopbar view={mainView} deviceName={deviceName} connected={deviceConnected} />
                        <Paper className={cx(classes.paper, 'mdb-paper')}>
                            {mainView === 'WELCOME' ? <Welcome /> : null}
                            {mainView === 'MAIN' ? <Main /> : null}
                            {mainView === 'FACTORY' ? <Toc /> : null}
                            {mainView === 'SETTINGS' ? <SettingsScreen /> : null}
                            {mainView === 'HELP' ? <HelpScreen /> : null}

                            {mainView === 'MAIN' ? (
                                <Box className={cx(classes.controlsContainer, 'mdb-controls')}>
                                    <Controls />
                                </Box>
                            ) : null}
                        </Paper>
                        <AtmosphereSwatches />
                        <Typography variant="body2" color="textSecondary" className={cx(classes.copyrightTypography, 'mdb-footer')}>
                            {'MiniDiscBurner © '}
                            {new Date().getFullYear()}
                            {' · fork de '}
                            <Link rel="noopener noreferrer" color="inherit" target="_blank" href="https://github.com/asivery/webminidisc">
                                Web MiniDisc Pro
                            </Link>
                            {' · © '}
                            <Link rel="noopener noreferrer" color="inherit" target="_blank" href="https://stefano.brilli.me/">
                                Stefano Brilli
                            </Link>
                            {' et '}
                            <Link rel="noopener noreferrer" color="inherit" target="_blank" href="https://github.com/asivery/">
                                Asivery
                            </Link>
                            {'.'}
                        </Typography>
                    </div>
                </main>
            </Suspense>

            {loading ? (
                <Backdrop className={classes.backdrop} open={loading}>
                    <CircularProgress color="info" />
                </Backdrop>
            ) : null}

            <EncoderDownloadDialog />
        </React.Fragment>
    );
};

const App = () => {
    const { colorTheme, vintageMode } = useShallowEqualSelector((state) => state.appState);
    const systemIsDarkTheme = useThemeDetector();

    const theme = useMemo(() => {
        switch (colorTheme) {
            case 'light':
                return lightTheme;
            case 'dark':
                return darkTheme;
            case 'system':
                return systemIsDarkTheme ? darkTheme : lightTheme;
        }
    }, [systemIsDarkTheme, colorTheme]);

    if (vintageMode) {
        return <W95App />;
    }

    return (
        <ThemeProvider theme={theme}>
            <InternalApp />
        </ThemeProvider>
    );
};

export default App;
