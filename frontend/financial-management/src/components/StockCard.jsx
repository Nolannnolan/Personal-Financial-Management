import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StockCard = ({ symbol, name, price, change, chartData }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-bold text-gray-800">{symbol}</h4>
          <p className="text-xs text-gray-500">{name}</p>
        </div>
        {isPositive ? (
          <TrendingUp className="w-5 h-5 text-green-500" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-500" />
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-bold text-gray-800">{price}</p>
          <p className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}
            {change}%
          </p>
        </div>
        <svg width="60" height="30" className="opacity-50">
          <polyline 
            points={chartData.map((val, i) => `${i * 12},${30 - val * 3}`).join(' ')} 
            fill="none" 
            stroke={isPositive ? '#10b981' : '#ef4444'} 
            strokeWidth="2" 
          />
        </svg>
      </div>
    </div>
  );
};

export default StockCard;
