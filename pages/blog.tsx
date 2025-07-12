import React from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  Tag,
  Eye,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  slug: string;
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title:
      "How AI is Revolutionizing Restaurant Digital Signage in Afghanistan",
    excerpt:
      "Discover how artificial intelligence is transforming the way Afghan restaurants display their menus and engage with customers through smart digital signage solutions.",
    content:
      "The restaurant industry in Afghanistan is experiencing a digital transformation, and AI-powered digital signage is at the forefront of this revolution. Shivehview's intelligent platform is helping restaurants create engaging, culturally relevant content that resonates with their customers...",
    author: "Shivehview Team",
    date: "2024-01-15",
    readTime: "5 min read",
    category: "Technology",
    tags: ["AI", "Digital Signage", "Restaurant Technology", "Afghanistan"],
    slug: "ai-revolutionizing-restaurant-digital-signage-afghanistan",
    featured: true,
  },
  {
    id: "2",
    title:
      "5 Essential Features Every Modern Restaurant Digital Menu Should Have",
    excerpt:
      "Learn about the must-have features that can transform your restaurant's digital menu from basic to brilliant, enhancing customer experience and increasing sales.",
    content:
      "In today's competitive restaurant landscape, having a static printed menu is no longer enough. Modern customers expect interactive, visually appealing digital menus that provide more than just prices and descriptions...",
    author: "Ahmad Seyar Hasir",
    date: "2024-01-10",
    readTime: "4 min read",
    category: "Features",
    tags: ["Digital Menu", "Customer Experience", "Restaurant Features"],
    slug: "5-essential-features-modern-restaurant-digital-menu",
  },
  {
    id: "3",
    title: "The Complete Guide to Setting Up TV Displays for Your Restaurant",
    excerpt:
      "Step-by-step guide to implementing TV displays in your restaurant, from choosing the right hardware to creating engaging content that keeps customers entertained.",
    content:
      "TV displays in restaurants serve multiple purposes: they can showcase your menu, display promotional content, entertain customers, and even provide real-time information. However, setting up an effective TV display system requires careful planning...",
    author: "Shivehview Team",
    date: "2024-01-08",
    readTime: "6 min read",
    category: "Setup Guide",
    tags: ["TV Displays", "Setup Guide", "Hardware", "Content Creation"],
    slug: "complete-guide-setting-up-tv-displays-restaurant",
  },
  {
    id: "4",
    title: "Cultural Content Creation: How to Appeal to Afghan Customers",
    excerpt:
      "Understanding the importance of cultural relevance in digital signage content and how to create materials that connect with Afghan customers on a deeper level.",
    content:
      "Afghanistan has a rich cultural heritage that spans thousands of years. When creating digital content for Afghan restaurants, it's crucial to understand and respect these cultural nuances...",
    author: "Cultural Expert",
    date: "2024-01-05",
    readTime: "7 min read",
    category: "Culture",
    tags: [
      "Cultural Content",
      "Afghan Culture",
      "Customer Engagement",
      "Localization",
    ],
    slug: "cultural-content-creation-appeal-afghan-customers",
  },
  {
    id: "5",
    title: "Maximizing ROI: How Digital Signage Increases Restaurant Revenue",
    excerpt:
      "Real-world case studies and data showing how restaurants using digital signage see significant increases in average order value and customer satisfaction.",
    content:
      "Digital signage isn't just about looking modern—it's a powerful tool for increasing revenue. Restaurants that implement digital signage solutions typically see a 15-30% increase in average order value...",
    author: "Business Analyst",
    date: "2024-01-03",
    readTime: "5 min read",
    category: "Business",
    tags: ["ROI", "Revenue", "Digital Signage", "Case Studies"],
    slug: "maximizing-roi-digital-signage-increases-restaurant-revenue",
  },
  {
    id: "6",
    title: "The Future of Restaurant Technology: Trends to Watch in 2024",
    excerpt:
      "Explore the latest trends in restaurant technology, from AI-powered ordering systems to immersive dining experiences and what they mean for Afghan restaurants.",
    content:
      "The restaurant industry is evolving rapidly, driven by technological advancements and changing customer expectations. As we move through 2024, several key trends are shaping the future of dining...",
    author: "Tech Expert",
    date: "2024-01-01",
    readTime: "8 min read",
    category: "Trends",
    tags: ["Future Trends", "Restaurant Technology", "Innovation", "2024"],
    slug: "future-restaurant-technology-trends-2024",
  },
];

