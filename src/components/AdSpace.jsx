import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { trackEvent } from '../lib/analytics';

const AdSpace = ({ id, className, image, text, link }) => {
  const adRef = useRef(null);
  const hasViewed = useRef(false);

  useEffect(() => {
    if (!id) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasViewed.current) {
            trackEvent('ad_view', 'ad', id);
            hasViewed.current = true;
          }
        });
      },
      { threshold: 0.5 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [id]);

  const handleClick = () => {
    if (id) {
      trackEvent('ad_click', 'ad', id);
    }
    if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <div 
      ref={adRef}
      onClick={handleClick}
      className={clsx(
        "flex flex-col items-center justify-center bg-surface border border-border rounded-xl p-4 text-center transition-all hover:border-primary/50 group cursor-pointer overflow-hidden relative",
        className
      )}
    >
      {image ? (
        <div className="flex flex-col items-center justify-center h-full w-full gap-2">
          <img src={image} alt="Ad" className="h-8 object-contain" />
          {text && (
            <p className="text-[10px] text-text-muted leading-tight max-w-[200px] whitespace-pre-wrap">
              {text}
            </p>
          )}
        </div>
      ) : (
        <div className="w-full h-full bg-surface-hover/50 rounded-lg flex items-center justify-center text-text-muted text-sm font-medium">
          Ad Content
        </div>
      )}
    </div>
  );
};

export default AdSpace;
