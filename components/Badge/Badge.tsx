import React from 'react';
import Image from 'next/image';

interface BadgeProps {
  image: string;
  title: string;
  distance?: string;
  elevation?: string;
  time?: string;
  children?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ image, title, distance, elevation, time, children }) => {
  return (
    <div className="badge">
      <div className="badge-image">
        <Image src={image} alt={title}
          width={100}
          height={100} />
      </div>
      <h3 className="badge-title">{title}</h3>
      <div className="badge-content">
        <span className="badge-time">Time: {time}</span>
        <span className="badge-distance">Distance: {distance}</span>
        <span className="badge-time">Elevation: {elevation}</span>
        <div className="badge-details">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Badge;
