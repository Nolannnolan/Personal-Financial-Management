import inspect
from dataclasses import dataclass, field
from typing import Callable, Dict, Any


def _callable_to_schema(func: Callable) -> Dict[str, Any]:
    """
    Build a simple JSON schema for function parameters based on signature.
    Defaults to string for unknown annotations.
    """
    sig = inspect.signature(func)
    props = {}
    required = []
    for name, param in sig.parameters.items():
        if param.kind in (param.VAR_POSITIONAL, param.VAR_KEYWORD):
            continue
        ann = param.annotation
        if ann == inspect._empty:
            t = "string"
        elif ann in (str,):
            t = "string"
        elif ann in (int,):
            t = "integer"
        elif ann in (float,):
            t = "number"
        elif ann in (bool,):
            t = "boolean"
        else:
            t = "string"
        props[name] = {"type": t, "description": f"Parameter {name} of {func.__name__}"}
        if param.default == inspect._empty:
            required.append(name)
    schema = {"type": "object", "properties": props}
    if required:
        schema["required"] = required
    return schema


@dataclass
class ToolMeta:
    """Metadata for each registered tool."""
    name: str
    description: str
    func: Callable
    parameters_schema: Dict[str, Any] = field(default_factory=dict)


class ToolRegistry:
    """Central registry for all tools."""

    def __init__(self):
        self._tools: Dict[str, ToolMeta] = {}

    def register(
        self,
        name: str,
        description: str,
        func: Callable,
        parameters_schema: Dict[str, Any] = None,
    ):
        """Register a tool into the registry."""
        if parameters_schema is None:
            parameters_schema = _callable_to_schema(func)
        meta = ToolMeta(
            name=name,
            description=description,
            func=func,
            parameters_schema=parameters_schema,
        )
        self._tools[name] = meta

    def get(self, name: str) -> ToolMeta:
        return self._tools.get(name)

    def list_tools(self) -> Dict[str, ToolMeta]:
        return self._tools


# -----------------------
# Global registry instance
# -----------------------
registry = ToolRegistry()

# Example tool registrations
# Bạn import các tool thực tế của bạn vào đây

# Existing tools
from .tools.chart import generate_price_chart
from .tools.fundamentals import get_fundamentals
from .tools.google_search import google_search
from .tools.news import search_news
from .tools.pdf_parse import parse_financial_report
from .tools.ratios import calculate_ratios
from .tools.stock_price import get_stock_price
from .tools.stock_symbol import get_stock_symbol

# New tools - Phase 1
from .tools.technical_indicators import get_technical_indicators
from .tools.advanced_ratios import get_advanced_ratios
from .tools.peer_comparison import compare_with_peers

# New tools - Phase 2
from .tools.risk_metrics import get_risk_metrics
from .tools.portfolio_analytics import analyze_portfolio
from .tools.valuation import estimate_fair_value

# New tools - Phase 3
from .tools.market_overview import get_market_overview
from .tools.cashflow_analysis import analyze_cashflow

# ========== Register Existing Tools ==========

registry.register(
    name="generate_price_chart",
    description="Generate a price chart for a given stock ticker",
    func=generate_price_chart,
)
registry.register(
    name="get_fundamentals",
    description="Retrieve fundamental information for a stock ticker including market cap, sector, revenue, and earnings",
    func=get_fundamentals,
)
registry.register(
    name="google_search",
    description="Perform a Google search and return snippets",
    func=google_search,
)
registry.register(
    name="search_news",
    description="Search for the latest financial news about a stock ticker or company",
    func=search_news,
)
registry.register(
    name="parse_financial_report",
    description="Parse PDF financial report and extract sections",
    func=parse_financial_report,
)
registry.register(
    name="calculate_ratios",
    description="Calculate basic financial ratios (EPS, P/E, ROE) for a stock ticker",
    func=calculate_ratios,
)
registry.register(
    name="get_stock_price",
    description="Fetch current or historical stock price for a ticker symbol",
    func=get_stock_price,
)
registry.register(
    name="get_stock_symbol",
    description="Find stock ticker symbol from a company name",
    func=get_stock_symbol,
)

# ========== Register New Tools - Phase 1: Core Analysis ==========

registry.register(
    name="get_technical_indicators",
    description="Calculate technical analysis indicators (RSI, MACD, Moving Averages, Bollinger Bands, Stochastic) for a stock ticker. Use this to analyze price trends and trading signals.",
    func=get_technical_indicators,
)

registry.register(
    name="get_advanced_ratios",
    description="Calculate advanced financial ratios including valuation (P/B, P/S, PEG, EV/EBITDA), leverage (Debt-to-Equity, Interest Coverage), liquidity (Current Ratio, Quick Ratio), profitability margins, and efficiency metrics for a stock ticker.",
    func=get_advanced_ratios,
)

registry.register(
    name="compare_with_peers",
    description="Compare a company's financial metrics with peer companies in the same sector. Provides ranking, percentile, and competitive position analysis across valuation, profitability, and growth metrics.",
    func=compare_with_peers,
)

# ========== Register New Tools - Phase 2: Risk & Portfolio ==========

registry.register(
    name="get_risk_metrics",
    description="Calculate comprehensive risk metrics for a stock including Beta, Alpha, Volatility, Sharpe Ratio, Sortino Ratio, Maximum Drawdown, and Value at Risk (VaR). Use this to assess investment risk relative to a benchmark.",
    func=get_risk_metrics,
)

registry.register(
    name="analyze_portfolio",
    description="Analyze and optimize a portfolio of stocks. Calculate expected return, volatility, Sharpe ratio, diversification score, correlation matrix, and provide rebalancing suggestions. Use this for portfolio construction and optimization.",
    func=analyze_portfolio,
)

registry.register(
    name="estimate_fair_value",
    description="Estimate fair value of a stock using multiple valuation methods: DCF (Discounted Cash Flow), DDM (Dividend Discount Model), and PEG ratio analysis. Provides upside/downside potential and buy/sell/hold recommendation.",
    func=estimate_fair_value,
)

# ========== Register New Tools - Phase 3: Market Intelligence ==========

registry.register(
    name="get_market_overview",
    description="Get comprehensive market overview including major indices performance (US, Vietnam, Asia, Europe), sector performance, market breadth, and sentiment analysis. Use this to understand overall market conditions.",
    func=get_market_overview,
)

registry.register(
    name="analyze_cashflow",
    description="Analyze company's cash flow including Operating Cash Flow (OCF), Free Cash Flow (FCF), Cash Conversion Cycle, and cash flow quality assessment. Use this to evaluate financial health and cash generation capability.",
    func=analyze_cashflow,
)
