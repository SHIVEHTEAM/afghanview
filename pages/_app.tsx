import type { AppProps } from "next/app";
import { AuthProvider } from "../lib/auth";
import { ToastProvider } from "../components/ui/Toast";
import "../lib/alert-replacer"; // Replace all alert() calls with toast notifications
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </AuthProvider>
  );
}
