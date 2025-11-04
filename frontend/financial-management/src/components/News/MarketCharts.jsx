import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, DollarSign, Calendar, TrendingUp as UpIcon, TrendingDown as DownIcon } from 'lucide-react';

const MarketCharts = () => {
    const [selectedMarket, setSelectedMarket] = useState('VNI');
    const [selectedTimeRange, setSelectedTimeRange] = useState('1D');

    const marketData = {
        'VNI': {
            name: 'VN-Index',
            current: '1,234.56',
            change: 2.5,
            openPrice: '1,204.32',
            closePrice: '1,234.56',
            highPrice: '1,245.00',
            lowPrice: '1,198.75',
            volume: '234.5B',
            value: '2.8T'
        },
        'BTC': {
            name: 'Bitcoin',
            current: '$45,678',
            change: -1.2,
            openPrice: '$46,234',
            closePrice: '$45,678',
            highPrice: '$47,890',
            lowPrice: '$45,123',
            volume: '1.2B',
            value: '$45.6B'
        },
        'ETH': {
            name: 'Ethereum',
            current: '$3,456',
            change: 3.8,
            openPrice: '$3,332',
            closePrice: '$3,456',
            highPrice: '$3,567',
            lowPrice: '$3,290',
            volume: '890M',
            value: '$3.5B'
        },
        'GOLD': {
            name: 'Vàng SJC',
            current: '$1,890',
            change: 0.5,
            openPrice: '$1,881',
            closePrice: '$1,890',
            highPrice: '$1,920',
            lowPrice: '$1,875',
            volume: '125K',
            value: '$236.3M'
        }
    };

    const currentMarket = marketData[selectedMarket];

    const renderChartPlaceholder = () => (
        <div className="relative h-64 bg-gradient-to-br from-violet-50 to-blue-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-sm text-gray-500 mb-2">Biểu đồ giá {currentMarket.name}</div>
                    <div className="text-xs text-gray-400">Đang tải dữ liệu...</div>
                </div>
            </div>
            {/* Simulated chart lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#875cf5', stopOpacity: 0.3}} />
                        <stop offset="100%" style={{stopColor: '#875cf5', stopOpacity: 0}} />
                    </linearGradient>
                </defs>
                <path
                    d={`M 20,120 Q 50,100 80,110 T 140,90 T 200,100 T 260,85 T 320,95`}
                    fill="none"
                    stroke="#875cf5"
                    strokeWidth="2"
                    className="opacity-60"
                />
                <path
                    d={`M 20,120 Q 50,100 80,110 T 140,90 T 200,100 T 260,85 T 320,95 L 320,180 L 20,180 Z`}
                    fill="url(#chartGradient)"
                    className="opacity-40"
                />
            </svg>
        </div>
    );

    const renderMarketIndicators = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Giá mở cửa</div>
                <div className="font-semibold text-gray-900">{currentMarket.openPrice}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Giá đóng cửa</div>
                <div className="font-semibold text-gray-900">{currentMarket.closePrice}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Cao nhất</div>
                <div className="font-semibold text-green-600">{currentMarket.highPrice}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Thấp nhất</div>
                <div className="font-semibold text-red-600">{currentMarket.lowPrice}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Khối lượng</div>
                <div className="font-semibold text-gray-900">{currentMarket.volume}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Giá trị</div>
                <div className="font-semibold text-gray-900">{currentMarket.value}</div>
            </div>
        </div>
    );

    return (
        <div className="card bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Header */}
            <div className="border-b border-gray-200 p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-violet-600" />
                        <h2 className="text-xl font-bold text-gray-900">📊 Thị trường hôm nay</h2>
                    </div>
                </div>
                
                {/* Market tabs */}
                <div className="flex gap-2 mb-4">
                    {['VNI', 'BTC', 'ETH', 'GOLD'].map((market) => (
                        <button
                            key={market}
                            onClick={() => setSelectedMarket(market)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedMarket === market
                                    ? 'bg-violet-100 text-violet-700 border border-violet-200 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
                            }`}
                        >
                            {market}
                            <span className="ml-1 text-xs opacity-60">({marketData[market].name})</span>
                        </button>
                    ))}
                </div>

                {/* Time range selector */}
                <div className="flex gap-2">
                    {['1D', '1W', '1M', '1Y'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setSelectedTimeRange(range)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                selectedTimeRange === range
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Current price display */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg">
                    <div>
                        <div className="text-sm text-gray-600 mb-1">{currentMarket.name}</div>
                        <div className="text-2xl font-bold text-gray-900">{currentMarket.current}</div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        currentMarket.change > 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {currentMarket.change > 0 ? (
                            <UpIcon className="w-4 h-4" />
                        ) : (
                            <DownIcon className="w-4 h-4" />
                        )}
                        <span className="font-semibold">
                            {currentMarket.change > 0 ? '+' : ''}{currentMarket.change}%
                        </span>
                    </div>
                </div>

                {/* Chart placeholder */}
                {renderChartPlaceholder()}

                {/* Market indicators */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin chi tiết</h3>
                    {renderMarketIndicators()}
                </div>
            </div>

            {/* Footer with market summary */}
            <div className="border-t border-gray-200 p-6 pt-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                            <Activity className="w-4 h-4" />
                            <span className="text-sm font-medium">Đang tăng</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">156</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                            <Activity className="w-4 h-4" />
                            <span className="text-sm font-medium">Đang giảm</span>
                        </div>
                        <div className="text-lg font-bold text-red-600">89</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-sm font-medium">Tổng GTGD</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">5.2T</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketCharts;
