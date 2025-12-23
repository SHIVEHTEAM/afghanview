import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  MessageCircle,
  MessageSquare,
  Clock,
  User,
  MoreVertical,
  Search,
  Plus,
  X,
  Zap,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "staff";
  avatar: string;
  status: "online" | "offline" | "away";
  lastActive: string;
  permissions: string[];
  joinedAt: string;
}

interface CollaborationProject {
  id: string;
  name: string;
  description: string;
  type: "slideshow" | "template" | "content";
  status: "draft" | "in-progress" | "review" | "completed";
  assignedTo: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  tags: string[];
}

interface Comment {
  id: string;
  content: string;
  author: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  projectId: string;
  replies: Comment[];
}

interface CollaborationToolsProps {
  businessId: string;
}

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: "1", name: "Ahmad Hasir", email: "ahmad@shivehview.com", role: "owner", avatar: "", status: "online", lastActive: "2025-01-15T10:30:00Z", permissions: ["all"], joinedAt: "2025-01-01" },
  { id: "2", name: "Sarah Johnson", email: "sarah@shivehview.com", role: "manager", avatar: "", status: "online", lastActive: "2025-01-15T10:25:00Z", permissions: ["create", "edit", "delete"], joinedAt: "2025-01-05" },
];

const MOCK_PROJECTS: CollaborationProject[] = [
  { id: "1", name: "Weekly Menu Slideshow", description: "Create a dynamic slideshow for the weekly menu specials", type: "slideshow", status: "in-progress", assignedTo: ["1", "2"], createdBy: "1", createdAt: "2025-01-10", updatedAt: "2025-01-15", dueDate: "2025-01-20", priority: "high", tags: ["menu", "weekly"] },
];

export default function CollaborationTools({ businessId }: CollaborationToolsProps) {
  const [teamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [projects] = useState<CollaborationProject[]>(MOCK_PROJECTS);
  const [activeTab, setActiveTab] = useState<"team" | "projects" | "comments">("team");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<CollaborationProject | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-black">Collaboration Hub</h1>
          <p className="text-sm text-black/40 mt-1">Manage your team and joint projects</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-black/5 text-black px-6 py-3 rounded-xl font-bold transition-all hover:bg-gray-50 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </button>
          <button className="bg-black text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-black/90 flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Invite Member
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="bg-gray-50 p-1.5 rounded-xl border border-black/5 flex w-full md:w-auto">
          {['team', 'projects', 'comments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? "bg-black text-white shadow-sm" : "text-black/30 hover:text-black"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-black/5 rounded-xl text-sm outline-none focus:border-black/10 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {activeTab === "team" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-black/20"><User className="w-6 h-6" /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-black">{member.name}</h3>
                        <span className="px-2 py-0.5 bg-black text-white text-[9px] font-bold uppercase rounded-md">{member.role}</span>
                      </div>
                      <p className="text-xs text-black/40">{member.email}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-2 text-black/20 hover:text-black"><MessageCircle className="w-4 h-4" /></button>
                      <button className="p-2 text-black/20 hover:text-black"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-6">
              {projects.map((project) => (
                <div key={project.id} onClick={() => setSelectedProject(project)} className="bg-white border border-black/5 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-gray-50 text-black/40 text-[9px] font-bold uppercase rounded-full border border-black/5">{project.type}</span>
                        <h3 className="text-xl font-bold text-black">{project.name}</h3>
                      </div>
                      <p className="text-sm text-black/40">{project.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase rounded-full">{project.status}</span>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-black/5 text-xs text-black/30">
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Due {project.dueDate}</div>
                    <div className="flex gap-2">
                      {project.tags.map(t => <span key={t} className="px-2 py-1 bg-gray-50 rounded-lg">#{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-black/30 uppercase tracking-widest mb-6">Stats</h3>
            <div className="space-y-4">
              {[
                { label: "Team Members", val: teamMembers.length },
                { label: "Active Projects", val: projects.length },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-end pb-4 border-b border-black/5 last:border-0 last:pb-0">
                  <span className="text-sm text-black/40">{s.label}</span>
                  <span className="text-2xl font-bold">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black text-white rounded-2xl p-6 shadow-lg shadow-black/10">
            <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-6">Online Now</h3>
            <div className="space-y-4">
              {teamMembers.filter(m => m.status === 'online').map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[200]" onClick={() => setSelectedProject(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-10 max-w-2xl w-full shadow-2xl border border-black/5" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-black mb-2">{selectedProject.name}</h2>
                  <p className="text-sm text-black/40">{selectedProject.description}</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100"><X className="w-6 h-6" /></button>
              </div>
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <h4 className="text-xs font-bold text-black/20 uppercase tracking-widest mb-4">Assigned Team</h4>
                  <div className="space-y-3">
                    {teamMembers.filter(m => selectedProject.assignedTo.includes(m.id)).map(m => (
                      <div key={m.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-bold text-black/20"><User className="w-4 h-4" /></div>
                        <span className="text-sm font-bold">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-black/20 uppercase tracking-widest mb-2">Priority</h4>
                    <span className="text-sm font-bold capitalize">{selectedProject.priority}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-black/20 uppercase tracking-widest mb-2">Deadline</h4>
                    <span className="text-sm font-bold">{selectedProject.dueDate}</span>
                  </div>
                </div>
              </div>
              <button className="w-full bg-black text-white py-4 rounded-xl font-bold">Edit Project Details</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
