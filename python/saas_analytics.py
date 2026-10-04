"""Print the same metrics used by the dashboard and export a static snapshot."""
import json
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from analytics import load_tables, summary, monthly_revenue, funnel

if __name__ == '__main__':
    tables = load_tables()
    result = summary(tables)
    print(json.dumps(result,indent=2))
    print(monthly_revenue(tables).to_string(index=False))
    print(funnel(tables).to_string(index=False))
    output = Path(__file__).resolve().parents[1]/'data'/'summary.json'
    output.write_text(json.dumps(result,indent=2)+'\n')
