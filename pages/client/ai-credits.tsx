import React from "react";
import Head from "next/head";
import AICreditsDashboard from "../../components/client/AICreditsDashboard";
import ClientLayout from "../../components/client/ClientLayout";
import { useAuth } from "../../lib/auth";

export default function AICreditsPage() {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>AI Credits - Shivehview</title>
        <meta name="description" content="Manage your AI credits and usage" />
      </Head>

      <ClientLayout>
        <AICreditsDashboard />
      </ClientLayout>
    </>
  );
}
