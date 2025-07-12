import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  MessageCircle,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  User,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  ShieldOff,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  MoreVertical,
  Menu,
  Home,
  Settings,
  HelpCircle,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MinusCircle,
  PlusCircle,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Star,
  Heart,
  Diamond,
  Zap,
  Target,
  Crosshair,
  Navigation,
  Compass,
  Map,
  Globe,
  Flag,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Edit3,
  Trash2,
  Copy,
  Share,
  Download,
  Upload,
  Save,
  RefreshCw,
  Plus,
  Minus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
  Fullscreen,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Projector,
  Camera,
  Mic,
  Headphones,
  Speaker,
  Wifi,
  WifiOff,
  Bluetooth,
  Battery,
  BatteryCharging,
  Power,
  PowerOff,
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
  {
    id: "1",
    name: "Ahmad Hasir",
    email: "ahmad@afghanview.com",
    role: "owner",
    avatar: "/api/placeholder/40/40",
    status: "online",
    lastActive: "2024-01-15T10:30:00Z",
    permissions: ["all"],
    joinedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@afghanview.com",
    role: "manager",
    avatar: "/api/placeholder/40/40",
    status: "online",
    lastActive: "2024-01-15T10:25:00Z",
    permissions: ["create", "edit", "delete", "manage_staff"],
    joinedAt: "2024-01-05",
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike@afghanview.com",
    role: "staff",
    avatar: "/api/placeholder/40/40",
    status: "away",
    lastActive: "2024-01-15T09:45:00Z",
    permissions: ["create", "edit"],
    joinedAt: "2024-01-10",
  },
];

const MOCK_PROJECTS: CollaborationProject[] = [
  {
    id: "1",
    name: "Weekly Menu Slideshow",
    description: "Create a dynamic slideshow for the weekly menu specials",
    type: "slideshow",
    status: "in-progress",
    assignedTo: ["2", "3"],
    createdBy: "1",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
    dueDate: "2024-01-20",
    priority: "high",
    tags: ["menu", "weekly", "specials"],
  },
  {
    id: "2",
    name: "Holiday Promotion Template",
    description: "Design a reusable template for holiday promotions",
    type: "template",
    status: "review",
    assignedTo: ["2"],
    createdBy: "1",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-14",
    dueDate: "2024-01-18",
    priority: "medium",
    tags: ["holiday", "promotion", "template"],
  },
  {
    id: "3",
    name: "Staff Training Content",
    description: "Create training materials for new staff members",
    type: "content",
    status: "draft",
    assignedTo: ["3"],
    createdBy: "2",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-15",
    priority: "low",
    tags: ["training", "staff", "materials"],
  },
];

const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    content: "Great work on the menu layout! Should we add more images?",
    author: "2",
    authorName: "Sarah Johnson",
    authorAvatar: "/api/placeholder/32/32",
    createdAt: "2024-01-15T10:30:00Z",
    projectId: "1",
    replies: [],
  },
  {
    id: "2",
    content:
      "I think we need to adjust the color scheme to match our brand better.",
    author: "1",
    authorName: "Ahmad Hasir",
    authorAvatar: "/api/placeholder/32/32",
    createdAt: "2024-01-15T11:15:00Z",
    projectId: "1",
    replies: [
      {
        id: "2-1",
        content: "I'll update the colors to use our brand palette.",
        author: "3",
        authorName: "Mike Chen",
        authorAvatar: "/api/placeholder/32/32",
        createdAt: "2024-01-15T11:30:00Z",
        projectId: "1",
        replies: [],
      },
    ],
  },
];

