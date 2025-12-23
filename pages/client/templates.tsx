import React, { useState } from "react";
import Head from "next/head";
import ClientLayout from "../../components/client/ClientLayout";
import TemplateLibrary from "../../components/slideshow-creator/TemplateLibrary";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Layout, Sparkles, BookOpen } from "lucide-react";

export default function TemplatesPage() {
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const router = useRouter();

  const handleTemplateSelect = (template: any) => {
    router.push(`/client/slideshows?template=${template.id}`);
  };

  return (
    <>
      <Head>
        <title>Templates - Shivehview</title>
        <meta name="description" content="Browse our library of high-quality templates." />
      </Head>

      <ClientLayout>
        <div className="max-w-7xl mx-auto px-6 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-black/10">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">Template Library</h1>
            <p className="text-lg text-black/40 mb-10 leading-relaxed">
              Choose from our professionally designed templates to get your digital display up and running in minutes.
            </p>

            <button
              onClick={() => setShowTemplateLibrary(true)}
              className="bg-black text-white px-10 py-5 rounded-xl font-bold text-lg shadow-xl shadow-black/10 hover:bg-black/90 transition-all flex items-center gap-3 mx-auto"
            >
              <Layout className="w-6 h-6" />
              Browse Library
            </button>

            <div className="grid grid-cols-3 gap-8 mt-20 opacity-30">
              {[
                { label: "High Quality", icon: Sparkles },
                { label: "Fully Customizable", icon: Layout },
                { label: "Optimized", icon: BookOpen },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showTemplateLibrary && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000]">
              <TemplateLibrary onSelectTemplate={handleTemplateSelect} onClose={() => setShowTemplateLibrary(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </ClientLayout>
    </>
  );
}
