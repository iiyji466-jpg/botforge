import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#111118',
            color: '#e0e0f0',
            border: '1px solid #1e1e2e',
          },
        }}
      />
    </>
  )
}
