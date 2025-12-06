"""
數據庫遷移腳本：將 match_records 表的 id 從 String 改為 Integer (AUTO_INCREMENT)
保留現有數據的版本

使用方法：
1. 確保數據庫備份已完成
2. 運行: python migrate_preserve_data.py

注意：此腳本會嘗試保留現有數據，但建議先備份。
"""
import os
import sys
from sqlalchemy import create_engine, text, MetaData, Table
import json

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

def migrate_database_preserve_data():
    """遷移數據庫表結構，保留數據"""
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
            
            if not table_exists:
                print("表不存在，直接創建新表...")
                from app.models import Base
                Base.metadata.create_all(bind=engine)
                trans.commit()
                print("表創建完成！")
                return
            
            # 檢查 id 列的類型
            result = conn.execute(text("""
                SELECT DATA_TYPE 
                FROM information_schema.columns 
                WHERE table_schema = DATABASE() 
                AND table_name = 'match_records' 
                AND column_name = 'id'
            """))
            id_type = result.fetchone()
            
            if id_type and id_type[0] == 'int':
                print("id 列已經是 INTEGER 類型，無需遷移")
                trans.commit()
                return
            
            print("發現 String 類型的 id 列，開始遷移...")
            
            # 1. 備份現有數據
            print("備份現有數據...")
            result = conn.execute(text("SELECT * FROM match_records"))
            rows = result.fetchall()
            columns = result.keys()
            data = [dict(zip(columns, row)) for row in rows]
            print(f"已備份 {len(data)} 條記錄")
            
            # 2. 刪除舊表
            print("刪除舊表...")
            conn.execute(text("DROP TABLE IF EXISTS match_records"))
            
            # 3. 創建新表
            print("創建新表...")
            from app.models import Base
            Base.metadata.create_all(bind=engine)
            
            # 4. 恢復數據（不包含 id，讓數據庫自動生成）
            if data:
                print(f"恢復 {len(data)} 條記錄...")
                for row in data:
                    conn.execute(text("""
                        INSERT INTO match_records 
                        (player_name, player_score, ai_score, winner, date) 
                        VALUES (:player_name, :player_score, :ai_score, :winner, :date)
                    """), {
                        'player_name': row['player_name'],
                        'player_score': row['player_score'],
                        'ai_score': row['ai_score'],
                        'winner': row['winner'],
                        'date': row['date']
                    })
                print("數據恢復完成")
            
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
    print("（保留現有數據版本）")
    print("=" * 50)
    print()
    print("此腳本會：")
    print("1. 備份現有數據")
    print("2. 刪除舊表")
    print("3. 創建新表（id 為 INTEGER AUTO_INCREMENT）")
    print("4. 恢復數據（id 會自動生成）")
    print()
    response = input("確定要繼續嗎？(yes/no): ")
    
    if response.lower() in ['yes', 'y']:
        migrate_database_preserve_data()
    else:
        print("遷移已取消")

