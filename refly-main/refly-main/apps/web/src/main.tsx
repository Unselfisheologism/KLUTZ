// Import process polyfill first
import './process-polyfill';

import '../../web-next/src/tokens.css';
import './utils/dom-patch';

import '@refly-packages/ai-workspace-common/i18n/config';

import React, { Suspense, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
  RouterProvider,
  Outlet,
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@refly-packages/ai-workspace-common/utils/request';
import { AppRouter } from './routes';
import { AppLayout } from '@refly/web-core';

import { getEnv, setRuntime } from '@refly/utils/env';
import { useUserStoreShallow, useThemeStoreShallow, useAppStoreShallow } from '@refly/stores';
import { theme } from 'antd';
import { LightLoading, sentryEnabled } from '@refly/ui-kit';
import { preloadMonacoEditor } from '@refly-packages/ai-workspace-common/modules/artifacts/code-runner/monaco-editor/monacoPreloader';

// styles
import '@/styles/style.css';

setRuntime('web');

// Global script error handler
const handleScriptError = (event: ErrorEvent) => {
  // Prevent promise rejection for script loading errors
  if (
    event.target &&
    (event.target instanceof HTMLScriptElement || (event.target as any)?.nodeName === 'SCRIPT')
  ) {
    console.warn('Script loading error:', event);
    // Prevent the error from being captured as unhandled promise rejection
    event.preventDefault();
    return true;
  }
  return false;
};

// Add global error handlers
window.addEventListener('error', handleScriptError, true);
window.addEventListener('unhandledrejection', (event) => {
  // Check if the rejection is related to a script loading error
  if (
    event.reason?.target &&
    (event.reason.target instanceof HTMLScriptElement ||
      event.reason.target?.nodeName === 'SCRIPT' ||
      (typeof event.reason.target === 'string' && event.reason.target.includes('script')))
  ) {
    console.warn('Unhandled script loading rejection:', event.reason);
    event.preventDefault();
  }
});

// Move Sentry initialization to a separate function
const initSentry = async () => {
  const sentryDsn = process.env.VITE_SENTRY_DSN;
  if (process.env.NODE_ENV !== 'development' && sentryDsn) {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn: sentryDsn,
      environment: getEnv(),
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
        Sentry.reactRouterV6BrowserTracingIntegration({
          useEffect: React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0, //  Capture 100% of the transactions
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ['localhost', 'https://refly.ai'],
      // Session Replay
      replaysSessionSampleRate: 0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
      beforeSend(event) {
        // Filter out script loading errors that we've already handled
        if (
          event.exception?.values?.some(
            (exception) =>
              exception.value &&
              (exception.value.includes('script') || exception.value.includes('font-inter')),
          )
        ) {
          return null;
        }
        return event;
      },
    });
  }
};

// Call Sentry initialization if enabled
if (sentryEnabled) {
  initSentry();
}

// Update App component to manage initial loading state
export const App = () => {
  const setRuntime = useUserStoreShallow((state) => state.setRuntime);
  const { isDarkMode, initTheme } = useThemeStoreShallow((state) => ({
    isDarkMode: state.isDarkMode,
    initTheme: state.initTheme,
  }));

  const { isInitialLoading, setInitialLoading } = useAppStoreShallow((state) => ({
    isInitialLoading: state.isInitialLoading,
    setInitialLoading: state.setInitialLoading,
  }));

  useEffect(() => {
    setRuntime('web');
    // Initialize theme
    initTheme();

    // Set initial loading to false after app is ready
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [setRuntime, initTheme, setInitialLoading]);

  useEffect(() => {
    preloadMonacoEditor();
  }, []);

  const shouldUseDarkTheme = isDarkMode;

  useEffect(() => {
    ConfigProvider.config({
      holderRender: (children) => (
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#0E9F77',
              borderRadius: 8,
              ...(shouldUseDarkTheme
                ? {
                    controlItemBgActive: 'rgba(255, 255, 255, 0.08)',
                    controlItemBgActiveHover: 'rgba(255, 255, 255, 0.12)',
                  }
                : {
                    controlItemBgActive: '#f1f1f0',
                    controlItemBgActiveHover: '#e0e0e0',
                  }),
            },
            algorithm: shouldUseDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
          }}
        >
          {children}
        </ConfigProvider>
      ),
    });
  }, [shouldUseDarkTheme]);

  if (isInitialLoading) {
    return <LightLoading />;
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0E9F77',
          borderRadius: 8,
          ...(shouldUseDarkTheme
            ? {
                controlItemBgActive: 'rgba(255, 255, 255, 0.08)',
                controlItemBgActiveHover: 'rgba(255, 255, 255, 0.12)',
              }
            : {
                controlItemBgActive: '#f1f1f0',
                controlItemBgActiveHover: '#e0e0e0',
              }),
        },
        algorithm: shouldUseDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Outlet />
    </ConfigProvider>
  );
};

// Update router creation to use LightLoading for route transitions
const router = createBrowserRouter([
  {
    path: '*',
    element: <App />,
    children: [
      {
        path: '*',
        element: (
          <Suspense fallback={<LightLoading />}>
            <AppRouter layout={AppLayout} />
          </Suspense>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
);
