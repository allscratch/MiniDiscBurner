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

const Toc = lazy(() => import('./factory/factory'));
const Controls = lazy(() => import('./controls'));
const Welcome = lazy(() => import('./welcome'));
const Main = lazy(() => import('./main'));
const useStyles = makeStyles()((theme) => ({
    layout: {
        width: 'auto',
        height: '100%',
        [forAnyDesktop(theme)]: {
            width: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
        [forWideDesktop(theme)]: {
            width: 700,
        },
    },

    paper: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(2),
        height: 'calc(100% - 20px)',
        [forAnyDesktop(theme)]: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(1),
            padding: theme.spacing(3),
            height: 200,
        },
        [forWideDesktop(theme)]: {
            height: 250,
        },
    },
    paperShowsList: {
        [forAnyDesktop(theme)]: {
            height: 600,
        },
        [forWideDesktop(theme)]: {
            height: 700,
        },
    },
    paperFullHeight: {
        height: 'calc(100% - 50px)',
    },
    layoutFullWidth: {
        [forAnyDesktop(theme)]: {
            width: '90%',
        },
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
                    background:
                        'radial-gradient(900px 500px at 12% -10%, rgba(90, 169, 255, 0.12), transparent 60%),' +
                        'radial-gradient(700px 400px at 100% 0%, rgba(140, 110, 255, 0.07), transparent 55%),' +
                        '#0a0e16',
                    backgroundAttachment: 'fixed',
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
                    background:
                        'radial-gradient(900px 500px at 12% -10%, rgba(90, 169, 255, 0.10), transparent 60%),' +
                        '#f4f7fb',
                    backgroundAttachment: 'fixed',
                },
            },
        },
    },
});

const InternalApp = () => {
    const { mainView, loading, pageFullHeight, pageFullWidth } = useShallowEqualSelector((state) => state.appState);
    const { deviceCapabilities } = useShallowEqualSelector((state) => state.main);
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
                <main className={cx(classes.layout, { [classes.layoutFullWidth]: pageFullWidth })}>
                    <Paper
                        className={cx(classes.paper, {
                            [classes.paperShowsList]: deviceCapabilities.includes(0 /*Capability.listContent*/),
                            [classes.paperFullHeight]: pageFullHeight,
                        })}
                    >
                        {mainView === 'WELCOME' ? <Welcome /> : null}
                        {mainView === 'MAIN' ? <Main /> : null}
                        {mainView === 'FACTORY' ? <Toc /> : null}

                        <Box className={classes.controlsContainer}>{mainView === 'MAIN' ? <Controls /> : null}</Box>
                    </Paper>
                    <Typography variant="body2" color="textSecondary" className={classes.copyrightTypography}>
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
