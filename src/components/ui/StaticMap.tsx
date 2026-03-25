import React from 'react';
import { HiMapPin } from 'react-icons/hi2';

interface StaticMapProps {
  lat: number;
  lng: number;
  className?: string;
}

const StaticMap: React.FC<StaticMapProps> = ({ lat, lng, className = '' }) => {
  const staticImageUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=800x400&markers=${lat},${lng},red-pushpin`;
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`block relative group cursor-pointer overflow-hidden rounded-2xl ${className}`}
    >
      <img
        src={staticImageUrl}
        alt="Location map"
        className="w-full h-64 object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
        <span className="bg-white/90 shadow-md px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <HiMapPin className="h-4 w-4" />
          Open in Google Maps
        </span>
      </div>
    </a>
  );
};

export default StaticMap;
