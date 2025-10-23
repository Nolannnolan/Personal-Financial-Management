import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MarketChart = () => {
  const [timeframe, setTimeframe] = useState('1D');
  const timeframes = ['1D', '1W', '1M', '3M', '1Y'];
  
  const data = [
    { time: '9:00', value: 1200 },
    { time: '10:00', value: 1250 },
    { time: '11:00', value: 1180 },
    { time: '12:00', value: 1300 },
    { time: '13:00', value: 1280 },
    { time: '14:00', value: 1350 },
    { time: '15:00', value: 1320 }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">VN-Index</h3>
        <div className="flex gap-2">
          {timeframes.map(tf => (
            <button 
              key={tf} 
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                timeframe === tf 
                  ? 'bg-[#875cf5] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="time" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#875cf5" 
            strokeWidth={2} 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketChart;
