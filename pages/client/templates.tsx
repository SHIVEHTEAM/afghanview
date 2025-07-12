import React, { useState } from "react";
import Head from "next/head";
import ClientLayout from "../../components/client/ClientLayout";
import TemplateLibrary from "../../components/slideshow-creator/TemplateLibrary";
import { useRouter } from "next/router";

export default function TemplatesPage() {
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const router = useRouter();

  const handleTemplateSelect = (template: any) => {
    // Handle template selection
    router.push(`/client/slideshows?template=${template.id}`);
  };

  return (
    <>
      <Head>
        <title>Template Library - AfghanView</title>
        <meta
          name="description"
          content="Choose from hundreds of professional templates"
        />
      </Head>

      <ClientLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Template Library
            </h1>
            <p className="text-gray-600 mb-8">
              Choose from hundreds of professional templates for your business
            </p>
            <button
              onClick={() => setShowTemplateLibrary(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Browse Templates
            </button>
          </div>
        </div>

        {showTemplateLibrary && (
          <TemplateLibrary
            onSelectTemplate={handleTemplateSelect}
            onClose={() => setShowTemplateLibrary(false)}
          />
        )}
      </ClientLayout>
    </>
  );
}
