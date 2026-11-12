import '../styles/globals.css';
import '../i18n';
import { applyStoredLocale } from '../i18n';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { ViewportRequirementsProvider } from '../context/ViewportRequirementsContext';

// Keep wallet SDKs out of the exhibition's loaded module tree.
const AccountApp = dynamic(() => import('../components/AccountApp'));
export default function App(props: AppProps) {
  useEffect(() => {
    applyStoredLocale();
    // A full document navigation also releases SDKs from a preceding account page.
    if (props.router.pathname === '/exhibition' && document.querySelector('script[data-aurayale-ads]'))
      window.location.replace('/exhibition');
  }, [props.router.pathname]);
  if (props.router.pathname === '/exhibition') {
    return <ViewportRequirementsProvider><props.Component {...props.pageProps} /></ViewportRequirementsProvider>;
  }
  return <AccountApp {...props} />;
}
