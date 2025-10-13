# test_new_tools.py
"""
Test script for new financial analysis tools.
Tests each tool with sample data to verify functionality.
"""
import sys
import io
import json

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def test_technical_indicators():
    """Test technical indicators tool."""
    print("\n" + "="*70)
    print("TEST 1: Technical Indicators")
    print("="*70)
    
    try:
        from finance_agent.tools.technical_indicators import get_technical_indicators
        
        result = get_technical_indicators("AAPL", period="3mo", indicators=["rsi", "macd"])
        
        print(f"\nTicker: {result.get('ticker')}")
        print(f"Current Price: ${result.get('current_price', 0):.2f}")
        print(f"Overall Signal: {result.get('overall_signal', 'N/A').upper()}")
        
        if 'indicators' in result:
            if 'rsi' in result['indicators']:
                rsi_data = result['indicators']['rsi']
                print(f"\nRSI: {rsi_data.get('value', 'N/A'):.2f}")
                print(f"  Signal: {rsi_data.get('signal', 'N/A')}")
            
            if 'macd' in result['indicators']:
                macd_data = result['indicators']['macd']
                print(f"\nMACD Line: {macd_data.get('macd_line', 'N/A'):.4f}")
                print(f"  Signal: {macd_data.get('signal', 'N/A')}")
        
        print("\n✅ Technical Indicators Test PASSED")
        return True
        
    except Exception as e:
        print(f"\n❌ Technical Indicators Test FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_advanced_ratios():
    """Test advanced ratios tool."""
    print("\n" + "="*70)
    print("TEST 2: Advanced Financial Ratios")
    print("="*70)
    
    try:
        from finance_agent.tools.advanced_ratios import get_advanced_ratios
        
        result = get_advanced_ratios("MSFT")
        
        print(f"\nCompany: {result.get('company_name', 'N/A')}")
        
        if 'valuation' in result:
            val = result['valuation']
            print(f"\nValuation Ratios:")
            print(f"  P/E Ratio: {val.get('price_to_earnings', 'N/A')}")
            print(f"  P/B Ratio: {val.get('price_to_book', 'N/A')}")
            print(f"  P/S Ratio: {val.get('price_to_sales', 'N/A')}")
        
        if 'profitability' in result:
            prof = result['profitability']
            print(f"\nProfitability:")
            print(f"  ROE: {prof.get('return_on_equity', 'N/A')}")
            print(f"  Net Margin: {prof.get('net_margin', 'N/A')}")
        
        if 'interpretation' in result:
            print(f"\nInterpretation:")
            for key, value in result['interpretation'].items():
                print(f"  {key}: {value}")
        
        print("\n✅ Advanced Ratios Test PASSED")
        return True
        
    except Exception as e:
        print(f"\n❌ Advanced Ratios Test FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_peer_comparison():
    """Test peer comparison tool."""
    print("\n" + "="*70)
    print("TEST 3: Peer Comparison")
    print("="*70)
    
    try:
        from finance_agent.tools.peer_comparison import compare_with_peers
        
        result = compare_with_peers("AAPL", top_n=3)
        
        print(f"\nCompany: {result.get('company_name', 'N/A')}")
        print(f"Sector: {result.get('sector', 'N/A')}")
        print(f"Peers: {', '.join(result.get('peers', []))}")
        
        if 'summary' in result:
            summary = result['summary']
            print(f"\nCompetitive Position: {summary.get('competitive_position', 'N/A')}")
            print(f"Strengths: {', '.join(summary.get('strengths', []))[:100]}")
            print(f"Weaknesses: {', '.join(summary.get('weaknesses', []))[:100]}")
        
        print("\n✅ Peer Comparison Test PASSED")
        return True
        
    except Exception as e:
        print(f"\n❌ Peer Comparison Test FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_market_overview():
    """Test market overview tool."""
    print("\n" + "="*70)
    print("TEST 4: Market Overview")
    print("="*70)
    
    try:
        from finance_agent.tools.market_overview import get_market_overview
        
        result = get_market_overview(market="US", include_sectors=False)
        
        print(f"\nMarket: {result.get('market', 'N/A')}")
        print(f"Market Breadth: {result.get('market_breadth', 'N/A')}")
        
        if 'summary' in result:
            summary = result['summary']
            print(f"\nSummary:")
            print(f"  Average Change: {summary.get('average_change_pct', 0):.2f}%")
            print(f"  Indices Up: {summary.get('indices_up', 0)}")
            print(f"  Indices Down: {summary.get('indices_down', 0)}")
        
        if 'interpretation' in result:
            print(f"\nInterpretation: {result['interpretation']}")
        
        print("\n✅ Market Overview Test PASSED")
        return True
        
    except Exception as e:
        print(f"\n❌ Market Overview Test FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_tool_registry():
    """Test that all tools are properly registered."""
    print("\n" + "="*70)
    print("TEST 5: Tool Registry Check")
    print("="*70)
    
    try:
        from finance_agent.tool_registry import registry
        
        tools = registry.list_tools()
        print(f"\nTotal registered tools: {len(tools)}")
        
        expected_new_tools = [
            "get_technical_indicators",
            "get_advanced_ratios",
            "compare_with_peers",
            "get_risk_metrics",
            "analyze_portfolio",
            "estimate_fair_value",
            "get_market_overview",
            "analyze_cashflow"
        ]
        
        print("\nChecking new tools:")
        all_present = True
        for tool_name in expected_new_tools:
            if tool_name in tools:
                print(f"  ✅ {tool_name}")
            else:
                print(f"  ❌ {tool_name} - NOT FOUND")
                all_present = False
        
        if all_present:
            print("\n✅ Tool Registry Test PASSED - All new tools registered")
            return True
        else:
            print("\n❌ Tool Registry Test FAILED - Some tools missing")
            return False
        
    except Exception as e:
        print(f"\n❌ Tool Registry Test FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("\n" + "="*70)
    print("TESTING NEW FINANCIAL ANALYSIS TOOLS")
    print("="*70)
    print("\nNote: These tests require internet connection for yfinance data.")
    print("Some tests may take 10-30 seconds to complete.")
    
    tests = [
        ("Tool Registry", test_tool_registry),
        ("Technical Indicators", test_technical_indicators),
        ("Advanced Ratios", test_advanced_ratios),
        ("Peer Comparison", test_peer_comparison),
        ("Market Overview", test_market_overview),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            passed = test_func()
            results.append((test_name, passed))
        except Exception as e:
            print(f"\n❌ {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name:30} {status}")
    
    print(f"\nTotal: {passed_count}/{total_count} tests passed")
    
    if passed_count == total_count:
        print("\n🎉 ALL TESTS PASSED! New tools are working correctly.")
    else:
        print(f"\n⚠️  {total_count - passed_count} test(s) failed. Please review the errors above.")
    
    return passed_count == total_count


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
