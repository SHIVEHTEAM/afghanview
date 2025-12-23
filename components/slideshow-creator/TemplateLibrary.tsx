import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Grid,
  List,
  Star,
  Eye,
  Copy,
  Building,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Briefcase,
  GraduationCap,
  Heart as HeartIcon,
  Sparkles,
  Zap,
  Crown,
  X,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  slides: number;
  rating: number;
  downloads: number;
  isPremium: boolean;
  isNew: boolean;
  isPopular: boolean;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
}

const TEMPLATE_CATEGORIES = [
  { id: "all", name: "All", icon: Grid },
  { id: "restaurant", name: "Restaurants", icon: Utensils },
  { id: "retail", name: "Retail", icon: ShoppingBag },
  { id: "services", name: "Services", icon: Briefcase },
  { id: "automotive", name: "Automotive", icon: Car },
  { id: "real-estate", name: "Real Estate", icon: Home },
  { id: "education", name: "Education", icon: GraduationCap },
  { id: "healthcare", name: "Healthcare", icon: HeartIcon },
];

const MOCK_TEMPLATES: Template[] = [
  { id: "restaurant-menu-1", name: "Elegant Restaurant Menu", description: "A sophisticated menu template with beautiful typography.", category: "restaurant", thumbnail: "", slides: 8, rating: 4.8, downloads: 1247, isPremium: false, isNew: false, isPopular: true, tags: ["menu", "elegant"], author: "Shivehview", createdAt: "2025-01-15", updatedAt: "2025-01-20" },
  { id: "retail-promo-1", name: "Retail Promotion", description: "Eye-catching promotional slideshow for retail.", category: "retail", thumbnail: "", slides: 6, rating: 4.6, downloads: 892, isPremium: false, isNew: true, isPopular: false, tags: ["promotion", "retail"], author: "Shivehview", createdAt: "2025-01-18", updatedAt: "2025-01-18" },
];

export default function TemplateLibrary({ onSelectTemplate, onClose }: TemplateLibraryProps) {
  const [templates] = useState<Template[]>(MOCK_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-6 overflow-hidden" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-8 border-b border-black/5 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-black">Template Library</h2>
            <p className="text-sm text-black/40 mt-1">Choose a starting point for your content</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white border border-black/5 rounded-xl hover:bg-gray-50 transition-all text-black/20 hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 border-b border-black/5 bg-white space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-black/5 rounded-xl text-sm outline-none focus:bg-white focus:border-black/10 transition-all"
              />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-3 bg-gray-50 border border-black/5 rounded-xl text-sm font-bold outline-none cursor-pointer">
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {TEMPLATE_CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === c.id ? "bg-black text-white" : "bg-gray-50 text-black/40 hover:text-black"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/20">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map(template => (
                <div key={template.id} onClick={() => onSelectTemplate(template)} className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                    <Building className="w-12 h-12 text-black/5 transition-transform group-hover:scale-110" />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {template.isNew && <span className="px-3 py-1 bg-black text-white text-[9px] font-bold uppercase rounded-full">New</span>}
                      {template.isPremium && <span className="px-3 py-1 bg-black text-white text-[9px] font-bold uppercase rounded-full flex items-center gap-1"><Crown className="w-3 h-3" /> Premium</span>}
                    </div>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-widest">Select Template</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-black">{template.name}</h3>
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg text-xs font-bold">
                        <Star className="w-3 h-3 text-black" /> {template.rating}
                      </div>
                    </div>
                    <p className="text-sm text-black/40 line-clamp-2">{template.description}</p>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-black/5 text-[10px] font-bold text-black/20 uppercase">
                      <span>{template.slides} Slides</span>
                      <span>{template.downloads} Downloads</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 text-black/20">
              <Search className="w-16 h-16 mx-auto mb-6 opacity-10" />
              <h3 className="text-xl font-bold">No templates found</h3>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-black/5 bg-white flex justify-between items-center">
          <p className="text-xs text-black/30 font-bold uppercase tracking-widest">{filteredTemplates.length} templates available</p>
          <button className="bg-black text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-black/10 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Create from Scratch
          </button>
        </div>
      </motion.div>
    </div>
  );
}
