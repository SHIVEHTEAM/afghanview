import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Upload,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Database,
  HardDrive,
  Cloud,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

interface BackupData {
  id: string;
  name: string;
  type: "full" | "slideshows" | "settings" | "analytics";
  size: string;
  createdAt: string;
  status: "completed" | "failed" | "in_progress";
  downloadUrl?: string;
}

interface ImportData {
  id: string;
  name: string;
  type: "full" | "slideshows" | "settings";
  size: string;
  uploadedAt: string;
  status: "pending" | "completed" | "failed";
  progress?: number;
}

export default function ExportImport() {
  const { user } = useAuth();
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [imports, setImports] = useState<ImportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setBackups([]);
      setImports([]);
    } catch (err) { console.error("Fetch failed:", err); }
    finally { setLoading(false); }
  };

  const handleExport = (type: string) => {
    const newBackup: BackupData = {
      id: Date.now().toString(),
      name: `${type}_backup_${new Date().toISOString().split("T")[0]}`,
      type: type as any,
      size: "2.5 MB",
      createdAt: new Date().toISOString(),
      status: "completed",
      downloadUrl: "#"
    };
    setBackups([newBackup, ...backups]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newImport: ImportData = {
      id: Date.now().toString(),
      name: selectedFile.name,
      type: "full",
      size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString(),
      status: "completed",
    };
    setImports([newImport, ...imports]);
    setSelectedFile(null);
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-10 h-10 border-2 border-black/5 border-t-black rounded-full animate-spin"></div>
        <p className="mt-6 text-sm font-medium text-black/40">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-black">Export & Import</h1>
          <p className="text-sm text-black/40 mt-1">Manage your data backups and restorations</p>
        </div>
        <div className="bg-gray-50 p-1.5 rounded-xl border border-black/5 flex">
          <button
            onClick={() => setActiveTab("export")}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "export" ? "bg-black text-white shadow-sm" : "text-black/30 hover:text-black"}`}
          >
            Export
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "import" ? "bg-black text-white shadow-sm" : "text-black/30 hover:text-black"}`}
          >
            Import
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "export" ? (
          <motion.div key="export" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { type: "full", label: "Full Backup", desc: "Complete business data", icon: Database },
                { type: "slideshows", label: "Modules", desc: "Slideshows and menus", icon: FileText },
                { type: "settings", label: "Settings", desc: "Business configurations", icon: HardDrive },
                { type: "analytics", label: "Analytics", desc: "Performance records", icon: BarChart3 },
              ].map((unit) => (
                <button
                  key={unit.type}
                  onClick={() => handleExport(unit.type)}
                  className="bg-white border border-black/5 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-black transition-all">
                    <unit.icon className="w-6 h-6 text-black/20 group-hover:text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-1">{unit.label}</h3>
                  <p className="text-xs text-black/40">{unit.desc}</p>
                </button>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black">Export History</h2>
                <button onClick={fetchData} className="p-2 text-black/20 hover:text-black"><RefreshCw className="w-4 h-4" /></button>
              </div>
              {backups.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl border border-black/5 p-12 text-center text-black/20">
                  <Download className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-bold uppercase tracking-widest">No exports yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backups.map(b => (
                    <div key={b.id} className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-black/20"><FileText className="w-5 h-5" /></div>
                        <div>
                          <p className="text-sm font-bold text-black">{b.name}</p>
                          <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest">{new Date(b.createdAt).toLocaleDateString()} • {b.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase rounded-full">{b.status}</span>
                        <button className="p-2 bg-gray-50 rounded-lg border border-black/5 text-black/20 hover:text-black"><Download className="w-4 h-4" /></button>
                        <button className="p-2 bg-gray-50 rounded-lg border border-black/5 text-black/20 hover:text-black"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="import" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
            <div className="bg-white border-2 border-dashed border-black/5 rounded-3xl p-16 text-center">
              <input id="file-upload" type="file" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Upload className="w-8 h-8 text-black/10" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-2">{selectedFile ? selectedFile.name : "Select File"}</h3>
                <p className="text-sm text-black/40 mb-8 max-w-sm mx-auto">Upload a previously exported .json or .zip backup file to restore your data.</p>
                {selectedFile ? (
                  <button onClick={e => { e.preventDefault(); handleUpload(); }} className="bg-black text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-black/10">
                    {uploading ? "Uploading..." : "Restore Backup"}
                  </button>
                ) : (
                  <div className="inline-block bg-white border border-black/10 px-8 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">Choose File</div>
                )}
              </label>
            </div>

            <div>
              <h2 className="text-xl font-bold text-black mb-6">Import History</h2>
              {imports.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl border border-black/5 p-12 text-center text-black/20">
                  <Upload className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-bold uppercase tracking-widest">No imports yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {imports.map(i => (
                    <div key={i.id} className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-black/20"><Upload className="w-5 h-5" /></div>
                        <div>
                          <p className="text-sm font-bold text-black">{i.name}</p>
                          <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest">{new Date(i.uploadedAt).toLocaleDateString()} • {i.size}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase rounded-full">Success</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
