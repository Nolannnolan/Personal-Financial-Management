import React from 'react'
import { Clock, ExternalLink } from 'lucide-react';

const NewsCard = ({title, source, pubDate, image, link, logo, summary}) => {
  
  // Generate a summary if not provided (truncate title + content)
  const generateSummary = (title, maxLength = 120) => {
    if (!title) return '';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const displaySummary = summary || generateSummary(title);
  return (
    <a href={link} target='_blank' className='block'>
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-violet-200 mb-4 hover:bg-gray-50">
            {/* Image section with 16:9 ratio */}
            <div className="aspect-video overflow-hidden relative">
                <img 
                    src={image} 
                    alt={title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            {/* Content section */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3 text-base group-hover:text-violet-600 transition-colors leading-tight line-clamp-2">
                    {title}
                </h3>
                
                {/* Summary description - 2 lines with balanced font */}
                {displaySummary && (
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed opacity-90 font-normal line-clamp-2">
                        {displaySummary}
                    </p>
                )}
                
                {/* Source and time info */}
                <div className="flex items-center justify-between">
                    <div className='flex items-center gap-2'>
                        <img src={logo} alt={source} className='w-5 h-5 object-contain opacity-70'/>
                        <span className="text-xs text-gray-500 opacity-70 font-medium">
                            {source}
                        </span>
                    </div>
                    
                    {/* Time ở góc phải dưới card với icon đồng hồ ⏱️ */}
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{pubDate}</span>
                    </div>
                </div>
                
                {/* External link indicator */}
                <div className="flex items-center justify-end mt-2 text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ExternalLink className="w-3 h-3" />
                </div>
            </div>
        </div>
    </a>
  )
}

export default NewsCard
