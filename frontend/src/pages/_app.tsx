import type { AppProps } from 'next/app';
import { Inter, Space_Grotesk } from 'next/font/google';
import '../styles/globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${spaceGrotesk.variable} ${inter.variable} font-wrapper`}>
      <Component {...pageProps} />
    </div>
  );
}
