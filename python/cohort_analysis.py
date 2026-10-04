import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from analytics import load_tables, retention

if __name__ == '__main__':
    print(retention(load_tables()).round(1).to_string())