export default function CollaborationTools({
  businessId,
}: CollaborationToolsProps) {
  const [teamMembers, setTeamMembers] =
    useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [projects, setProjects] =
    useState<CollaborationProject[]>(MOCK_PROJECTS);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [selectedProject, setSelectedProject] =
    useState<CollaborationProject | null>(null);
  const [activeTab, setActiveTab] = useState<"team" | "projects" | "comments">(
    "team"
  );
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-500";
      case "manager":
        return "bg-blue-500";
      case "staff":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColorProject = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "review":
        return "bg-blue-500";
      case "in-progress":
        return "bg-yellow-500";
      case "draft":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const TeamMemberCard = ({ member }: { member: TeamMember }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(
              member.status
            )}`}
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900">{member.name}</h3>
            <span
              className={`px-2 py-1 text-xs rounded-full text-white ${getRoleColor(
                member.role
              )}`}
            >
              {member.role}
            </span>
          </div>
          <p className="text-sm text-gray-600">{member.email}</p>
          <p className="text-xs text-gray-500">
            Last active: {new Date(member.lastActive).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <MessageCircle className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const ProjectCard = ({ project }: { project: CollaborationProject }) => {
    const assignedMembers = teamMembers.filter((member) =>
      project.assignedTo.includes(member.id)
    );

    return (
      <div
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedProject(project)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900">{project.name}</h3>
              <span
                className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColorProject(
                  project.status
                )}`}
              >
                {project.status}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-full text-white ${getPriorityColor(
                  project.priority
                )}`}
              >
                {project.priority}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{project.description}</p>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Type: {project.type}</span>
              {project.dueDate && (
                <span>
                  Due: {new Date(project.dueDate).toLocaleDateString()}
                </span>
              )}
              <span>
                Updated: {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Assigned to:</span>
            <div className="flex -space-x-2">
              {assignedMembers.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
                >
                  <User className="w-3 h-3 text-gray-500" />
                </div>
              ))}
              {assignedMembers.length > 3 && (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    +{assignedMembers.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {project.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const CommentItem = ({ comment }: { comment: Comment }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-gray-500" />
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900">
              {comment.authorName}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="text-gray-700 mb-2">{comment.content}</p>

          <div className="flex items-center space-x-4">
            <button className="text-xs text-blue-600 hover:text-blue-700">
              Reply
            </button>
            <button className="text-xs text-gray-500 hover:text-gray-600">
              Like
            </button>
          </div>

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-3 ml-4 space-y-2">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {reply.authorName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(reply.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ProjectDetails = ({ project }: { project: CollaborationProject }) => {
    const projectComments = comments.filter(
      (comment) => comment.projectId === project.id
    );
    const assignedMembers = teamMembers.filter((member) =>
      project.assignedTo.includes(member.id)
    );

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {project.name}
              </h2>
              <p className="text-gray-600 mt-1">{project.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                Edit Project
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span
                className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColorProject(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <span
                className={`px-2 py-1 text-xs rounded-full text-white ${getPriorityColor(
                  project.priority
                )}`}
              >
                {project.priority}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <span className="text-sm text-gray-900 capitalize">
                {project.type}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <span className="text-sm text-gray-900">
                {project.dueDate
                  ? new Date(project.dueDate).toLocaleDateString()
                  : "No due date"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Members */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Team Members
              </h3>
              <div className="space-y-3">
                {assignedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Comments
              </h3>
              <div className="space-y-3 mb-4">
                {projectComments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Collaboration Tools
          </h1>
          <p className="text-gray-600 mt-2">
            Work together with your team on slideshows and content
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowProjectModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("team")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "team"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Team Members ({teamMembers.length})
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "projects"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "comments"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Comments ({comments.length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === "team" && (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {activeTab === "comments" && (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Team Members</span>
                <span className="text-sm font-medium text-gray-900">
                  {teamMembers.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Projects</span>
                <span className="text-sm font-medium text-gray-900">
                  {projects.filter((p) => p.status === "in-progress").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Reviews</span>
                <span className="text-sm font-medium text-gray-900">
                  {projects.filter((p) => p.status === "review").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Comments</span>
                <span className="text-sm font-medium text-gray-900">
                  {comments.length}
                </span>
              </div>
            </div>
          </div>

          {/* Online Team Members */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Online Now
            </h3>
            <div className="space-y-3">
              {teamMembers
                .filter((member) => member.status === "online")
                .map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Project Details */}
          {selectedProject && <ProjectDetails project={selectedProject} />}
        </div>
      </div>
    </div>
  );
}
