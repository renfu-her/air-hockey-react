# 變更記錄 / Change Log

## 2025-12-05 21:39:35

### 修復的問題 / Fixed Issues

1. **倒數計時器顯示問題 / Countdown Timer Display Issue**
   - 問題：遊戲開始時倒數計時器沒有顯示
   - 修復：為 GameCanvas 容器添加 `z-10`，確保 CountdownOverlay (z-50) 能正確顯示在遊戲畫面上方
   - Issue: Countdown timer was not appearing when game starts
   - Fix: Added `z-10` to GameCanvas container to ensure CountdownOverlay (z-50) displays correctly above the game canvas

2. **Rankings 顯示獲勝者問題 / Rankings Winner Display Issue**
   - 問題：Rankings 排行榜中沒有明確顯示誰贏了這局
   - 修復：在每個排行榜項目中添加 "WIN" 或 "LOSS" 標籤，使用顏色區分（綠色表示玩家獲勝，藍色表示 AI 獲勝）
   - 同時優化了布局，使用 `flex-1 min-w-0` 和 `shrink-0` 確保文字不會溢出
   - Issue: Rankings did not clearly show who won each game
   - Fix: Added "WIN" or "LOSS" labels to each ranking item with color coding (green for player win, blue for AI win)
   - Also optimized layout with `flex-1 min-w-0` and `shrink-0` to prevent text overflow

### 修改的檔案 / Modified Files
- `App.tsx`: 
  - 為 GameCanvas 容器添加 z-index
  - 更新 Rankings 顯示邏輯，添加獲勝者標籤

