import { Suspense } from 'react';
import { ThreeCube } from '../components/ThreeCube';

export function ThreeDemo({ onBack }: { onBack?: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Three.js Demo</h1>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-md bg-teal-500 hover:bg-teal-400 text-white transition"
            >
              Back
            </button>
          )}
        </div>

        <p className="text-teal-100 mb-4">
          A minimal spinning cube rendered via Three.js. This setup preserves function and class names across dev and prod to avoid runtime errors.
        </p>

        <div className="bg-white/10 rounded-xl p-2">
          <Suspense fallback={<div className="text-white">Loading Three.js...</div>}>
            <ThreeCube />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default ThreeDemo;