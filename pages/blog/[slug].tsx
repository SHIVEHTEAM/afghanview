import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Tag,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
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
    content: `
      <h2>The Digital Transformation of Afghan Restaurants</h2>
      <p>The restaurant industry in Afghanistan is experiencing a digital transformation, and AI-powered digital signage is at the forefront of this revolution. Shivehview's intelligent platform is helping restaurants create engaging, culturally relevant content that resonates with their customers.</p>
      
      <h3>Why AI Matters for Afghan Restaurants</h3>
      <p>Traditional menu boards and static displays are becoming obsolete. Modern customers expect dynamic, interactive content that can adapt to different times of day, seasons, and cultural events. AI-powered systems can automatically generate content that's relevant to Afghan culture and traditions.</p>
      
      <h3>Key Benefits of AI-Powered Digital Signage</h3>
      <ul>
        <li><strong>Cultural Relevance:</strong> AI can generate content that respects and celebrates Afghan culture</li>
        <li><strong>Dynamic Pricing:</strong> Update prices in real-time based on market conditions</li>
        <li><strong>Personalized Content:</strong> Show different content based on time of day or customer demographics</li>
        <li><strong>Multilingual Support:</strong> Display content in multiple languages including Dari, Pashto, and English</li>
        <li><strong>Analytics:</strong> Track which content performs best and optimize accordingly</li>
      </ul>
      
      <h3>Real-World Applications</h3>
      <p>Restaurants across Afghanistan are already seeing the benefits. From Kabul to Herat, establishments are using AI to create engaging content that showcases their traditional dishes while appealing to modern sensibilities.</p>
      
      <h3>The Future of Restaurant Technology</h3>
      <p>As technology continues to evolve, we can expect even more sophisticated AI features. From voice-activated ordering to personalized recommendations, the possibilities are endless for restaurants willing to embrace innovation.</p>
    `,
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
    content: `
      <h2>Essential Digital Menu Features</h2>
      <p>In today's competitive restaurant landscape, having a static printed menu is no longer enough. Modern customers expect interactive, visually appealing digital menus that provide more than just prices and descriptions.</p>
      
      <h3>1. High-Quality Visual Content</h3>
      <p>Your digital menu should showcase your dishes with professional photography. High-quality images can increase order value by up to 30%. Consider including multiple angles and close-ups of signature dishes.</p>
      
      <h3>2. Real-Time Updates</h3>
      <p>Digital menus should allow for instant updates. Whether it's changing prices, adding new items, or marking dishes as sold out, the ability to update content in real-time is crucial.</p>
      
      <h3>3. Multilingual Support</h3>
      <p>For Afghan restaurants, supporting multiple languages is essential. Your digital menu should easily switch between Dari, Pashto, English, and other relevant languages.</p>
      
      <h3>4. Interactive Elements</h3>
      <p>Include interactive features like nutritional information, ingredient lists, and customer reviews. This helps customers make informed decisions and increases engagement.</p>
      
      <h3>5. Integration with POS Systems</h3>
      <p>Seamless integration with your point-of-sale system ensures accurate pricing and inventory management. This prevents ordering issues and improves operational efficiency.</p>
    `,
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
    content: `
      <h2>Setting Up TV Displays: A Comprehensive Guide</h2>
      <p>TV displays in restaurants serve multiple purposes: they can showcase your menu, display promotional content, entertain customers, and even provide real-time information. However, setting up an effective TV display system requires careful planning.</p>
      
      <h3>Step 1: Assess Your Space</h3>
      <p>Before purchasing any equipment, evaluate your restaurant's layout. Consider factors like viewing angles, ambient lighting, and available wall space. The goal is to ensure all customers can see the displays clearly without straining.</p>
      
      <h3>Step 2: Choose the Right Hardware</h3>
      <p>Select TVs that are appropriate for your space and budget. Consider factors like screen size, resolution, and durability. Commercial-grade displays are recommended for restaurants as they're designed for extended use.</p>
      
      <h3>Step 3: Plan Your Content Strategy</h3>
      <p>Develop a content strategy that aligns with your brand and appeals to your target audience. This might include menu items, promotional offers, cultural content, and entertainment.</p>
      
      <h3>Step 4: Implement Content Management</h3>
      <p>Use a reliable content management system like Shivehview to schedule and update your content. This ensures your displays always show relevant, up-to-date information.</p>
      
      <h3>Step 5: Monitor and Optimize</h3>
      <p>Regularly review your content performance and make adjustments based on customer feedback and analytics data.</p>
    `,
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
    content: `
      <h2>Creating Culturally Relevant Content</h2>
      <p>Afghanistan has a rich cultural heritage that spans thousands of years. When creating digital content for Afghan restaurants, it's crucial to understand and respect these cultural nuances.</p>
      
      <h3>Understanding Afghan Culture</h3>
      <p>Afghan culture is deeply rooted in hospitality, family values, and traditional customs. Your digital content should reflect these values while maintaining a modern, professional appearance.</p>
      
      <h3>Cultural Elements to Include</h3>
      <ul>
        <li><strong>Traditional Patterns:</strong> Incorporate Afghan geometric patterns and designs</li>
        <li><strong>Cultural Celebrations:</strong> Highlight important dates and celebrations</li>
        <li><strong>Local Language:</strong> Use appropriate greetings and phrases in Dari and Pashto</li>
        <li><strong>Family Focus:</strong> Emphasize family dining and community aspects</li>
      </ul>
      
      <h3>Balancing Tradition and Innovation</h3>
      <p>While it's important to respect cultural traditions, don't be afraid to innovate. Modern technology can enhance traditional experiences without diminishing their cultural significance.</p>
    `,
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
    content: `
      <h2>Digital Signage ROI: The Numbers Don't Lie</h2>
      <p>Digital signage isn't just about looking modern—it's a powerful tool for increasing revenue. Restaurants that implement digital signage solutions typically see a 15-30% increase in average order value.</p>
      
      <h3>Revenue Impact Statistics</h3>
      <ul>
        <li>Average order value increases by 15-30%</li>
        <li>Customer dwell time increases by 20-40%</li>
        <li>Impulse purchases increase by 25%</li>
        <li>Customer satisfaction scores improve by 35%</li>
      </ul>
      
      <h3>Case Study: Kabul Restaurant Success</h3>
      <p>A popular restaurant in Kabul implemented Shivehview's digital signage system and saw remarkable results within three months. Their average order value increased by 28%, and customer satisfaction scores improved significantly.</p>
      
      <h3>Cost-Benefit Analysis</h3>
      <p>While there's an initial investment in digital signage, the long-term benefits far outweigh the costs. Most restaurants see a return on investment within 6-12 months.</p>
    `,
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
    content: `
      <h2>Restaurant Technology Trends 2024</h2>
      <p>The restaurant industry is evolving rapidly, driven by technological advancements and changing customer expectations. As we move through 2024, several key trends are shaping the future of dining.</p>
      
      <h3>AI-Powered Personalization</h3>
      <p>Artificial intelligence is becoming more sophisticated, allowing restaurants to offer personalized experiences based on customer preferences and behavior patterns.</p>
      
      <h3>Contactless Technology</h3>
      <p>The pandemic accelerated the adoption of contactless technology, and this trend continues to grow. Digital menus, mobile ordering, and touchless payment systems are becoming standard.</p>
      
      <h3>Immersive Experiences</h3>
      <p>Augmented reality and virtual reality are creating new possibilities for restaurant experiences, from virtual menu previews to immersive dining environments.</p>
      
      <h3>Sustainability Focus</h3>
      <p>Technology is helping restaurants become more sustainable through smart inventory management, waste reduction, and energy-efficient systems.</p>
    `,
    author: "Tech Expert",
    date: "2024-01-01",
    readTime: "8 min read",
    category: "Trends",
    tags: ["Future Trends", "Restaurant Technology", "Innovation", "2024"],
    slug: "future-restaurant-technology-trends-2024",
  },
];

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The article you're looking for doesn't exist.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${post.title} - Read on Shivehview Blog`;

  return (
    <>
      <Head>
        <title>{post.title} - Shivehview Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={`https://shivehview.com/blog/${post.slug}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <link
          rel="canonical"
          href={`https://shivehview.com/blog/${post.slug}`}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-900 hover:text-purple-600 transition-colors"
              >
                <img
                  src="/Shivehview%20Transparent%20Logo.png"
                  alt="Shivehview Logo"
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold">Shivehview</span>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back Button */}
            <div className="mb-8">
              <Link
                href="/blog"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Blog
              </Link>
            </div>

            {/* Article Header */}
            <header className="mb-12">
              <div className="flex items-center space-x-4 mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {post.category}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(post.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.readTime}
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {post.title}
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  By {post.author}
                </div>

                {/* Share Buttons */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Share:</span>
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          shareUrl
                        )}`,
                        "_blank"
                      )
                    }
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          shareText
                        )}&url=${encodeURIComponent(shareUrl)}`,
                        "_blank"
                      )
                    }
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                          shareUrl
                        )}`,
                        "_blank"
                      )
                    }
                    className="text-gray-400 hover:text-blue-700 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </header>

            {/* Article Content */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Tags */}
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tags:
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Related Articles */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogPosts
                  .filter((p) => p.id !== post.id)
                  .slice(0, 4)
                  .map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center mt-4 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(relatedPost.date).toLocaleDateString()}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </motion.article>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img
                    src="/Shivehview%20Transparent%20Logo.png"
                    alt="Shivehview Logo"
                    className="h-8 w-auto"
                  />
                  <span className="text-xl font-bold tracking-tight">
                    Shivehview
                  </span>
                </div>
                <p className="text-gray-400">
                  AI-powered restaurant display platform for creating engaging
                  cultural experiences and digital menus.
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
