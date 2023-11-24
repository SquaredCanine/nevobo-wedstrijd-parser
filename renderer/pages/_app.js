import '../../styles/global.css';

/**
 * Parent component of all pages
 * @param {*} param0 
 * @returns 
 */
export default function App({ Component, pageProps }) {
    return <Component {...pageProps} />;
}