import React from 'react';
import { clsx } from 'clsx';

const AdSpace = ({ className, image, text }) => {
  return (
    <div className={clsx(
      "flex flex-col items-center justify-center bg-surface border border-border rounded-xl p-4 text-center transition-all hover:border-primary/50 group cursor-pointer overflow-hidden relative",
      className
    )}>
      {image ? (
        <div className="flex flex-col items-center justify-center h-full w-full gap-2">
          <img src={image} alt="Ad" className="h-8 object-contain" />
          {text && (
            <p className="text-[10px] text-text-muted leading-tight max-w-[200px]">
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
