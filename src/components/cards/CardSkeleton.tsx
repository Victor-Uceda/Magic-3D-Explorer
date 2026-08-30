import React from 'react';

interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 8 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={`skeleton-${idx}`} className="catalog-grid-item skeleton-card-item">
          <div className="card-media-wrapper skeleton-media-box">
            <div className="skeleton-shimmer" />
          </div>
          <div className="card-item-meta skeleton-meta">
            <div className="skeleton-line skeleton-title-line" />
            <div className="skeleton-row">
              <div className="skeleton-line skeleton-badge-line" />
              <div className="skeleton-line skeleton-price-line" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
