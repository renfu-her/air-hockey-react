"""
數據庫遷移腳本：將 match_records 表的 id 從 String 改為 Integer (AUTO_INCREMENT)

使用方法：
1. 確保數據庫備份已完成
2. 運行: python migrate_id_to_integer.py

注意：此腳本會刪除現有數據！如果表中有重要數據，請先備份。
"""
import os
import sys
from sqlalchemy import create_engine, text

# 設置環境變數，避免 CORS_ORIGINS 解析錯誤
os.environ.setdefault('CORS_ORIGINS', 'http://localhost:3000')

try:
    from app.core.config import settings
except Exception as e:
    print(f"警告：無法載入配置，使用默認值: {e}")
    # 使用默認配置
    class DefaultSettings:
        DATABASE_URL = os.getenv('DATABASE_URL', 'mysql+pymysql://root:@localhost:3306/air-hockey')
    settings = DefaultSettings()

def migrate_database():
    """遷移數據庫表結構"""
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=True  # 顯示 SQL 語句
    )
    
    with engine.connect() as conn:
        # 開始事務
        trans = conn.begin()
        try:
            # 檢查表是否存在
            result = conn.execute(text("""
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = 'match_records'
            """))
            table_exists = result.fetchone()[0] > 0
            
            if table_exists:
                print("發現 match_records 表，開始遷移...")
                
                # 刪除現有表（會刪除所有數據！）
                print("警告：將刪除現有表及其所有數據！")
                conn.execute(text("DROP TABLE IF EXISTS match_records"))
                print("已刪除舊表")
            
            # 創建新表（使用新的模型定義）
            from app.models import Base
            Base.metadata.create_all(bind=engine)
            print("已創建新表，id 字段為 INTEGER AUTO_INCREMENT")
            
            # 提交事務
            trans.commit()
            print("遷移完成！")
            
        except Exception as e:
            # 回滾事務
            trans.rollback()
            print(f"遷移失敗：{e}")
            raise

if __name__ == "__main__":
    print("=" * 50)
    print("數據庫遷移腳本：將 id 改為 INTEGER AUTO_INCREMENT")
    print("=" * 50)
    print()
    print("警告：此操作會刪除 match_records 表中的所有現有數據！")
    print()
    response = input("確定要繼續嗎？(yes/no): ")
    
    if response.lower() in ['yes', 'y']:
        migrate_database()
    else:
        print("遷移已取消")

