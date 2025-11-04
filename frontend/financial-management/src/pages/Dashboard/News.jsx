import React, { useState } from 'react'
import DashBoardLayout from '../../components/layouts/DashboardLayout'
import MarketTicker from '../../components/News/MarketTicker'
import { useUserAuth } from '../../hooks/useUserAuth';
import NewsSection from '../../components/News/NewsSection';
import MarketCharts from '../../components/News/MarketCharts';
import WatchlistSection from '../../components/News/WatchlistSection';
import ChatPanel from '../../components/ChatPanel';
import { MessageCircle, X } from 'lucide-react';

const News = () => {
    useUserAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <DashBoardLayout activeMenu="News">
      <div className='my-5 mx-auto' style={{maxWidth: '1400px', padding: '0 16px'}}>
        {/* ① Thanh ticker trên cùng */}
        <MarketTicker />
        
        {/* ②③④ Layout 3 cột theo chiều dọc (25% - 50% - 25%) */}
        <div className='grid grid-cols-12 gap-3 mt-6'>
          {/* ② Cột trái: Tin tức - 25% */}
          <div className='col-span-3'>
            <NewsSection />
          </div>
          
          {/* ③ Cột giữa: Biểu đồ / Chỉ số - 50% */}
          <div className='col-span-6'>
            <MarketCharts />
          </div>
          
          {/* ④ Cột phải: Watchlist / Gợi ý - 25% */}
          <div className='col-span-3'>
            <WatchlistSection />
          </div>
        </div>
      </div>
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-40">
          <ChatPanel onClose={() => setIsChatOpen(false)} />
        </div>
      )}
      <button
        aria-label={isChatOpen ? 'Đóng chatbot' : 'Mở chatbot'}
        onClick={() => setIsChatOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#875cf5] text-white shadow-xl hover:bg-[#7049d0] transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#875cf5]"
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </DashBoardLayout>
  )
}

export default News
