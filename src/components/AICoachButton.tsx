'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AICoachButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        href="/ai-coach"
        className="group relative flex items-center justify-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tooltip */}
        {isHovered && (
          <div className="absolute right-16 mb-2 w-48 rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg">
            Get personalized financial advice from our AI Budget Coach
          </div>
        )}
        
        {/* Button */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 shadow-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
      </Link>
    </div>
  );
} 