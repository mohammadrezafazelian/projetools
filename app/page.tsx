'use client';

import { motion } from 'framer-motion';
import ToolCard from '@/components/ToolCard';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 pt-20 pb-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            variants={itemVariants}
          >
            A toolbox of smart utilities for{' '}
            <span className="text-blue-600">modern project managers</span>
          </motion.h1>
          
          <motion.p
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Explore analytical tools for risk analysis, schedule evaluation, and more—built with industry standards.
          </motion.p>
        </div>
      </motion.section>

      {/* Toolbox Grid Section */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8 text-center"
            variants={itemVariants}
          >
            Available Tools
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <motion.div variants={itemVariants}>
              <ToolCard
                title="Advanced Risk System"
                description="Pattern-based multi-dimensional risk analysis with deep logic checks."
                href="/tools/risk-behavior-analysis"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <ToolCard
                title="Schedule Quality Analyzer"
                description="CPM, float diagnostics, and DCMA 14-Point assessment in one tool."
                href="/tools/schedule-analyzer"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <ToolCard
                title="Coming Soon"
                description="A new project management utility is on the way."
                comingSoon={true}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Brand Message Section */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-50"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            className="text-lg text-gray-700 leading-relaxed"
            variants={itemVariants}
          >
            <span className="font-semibold text-gray-900">proje.tools</span> is an expanding ecosystem of utilities designed for precision, clarity, and practical project management.
          </motion.p>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-xl font-bold text-gray-900">proje.tools</h3>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} proje.tools. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}