const categories = [
  "All",
  "Technology",
  "Features",
  "Setup Guide",
  "Culture",
  "Business",
  "Trends",
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

  return (
    <>
      <Head>
        <title>
          Blog - Shivehview | Business Digital Signage Insights & Tips
        </title>
        <meta
          name="description"
          content="Stay updated with the latest insights on business digital signage, AI technology, cultural content creation, and industry trends. Expert tips for Afghan businesses."
        />
        <meta
          name="keywords"
          content="business blog, digital signage tips, AI business technology, Afghan business insights, content display guides, Shivehview blog"
        />
        <meta
          property="og:title"
          content="Blog - Shivehview | Business Digital Signage Insights"
        />
        <meta
          property="og:description"
          content="Stay updated with the latest insights on business digital signage, AI technology, cultural content creation, and industry trends. Expert tips for Afghan businesses."
        />
        <meta
          property="og:image"
          content="https://shivehview.com/Shivehview%20Transparent%20Logo.png"
        />
        <meta property="og:url" content="https://shivehview.com/blog" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Blog - Shivehview | Restaurant Digital Signage Insights"
        />
        <meta
          name="twitter:description"
          content="Latest insights on restaurant digital signage and AI technology."
        />
        <link rel="canonical" href="https://shivehview.com/blog" />
        <link rel="icon" href="/Shivehview Transparent Logo.png" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-900 hover:text-purple-600 transition-colors"
              >
                <img
                  src="/Shivehview Transparent Logo.png"
                  alt="Shivehview Logo"
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold tracking-tight">
                  Shivehview
                </span>
              </Link>
              <nav className="flex space-x-6">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/pricing"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Pricing
                </Link>
                <Link href="/blog" className="text-purple-600 font-medium">
                  Blog
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Shivehview Blog
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Insights, tips, and trends for business owners looking to
                transform their business with AI-powered digital signage and
                cultural content.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-12">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Featured Article
                </h2>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="md:flex">
                    <div className="md:w-1/3 bg-gradient-to-br from-purple-600 to-blue-600 p-8 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Eye className="w-16 h-16 mx-auto mb-4 opacity-80" />
                        <p className="text-lg font-semibold">Featured</p>
                      </div>
                    </div>
                    <div className="md:w-2/3 p-8">
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {featuredPost.category}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(featuredPost.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {featuredPost.readTime}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {featuredPost.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="w-4 h-4 mr-1" />
                          {featuredPost.author}
                        </div>
                        <Link
                          href={`/blog/${featuredPost.slug}`}
                          className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Read More
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Regular Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {post.category}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.date).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* No Results */}
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img
                    src="/Shivehview Transparent Logo.png"
                    alt="Shivehview Logo"
                    className="h-8 w-auto"
                  />
                  <span className="text-xl font-bold tracking-tight">
                    Shivehview
                  </span>
                </div>
                <p className="text-gray-400">
                  AI-powered business display platform for creating engaging
                  cultural experiences and digital content.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/" className="hover:text-white">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-white">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-white">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/about" className="hover:text-white">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-white">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <a
                      href="mailto:contact@shivehview.com"
                      className="hover:text-white"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/privacy-policy" className="hover:text-white">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms-of-service" className="hover:text-white">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookie-policy" className="hover:text-white">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
                <p>
                  &copy; 2024 Shivehview. All rights reserved. Built &
                  Maintained by{" "}
                  <a
                    href="https://shivehagency.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-pink-400 font-semibold"
                  >
                    SHIVEH
                  </a>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
