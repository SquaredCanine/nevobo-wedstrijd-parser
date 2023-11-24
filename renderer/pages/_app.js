import '../../styles/global.css';
import '@fontsource-variable/roboto-mono';

/**
 * Parent component of all pages
 * @param {*} param0 
 * @returns 
 */
export default function App({ Component, pageProps }) {
    return <Component {...pageProps} />;
}