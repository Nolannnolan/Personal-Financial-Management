"""
Tool: generate_candlestick_chart
Mô tả: Tạo biểu đồ nến Nhật (candlestick chart) cho cổ phiếu
Data source: yfinance historical data
Returns: Base64 encoded PNG image
"""

import base64
import datetime
import logging
from io import BytesIO
from typing import Dict, Any, Optional
import matplotlib
matplotlib.use("Agg")  # Use non-GUI backend
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.patches import Rectangle
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# Try to import yfinance
USE_YFINANCE = False
try:
    import yfinance as yf
    USE_YFINANCE = True
except ImportError:
    logger.warning("yfinance not available, will use mock data for candlestick charts")


def generate_candlestick_chart(
    ticker: str,
    period: str = "1mo",  # 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    interval: str = "1d",  # 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
    show_volume: bool = True,
    show_ma: bool = True,
    ma_periods: list = [20, 50]
) -> Dict[str, Any]:
    """
    Tạo biểu đồ nến Nhật cho cổ phiếu với volume và moving averages.
    
    Args:
        ticker: Mã cổ phiếu (e.g., "FPT.VN", "VCB.VN", "AAPL")
        period: Khoảng thời gian lấy dữ liệu
        interval: Khoảng cách giữa các nến
        show_volume: Hiển thị biểu đồ volume
        show_ma: Hiển thị đường trung bình động
        ma_periods: Các chu kỳ MA (ví dụ: [20, 50] cho MA20 và MA50)
    
    Returns:
        Dict containing:
        - ticker: Mã cổ phiếu
        - period: Khoảng thời gian
        - chart_base64: Base64 encoded PNG của biểu đồ nến
        - chart_type: "candlestick"
        - statistics: Thống kê về giá và volume
        - error: Thông báo lỗi nếu có
    
    Examples:
        >>> generate_candlestick_chart("FPT.VN", period="3mo")
        >>> generate_candlestick_chart("AAPL", period="1mo", show_ma=True, ma_periods=[10, 20, 50])
    """
    
    if not ticker:
        return {
            "ticker": ticker,
            "period": period,
            "chart_base64": None,
            "chart_type": "candlestick",
            "error": "Ticker symbol is required"
        }
    
    # Normalize ticker
    ticker = ticker.strip().upper()
    
    if USE_YFINANCE:
        try:
            logger.info(f"Generating candlestick chart for {ticker}, period={period}, interval={interval}")
            
            # Create ticker object
            stock = yf.Ticker(ticker)
            
            # Get historical data
            hist = stock.history(period=period, interval=interval)
            
            if hist.empty:
                # Try with .VN suffix for Vietnamese stocks
                if "." not in ticker and not ticker.endswith(".VN"):
                    ticker_vn = ticker + ".VN"
                    logger.info(f"Trying Vietnamese market: {ticker_vn}")
                    stock = yf.Ticker(ticker_vn)
                    hist = stock.history(period=period, interval=interval)
                    if not hist.empty:
                        ticker = ticker_vn
            
            if hist.empty:
                return {
                    "ticker": ticker,
                    "period": period,
                    "chart_base64": None,
                    "chart_type": "candlestick",
                    "error": f"No data available for {ticker}"
                }
            
            # Create figure
            if show_volume:
                fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), 
                                               gridspec_kw={'height_ratios': [3, 1]},
                                               sharex=True)
            else:
                fig, ax1 = plt.subplots(1, 1, figsize=(12, 6))
            
            # Plot candlesticks
            for idx, (date, row) in enumerate(hist.iterrows()):
                open_price = row['Open']
                high = row['High']
                low = row['Low']
                close = row['Close']
                
                # Determine color
                color = 'green' if close >= open_price else 'red'
                
                # Draw the high-low line
                ax1.plot([idx, idx], [low, high], color='black', linewidth=0.5)
                
                # Draw the open-close rectangle (body)
                height = abs(close - open_price)
                bottom = min(close, open_price)
                rect = Rectangle((idx - 0.3, bottom), 0.6, height,
                               facecolor=color, edgecolor='black', 
                               alpha=0.8 if color == 'green' else 0.7)
                ax1.add_patch(rect)
            
            # Add moving averages if requested
            if show_ma and len(hist) > min(ma_periods):
                colors = ['blue', 'orange', 'purple', 'brown']
                for i, period_ma in enumerate(ma_periods):
                    if len(hist) >= period_ma:
                        ma = hist['Close'].rolling(window=period_ma).mean()
                        ax1.plot(range(len(hist)), ma, 
                               label=f'MA{period_ma}',
                               color=colors[i % len(colors)],
                               linewidth=1.5, alpha=0.7)
            
            # Format the price axis
            ax1.set_ylabel('Price', fontsize=12)
            ax1.grid(True, alpha=0.3)
            ax1.set_title(f'{ticker} - Candlestick Chart ({period})', 
                         fontsize=14, fontweight='bold')
            
            # Add legend if MA is shown
            if show_ma and len(hist) > min(ma_periods):
                ax1.legend(loc='upper left')
            
            # Plot volume if requested
            if show_volume:
                colors = ['green' if hist['Close'].iloc[i] >= hist['Open'].iloc[i] else 'red' 
                         for i in range(len(hist))]
                ax2.bar(range(len(hist)), hist['Volume'], color=colors, alpha=0.5)
                ax2.set_ylabel('Volume', fontsize=12)
                ax2.grid(True, alpha=0.3)
            
            # Format x-axis with dates
            num_ticks = min(10, len(hist))
            tick_indices = np.linspace(0, len(hist) - 1, num_ticks, dtype=int)
            tick_labels = [hist.index[i].strftime('%Y-%m-%d') for i in tick_indices]
            
            if show_volume:
                ax2.set_xticks(tick_indices)
                ax2.set_xticklabels(tick_labels, rotation=45, ha='right')
                ax2.set_xlabel('Date', fontsize=12)
            else:
                ax1.set_xticks(tick_indices)
                ax1.set_xticklabels(tick_labels, rotation=45, ha='right')
                ax1.set_xlabel('Date', fontsize=12)
            
            # Add current price annotation
            latest_price = hist['Close'].iloc[-1]
            ax1.annotate(f'${latest_price:.2f}',
                        xy=(len(hist) - 1, latest_price),
                        xytext=(10, 10),
                        textcoords='offset points',
                        bbox=dict(boxstyle='round,pad=0.3', 
                                facecolor='yellow', alpha=0.7),
                        fontsize=10)
            
            plt.tight_layout()
            
            # Save to base64
            buf = BytesIO()
            plt.savefig(buf, format='png', dpi=100)
            plt.close()
            buf.seek(0)
            chart_base64 = base64.b64encode(buf.read()).decode('ascii')
            
            # Calculate statistics
            latest = hist['Close'].iloc[-1]
            first = hist['Open'].iloc[0]
            high = hist['High'].max()
            low = hist['Low'].min()
            avg_volume = hist['Volume'].mean()
            change_pct = ((latest - first) / first * 100) if first != 0 else 0
            
            return {
                "ticker": ticker,
                "period": period,
                "chart_base64": chart_base64,
                "chart_type": "candlestick",
                "statistics": {
                    "latest_price": round(float(latest), 2),
                    "first_price": round(float(first), 2),
                    "high": round(float(high), 2),
                    "low": round(float(low), 2),
                    "change_percent": round(change_pct, 2),
                    "avg_volume": int(avg_volume),
                    "total_candles": len(hist)
                },
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Error generating candlestick chart for {ticker}: {str(e)}")
            return {
                "ticker": ticker,
                "period": period,
                "chart_base64": None,
                "chart_type": "candlestick",
                "error": f"Failed to generate candlestick chart: {str(e)}"
            }
    
    else:
        # Generate mock candlestick data for testing
        logger.info(f"Using mock candlestick data for {ticker} (yfinance not available)")
        
        import random
        
        # Generate mock OHLCV data
        num_candles = 30 if period == "1mo" else 60 if period == "3mo" else 20
        dates = pd.date_range(end=datetime.datetime.now(), periods=num_candles, freq='D')
        
        # Generate realistic candlestick data
        data = []
        base_price = 100
        for i in range(num_candles):
            open_price = base_price + random.uniform(-2, 2)
            close = open_price + random.uniform(-3, 3)
            high = max(open_price, close) + random.uniform(0, 2)
            low = min(open_price, close) - random.uniform(0, 2)
            volume = random.randint(1000000, 10000000)
            data.append({
                'Open': open_price,
                'High': high,
                'Low': low,
                'Close': close,
                'Volume': volume
            })
            base_price = close  # Next candle starts near previous close
        
        hist = pd.DataFrame(data, index=dates)
        
        # Create candlestick chart with mock data
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8),
                                       gridspec_kw={'height_ratios': [3, 1]},
                                       sharex=True)
        
        # Plot candlesticks
        for idx, (date, row) in enumerate(hist.iterrows()):
            open_price = row['Open']
            high = row['High']
            low = row['Low']
            close = row['Close']
            
            color = 'green' if close >= open_price else 'red'
            ax1.plot([idx, idx], [low, high], color='black', linewidth=0.5)
            
            height = abs(close - open_price)
            bottom = min(close, open_price)
            rect = Rectangle((idx - 0.3, bottom), 0.6, height,
                           facecolor=color, edgecolor='black',
                           alpha=0.8 if color == 'green' else 0.7)
            ax1.add_patch(rect)
        
        # Add MA lines
        if len(hist) >= 20:
            ma20 = hist['Close'].rolling(window=20).mean()
            ax1.plot(range(len(hist)), ma20, label='MA20', 
                    color='blue', linewidth=1.5, alpha=0.7)
        
        ax1.set_ylabel('Price', fontsize=12)
        ax1.grid(True, alpha=0.3)
        ax1.set_title(f'{ticker} - Candlestick Chart (Mock Data)', 
                     fontsize=14, fontweight='bold')
        ax1.legend(loc='upper left')
        
        # Volume bars
        colors = ['green' if hist['Close'].iloc[i] >= hist['Open'].iloc[i] else 'red'
                 for i in range(len(hist))]
        ax2.bar(range(len(hist)), hist['Volume'], color=colors, alpha=0.5)
        ax2.set_ylabel('Volume', fontsize=12)
        ax2.grid(True, alpha=0.3)
        
        # Format x-axis
        num_ticks = min(10, len(hist))
        tick_indices = np.linspace(0, len(hist) - 1, num_ticks, dtype=int)
        tick_labels = [hist.index[i].strftime('%Y-%m-%d') for i in tick_indices]
        ax2.set_xticks(tick_indices)
        ax2.set_xticklabels(tick_labels, rotation=45, ha='right')
        ax2.set_xlabel('Date', fontsize=12)
        
        plt.tight_layout()
        
        # Save to base64
        buf = BytesIO()
        plt.savefig(buf, format='png', dpi=100)
        plt.close()
        buf.seek(0)
        chart_base64 = base64.b64encode(buf.read()).decode('ascii')
        
        return {
            "ticker": ticker,
            "period": period,
            "chart_base64": chart_base64,
            "chart_type": "candlestick",
            "statistics": {
                "latest_price": round(float(hist['Close'].iloc[-1]), 2),
                "first_price": round(float(hist['Open'].iloc[0]), 2),
                "high": round(float(hist['High'].max()), 2),
                "low": round(float(hist['Low'].min()), 2),
                "change_percent": round(((hist['Close'].iloc[-1] - hist['Open'].iloc[0]) / hist['Open'].iloc[0] * 100), 2),
                "avg_volume": int(hist['Volume'].mean()),
                "total_candles": len(hist)
            },
            "error": "Using mock data (yfinance not available)"
        }
