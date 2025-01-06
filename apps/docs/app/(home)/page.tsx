import Link from "next/link";
import { Banner } from 'fumadocs-ui/components/banner';

export default function HomePage() {
  return (
    <main className="min-h-screen py-20 px-4">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
          Not251
        </h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
          A powerful TypeScript library for music theory, composition, and analysis
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/docs" 
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Get Started
          </Link>
          <Link 
            href="/docs/theory/mode" 
            className="border border-purple-600 text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
          >
            Learn Theory
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-4">
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-semibold mb-3">🎼 Music Theory</h3>
          <p className="text-gray-600 dark:text-gray-300">Comprehensive tools for scales, modes, chords, and intervals analysis</p>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-semibold mb-3">🎹 Composition</h3>
          <p className="text-gray-600 dark:text-gray-300">Advanced utilities for counterpoint, patterns, and musical grid operations</p>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-semibold mb-3">🔍 Analysis</h3>
          <p className="text-gray-600 dark:text-gray-300">Tools for scale detection, interval vectors, and musical distance calculations</p>
        </div>
      </div>
    </main>
  );
}
