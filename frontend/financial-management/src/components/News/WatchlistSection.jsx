import React, { useEffect, useMemo, useState } from 'react';
import { Star, Plus, TrendingUp, TrendingDown, Eye, X, Search } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const SYMBOL_DIRECTORY = [
    { symbol: 'VNINDEX', name: 'VN-Index', type: 'index' },
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock' },
    { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
    { symbol: 'FPT', name: 'FPT Corp', type: 'stock' },
    { symbol: 'VCB', name: 'Vietcombank', type: 'stock' },
    { symbol: 'VHM', name: 'Vingroup', type: 'stock' },
    { symbol: 'MWG', name: 'Mobile World Group', type: 'stock' },
    { symbol: 'HDB', name: 'HDBank', type: 'stock' },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
    { symbol: 'VIC', name: 'Vingroup JSC', type: 'stock' },
    { symbol: 'HPG', name: 'Hoa Phat Group', type: 'stock' },
    { symbol: 'SSI', name: 'SSI Securities', type: 'stock' },
    { symbol: 'VND', name: 'VNDirect Securities', type: 'stock' },
    { symbol: 'DOGE', name: 'Dogecoin', type: 'crypto' },
    { symbol: 'SOL', name: 'Solana', type: 'crypto' }
];

const quoteRangeByType = {
    index: [900, 1300],
    stock: [20000, 150000],
    crypto: [200, 65000]
};

const createMockQuote = type => {
    const [min, max] = quoteRangeByType[type] || [15000, 120000];
    const rawPrice = Math.random() * (max - min) + min;
    const rawChange = Math.random() * 6 - 3;
    const formattedPrice = type === 'index'
        ? rawPrice.toFixed(2)
        : type === 'crypto'
            ? rawPrice.toFixed(2)
            : new Intl.NumberFormat('vi-VN').format(Math.round(rawPrice));
    return {
        price: formattedPrice,
        change: parseFloat(rawChange.toFixed(2))
    };
};

const mergeWithMockData = items =>
    items.map(item => {
        const meta = SYMBOL_DIRECTORY.find(entry => entry.symbol === item.symbol) || {
            symbol: item.symbol,
            name: item.symbol,
            type: item.type || 'stock'
        };
        const quote = createMockQuote(meta.type);
        return {
            ...meta,
            ...item,
            price: quote.price,
            change: quote.change,
            starred: Boolean(item.starred)
        };
    });

const WatchlistSection = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mutationTarget, setMutationTarget] = useState(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchWatchlist = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(API_PATHS.WATCHLIST.GET);
                setWatchlist(mergeWithMockData(response.data.items || []));
                setError(null);
            } catch (err) {
                setError(err?.response?.data?.message || 'Không thể tải danh sách theo dõi');
            } finally {
                setLoading(false);
            }
        };

        fetchWatchlist();
    }, []);

    const existingSymbols = useMemo(
        () => new Set(watchlist.map(item => item.symbol)),
        [watchlist]
    );

    const filteredOptions = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        return SYMBOL_DIRECTORY
            .filter(option => !existingSymbols.has(option.symbol))
            .filter(option =>
                !keyword ||
                option.symbol.toLowerCase().includes(keyword) ||
                option.name.toLowerCase().includes(keyword)
            )
            .slice(0, 8);
    }, [existingSymbols, searchTerm]);

    const marketSegments = useMemo(() => {
        const pickRandom = (count, exclusions = []) => {
            const pool = SYMBOL_DIRECTORY.filter(item => !exclusions.includes(item.symbol));
            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, count);
        };

        const toRows = (symbols, direction = 0) =>
            symbols.map(entry => {
                const quote = createMockQuote(entry.type);
                const change = direction === 0
                    ? quote.change
                    : direction > 0
                        ? Math.abs(quote.change)
                        : -Math.abs(quote.change);
                return {
                    symbol: entry.symbol,
                    name: entry.name,
                    price: quote.price,
                    change
                };
            });

        const gainers = toRows(pickRandom(4), 1);
        const losers = toRows(pickRandom(4, gainers.map(item => item.symbol)), -1);
        const volume = toRows(pickRandom(4, [...gainers, ...losers].map(item => item.symbol)));

        return {
            topGainers: gainers,
            topLosers: losers,
            highVolume: volume
        };
    }, []);

    const handleToggleFavorite = async symbol => {
        const target = watchlist.find(item => item.symbol === symbol);
        if (!target) return;
        setMutationTarget(symbol);
        try {
            const response = await axiosInstance.patch(API_PATHS.WATCHLIST.STAR, {
                symbol,
                starred: !target.starred
            });
            setWatchlist(mergeWithMockData(response.data.items || []));
            setError(null);
        } catch (err) {
            setError(err?.response?.data?.message || 'Không thể cập nhật trạng thái yêu thích');
        } finally {
            setMutationTarget(null);
        }
    };

    const handleRemove = async symbol => {
        setMutationTarget(symbol);
        try {
            const response = await axiosInstance.delete(API_PATHS.WATCHLIST.REMOVE(symbol));
            setWatchlist(mergeWithMockData(response.data.items || []));
            setError(null);
        } catch (err) {
            setError(err?.response?.data?.message || 'Không thể xoá mã khỏi danh sách');
        } finally {
            setMutationTarget(null);
        }
    };

    const handleAddSymbol = async option => {
        setMutationTarget(option.symbol);
        try {
            const response = await axiosInstance.post(API_PATHS.WATCHLIST.ADD, {
                symbol: option.symbol,
                type: option.type
            });
            setWatchlist(mergeWithMockData(response.data.items || []));
            setError(null);
            setIsPickerOpen(false);
            setSearchTerm('');
        } catch (err) {
            setError(err?.response?.data?.message || 'Không thể thêm mã vào danh sách');
        } finally {
            setMutationTarget(null);
        }
    };

    // Enhanced table row with color animation for changes
    const renderTableRow = (item, showFavorite = true, onRemove = null) => {
        const changeValue = Number(item.change || 0);
        const isPositive = changeValue > 0;
        const isNegative = changeValue < 0;

        return (
            <div
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-200 group"
            >
                {/* Symbol and Name */}
                <div className="flex-1 flex items-center gap-3">
                    {showFavorite && (
                        <button
                            onClick={() => handleToggleFavorite(item.symbol)}
                            disabled={mutationTarget === item.symbol}
                            className={`transition-all duration-300 ${
                                item.starred
                                    ? 'text-yellow-500 hover:text-yellow-600'
                                    : 'text-gray-400 hover:text-yellow-500'
                            }`}
                        >
                            <Star className={`w-4 h-4 ${item.starred ? 'fill-current' : ''}`} />
                        </button>
                    )}
                    <div className="min-w-0">
                        <div className="font-bold text-gray-900 text-sm">{item.symbol}</div>
                        <div className="text-xs text-gray-500 truncate">{item.name}</div>
                    </div>
                </div>

                {/* Price */}
                <div className="min-w-16 text-center">
                    <div className="font-semibold text-gray-900">{item.price}</div>
                </div>

                {/* Change percentage with color animation */}
                <div className={`min-w-20 text-right font-semibold text-sm transition-all duration-500 ${
                    isPositive
                        ? 'text-green-500 group-hover:text-green-600 price-up-animation'
                        : isNegative
                            ? 'text-red-500 group-hover:text-red-600 price-down-animation'
                            : 'text-gray-500'
                }`}>
                    <div className="flex items-center justify-end gap-1">
                        {isNegative ? (
                            <TrendingDown className="w-3 h-3" />
                        ) : (
                            <TrendingUp className="w-3 h-3" />
                        )}
                        <span>{changeValue > 0 ? '+' : ''}{changeValue.toFixed(2)}%</span>
                    </div>
                </div>

                {/* Remove button for suggestions */}
                {onRemove && (
                    <button
                        onClick={() => onRemove(item.symbol)}
                        disabled={mutationTarget === item.symbol}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-400 hover:text-red-500 p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Watchlist Table */}
            <div className="card bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <h3 className="text-base font-bold text-gray-900">My Watchlist</h3>
                        </div>
                        <button
                            onClick={() => {
                                setIsPickerOpen(prev => !prev);
                                setSearchTerm('');
                            }}
                            className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" />
                            Thêm mã
                        </button>
                    </div>
                    {isPickerOpen && (
                        <div className="absolute right-4 top-16 w-72 bg-white border border-gray-200 shadow-lg rounded-xl z-20">
                            <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                                <Search className="w-4 h-4 text-gray-400" />
                                <input
                                    value={searchTerm}
                                    onChange={event => setSearchTerm(event.target.value)}
                                    placeholder="Tìm mã cổ phiếu hoặc crypto"
                                    className="w-full text-sm outline-none"
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {filteredOptions.length === 0 && (
                                    <div className="p-4 text-sm text-gray-500">
                                        Không tìm thấy mã phù hợp.
                                    </div>
                                )}
                                {filteredOptions.map(option => (
                                    <button
                                        key={option.symbol}
                                        onClick={() => handleAddSymbol(option)}
                                        className="w-full text-left px-4 py-3 hover:bg-violet-50 transition-colors flex flex-col"
                                        disabled={mutationTarget === option.symbol}
                                    >
                                        <span className="text-sm font-semibold text-gray-900">{option.symbol}</span>
                                        <span className="text-xs text-gray-500">{option.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Table Header */}
                <div className="px-4 py-2 bg-gray-50 rounded-t-lg grid grid-cols-12 gap-2 text-xs font-medium text-gray-600">
                    <div className="col-span-5 pl-8">Mã</div>
                    <div className="col-span-3 text-center">Giá</div>
                    <div className="col-span-4 text-right pr-8">Thay đổi</div>
                </div>

                {/* Table Content */}
                <div className="space-y-1 p-2 max-h-[280px] overflow-y-auto">
                    {loading && (
                        <div className="p-4 text-sm text-gray-500">Đang tải danh sách...</div>
                    )}
                    {!loading && watchlist.length === 0 && (
                        <div className="p-4 text-sm text-gray-500">Chưa có mã nào trong danh sách của bạn.</div>
                    )}
                    {!loading && watchlist.map(item => (
                        <div key={item.symbol} className="animate-slide-in">
                            {renderTableRow(item, true, handleRemove)}
                        </div>
                    ))}
                </div>
                {error && (
                    <div className="px-4 pb-4">
                        <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    </div>
                )}
            </div>

            {/* Top Gainers */}
            <div className="card bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">Top Tăng</h3>
                    </div>
                </div>

                <div className="space-y-1 p-2 max-h-[200px] overflow-y-auto">
                    {marketSegments.topGainers.map(item => (
                        <div key={item.symbol} className="animate-slide-in">
                            {renderTableRow(item, false)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Losers */}
            <div className="card bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                            <TrendingDown className="w-3 h-3 text-red-600" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">Top Giảm</h3>
                    </div>
                </div>

                <div className="space-y-1 p-2 max-h-[200px] overflow-y-auto">
                    {marketSegments.topLosers.map(item => (
                        <div key={item.symbol} className="animate-slide-in">
                            {renderTableRow(item, false)}
                        </div>
                    ))}
                </div>
            </div>

            {/* High Volume */}
            <div className="card bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Eye className="w-3 h-3 text-blue-600" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">Khối lượng cao</h3>
                    </div>
                </div>

                <div className="space-y-1 p-2 max-h-[200px] overflow-y-auto">
                    {marketSegments.highVolume.map(item => (
                        <div key={item.symbol} className="animate-slide-in">
                            {renderTableRow(item, false)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WatchlistSection;