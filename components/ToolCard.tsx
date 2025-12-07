'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ToolCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  href?: string;
  comingSoon?: boolean;
}

export default function ToolCard({ title, description, icon, href, comingSoon = false }: ToolCardProps) {
  const cardContent = (
    <motion.div
      className={`
        relative h-full rounded-xl border bg-white p-6 shadow-sm transition-all duration-300
        ${comingSoon 
          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
        }
      `}
      whileHover={comingSoon ? {} : { y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {comingSoon && (
        <div className="absolute top-4 right-4">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      )}
      
      <div className="mb-4">
        {icon || (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            comingSoon ? 'bg-gray-200' : 'bg-blue-100'
          }`}>
            <svg
              className={`w-6 h-6 ${comingSoon ? 'text-gray-400' : 'text-blue-600'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        )}
      </div>
      
      <h3 className={`text-xl font-semibold mb-2 ${comingSoon ? 'text-gray-500' : 'text-gray-900'}`}>
        {title}
      </h3>
      
      <p className={`text-sm leading-relaxed ${comingSoon ? 'text-gray-400' : 'text-gray-600'}`}>
        {description}
      </p>
      
      {!comingSoon && (
        <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
          Open tool
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </motion.div>
  );

  if (comingSoon || !href) {
    return <div className="h-full">{cardContent}</div>;
  }

  return (
    <Link href={href} className="h-full block">
      {cardContent}
    </Link>
  );
}



