import { Link } from 'react-router-dom';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function UpgradeBanner({
  title,
  description,
  features = [],
  ctaText,
  ctaLink,
  dismissible = false
}) {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) return null;
  
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
      
      <div className="relative px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-white" />
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <p className="mt-2 text-sm text-blue-100">{description}</p>
            
            {features.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm"
                  >
                    ✓ {feature}
                  </span>
                ))}
              </div>
            )}
            
            <div className="mt-4">
              <Link
                to={ctaLink}
                className="inline-flex items-center px-6 py-2.5 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                {ctaText}
              </Link>
            </div>
          </div>
          
          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 ml-4 text-white/80 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
