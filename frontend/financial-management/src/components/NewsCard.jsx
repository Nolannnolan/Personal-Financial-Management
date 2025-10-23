import React from 'react';
import { Clock } from 'lucide-react';

const NewsCard = ({ title, source, time, image }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#875cf5] transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="font-medium">{source}</span>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
