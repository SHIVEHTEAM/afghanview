import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Globe, Twitter, Instagram, Github } from "lucide-react";

const RestaurantInfo: React.FC = () => {
  return (
    <motion.div
      className="fixed top-6 left-6 z-40"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 }}
    >
      <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20 shadow-2xl">
        {/* Restaurant Logo/Name */}
        <div className="text-center mb-6">
          <motion.h2
            className="text-3xl font-bold mb-2 text-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            Afghan Palace
          </motion.h2>
          <motion.p
            className="text-lg opacity-90 font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            Authentic Afghan Cuisine
          </motion.p>
          <motion.div
            className="w-16 h-1 bg-gradient-to-r from-afghan-green to-afghan-red mx-auto mt-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "4rem" }}
            transition={{ delay: 1.4, duration: 0.5 }}
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-4 mb-6">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6 }}
          >
            <div className="w-8 h-8 bg-afghan-green rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm">123 Main Street, City, State</span>
          </motion.div>

          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8 }}
          >
            <div className="w-8 h-8 bg-afghan-red rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm">(555) 123-4567</span>
          </motion.div>

          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.0 }}
          >
            <div className="w-8 h-8 bg-afghan-gold rounded-full flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm">www.afghanpalace.com</span>
          </motion.div>
        </div>

        {/* QR Code */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2 }}
        >
          <div className="bg-white rounded-xl p-3 inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-afghan-green to-afghan-red rounded-lg flex items-center justify-center">
              <div className="text-white text-xs font-bold text-center">
                <div>QR</div>
                <div>CODE</div>
              </div>
            </div>
          </div>
          <p className="text-xs mt-2 opacity-70">Scan for menu</p>
        </motion.div>

        {/* Social Media Icons */}
        <motion.div
          className="flex justify-center space-x-3 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4 }}
        >
          <motion.div
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Twitter className="w-4 h-4 text-white" />
          </motion.div>
          <motion.div
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Instagram className="w-4 h-4 text-white" />
          </motion.div>
          <motion.div
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Github className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RestaurantInfo;
