import React, { useEffect, useState } from 'react'
import { FiRefreshCw } from 'react-icons/fi';
import NewsCard from '../Cards/NewsCard';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import { formatTimeAgo } from '../../utils/helper';

const NewsSection = () => {
    
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNews = async ({ append = true } = {}) => {
        if (loading) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get(API_PATHS.NEWS.GET_NEWS);
            const items = Array.isArray(res?.data?.data) ? res.data.data : [];
            setNews(prev => (append ? [...prev, ...items] : items));
        } catch (err) {
            console.error("Lỗi khi lấy tin:", err);
        } finally {
            setLoading(false);
        }
    };

    // Infinite scroll implementation
    const handleScroll = (e) => {
        const element = e.target;
        if (element.scrollHeight - element.scrollTop === element.clientHeight) {
            fetchNews({ append: true });
        }
    };

    useEffect(() => {
        fetchNews({ append: false });

        const interval = setInterval(() => fetchNews({ append: false }), 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleReload = () => {
        fetchNews({ append: false });
    };
  
    return (
        <div className='card'>
            {/* Header with news title and icon */}
            <div className='border-b border-gray-200 pb-4 mb-6'>
                <div className='flex items-center justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                    <span className='text-3xl'>📰</span>
                    <h2 className='text-2xl font-bold text-gray-900'>Tin tức mới</h2>
                </div>
                    <button
                        type='button'
                        onClick={handleReload}
                        disabled={loading}
                        className='inline-flex items-center justify-center rounded-full p-2 text-violet-600 hover:text-violet-700 hover:bg-violet-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        aria-label='Tải lại tin tức'
                    >
                        <FiRefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* News cards list với infinite scroll */}
            <div 
                className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2"
                onScroll={handleScroll}
            >
                {news.map((item, index) => (
                    <NewsCard 
                        key={index}
                        title={item.title}
                        source={item.source}
                        pubDate={formatTimeAgo(item.pubDate)}
                        image={item.image}
                        link={item.link}
                        logo={item.logo}
                    />
                ))}
                
                {/* Loading indicator */}
                {loading && (
                    <div className="flex justify-center py-4">
                        <div className="text-sm text-gray-500 font-medium">Đang tải thêm tin tức...</div>
                    </div>
                )}
            </div>

        </div>
    )
}

export default NewsSection
