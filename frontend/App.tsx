import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { CountdownOverlay } from './components/CountdownOverlay';
import { ResultModal } from './components/ResultModal';
import { GameState, MatchRecord } from './types';
import { getLeaderboard, saveMatch } from './services/apiService';
import { COUNTDOWN_SECONDS, WINNING_SCORE, COLOR_PLAYER, COLOR_AI } from './constants';
import { Trophy, Play, User, Keyboard } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'IDLE',
    scores: { player: 0, ai: 0 },
    winner: null,
    countdown: COUNTDOWN_SECONDS,
  });

  const [playerName, setPlayerName] = useState('');
  const [matchResult, setMatchResult] = useState<MatchRecord | null>(null);
  const [leaderboard, setLeaderboard] = useState<MatchRecord[]>([]);
  const isSavingRef = useRef(false); // 使用 ref 防止重复保存（避免闭包问题）

  // Load leaderboard on mount
  useEffect(() => {
    const loadLeaderboard = async () => {
      console.log('Loading leaderboard...');
      const records = await getLeaderboard();
      console.log('Leaderboard loaded:', records.length, 'records');
      setLeaderboard(records);
    };
    loadLeaderboard();
  }, []); // 只在组件挂载时加载一次

  // 注意：不再需要这个 useEffect，因为 finishGame 已经会重新加载排行榜
  // 保留这个可能会导致重复加载，但不会导致重复保存 

  // Reset Shortcut (Alt + R)
  const resetToHome = useCallback(() => {
    setGameState({
      status: 'IDLE',
      scores: { player: 0, ai: 0 },
      winner: null,
      countdown: COUNTDOWN_SECONDS // Reset countdown timer for next game
    });
    setMatchResult(null);
    isSavingRef.current = false; // 重置保存标志
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Alt + R (case insensitive)
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        resetToHome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetToHome]);

  // Countdown Logic
  useEffect(() => {
    if (gameState.status === 'COUNTDOWN') {
      const interval = setInterval(() => {
        setGameState(prev => {
          if (prev.countdown <= 1) {
            clearInterval(interval);
            return { ...prev, status: 'PLAYING', countdown: 0 };
          }
          return { ...prev, countdown: prev.countdown - 1 };
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.status]);

  const startGame = () => {
    if (!playerName.trim()) {
      alert("Please enter a name!");
      return;
    }
    setMatchResult(null);
    isSavingRef.current = false; // 重置保存标志
    setGameState({
      status: 'COUNTDOWN',
      scores: { player: 0, ai: 0 },
      winner: null,
      countdown: COUNTDOWN_SECONDS
    });
  };

  const handleScoreUpdate = (pScore: number, aScore: number) => {
    console.log(`[handleScoreUpdate] Called with: Player=${pScore}, AI=${aScore}, WINNING_SCORE=${WINNING_SCORE}`);
    
    // 使用函数式更新确保基于最新状态
    setGameState(prev => {
      console.log(`[handleScoreUpdate] Current state: status=${prev.status}, scores=${prev.scores.player}-${prev.scores.ai}, isSaving=${isSavingRef.current}`);
      
      // 检查是否达到获胜分数
      const shouldEnd = pScore >= WINNING_SCORE || aScore >= WINNING_SCORE;
      console.log(`[handleScoreUpdate] Should end? ${shouldEnd} (${pScore} >= ${WINNING_SCORE} || ${aScore} >= ${WINNING_SCORE})`);
      
      if (shouldEnd) {
        // 如果游戏已经结束或正在保存，不重复处理
        if (prev.status === 'ENDED') {
          console.log('[handleScoreUpdate] Game already ended, skipping');
          return prev;
        }
        
        if (isSavingRef.current) {
          console.log('[handleScoreUpdate] Already saving, but will still end game');
          // 即使正在保存，也要结束游戏
        }
        
        const winner = pScore > aScore ? 'PLAYER' : 'AI';
        console.log(`[handleScoreUpdate] Winner: ${winner}`);
        
        // 立即创建结果并显示，不等待API保存
        const result: MatchRecord = {
          id: Date.now().toString(),
          playerName: playerName,
          playerScore: pScore,
          aiScore: aScore,
          winner,
          date: Date.now()
        };
        console.log('[handleScoreUpdate] Creating match result:', result);
        
        // 立即设置 matchResult，确保结果模态框能显示
        setMatchResult(result);
        console.log('[handleScoreUpdate] Match result set immediately:', result);
        
        // 异步保存到后端API并更新排行榜（只保存一次）
        finishGame(pScore, aScore, winner, result);
        
        const newState = { ...prev, status: 'ENDED' as const, scores: { player: pScore, ai: aScore }, winner };
        console.log('[handleScoreUpdate] Setting game state to ENDED:', newState);
        return newState;
      } else {
        console.log(`[handleScoreUpdate] Updating scores: Player=${pScore}, AI=${aScore}`);
        return { ...prev, scores: { player: pScore, ai: aScore } };
      }
    });
  };

  const finishGame = async (pScore: number, aScore: number, winner: 'PLAYER' | 'AI', result: MatchRecord) => {
    // 防止重复保存
    if (isSavingRef.current) {
      console.log('Already saving, skipping duplicate save');
      return;
    }
    
    isSavingRef.current = true;
    try {
      // 保存到后端API
      const savedRecord = await saveMatch(result);
      if (savedRecord) {
        // 如果保存成功，使用服务器返回的记录（可能包含更新的ID等）
        setMatchResult(savedRecord);
      }
      // 如果保存失败，matchResult 已经设置为本地结果，所以不需要更新
      
      // 重新加载排行榜
      const records = await getLeaderboard();
      setLeaderboard(records);
    } catch (error) {
      console.error('Error in finishGame:', error);
    } finally {
      isSavingRef.current = false;
    }
  };

  return (
    // Outer Shell - Centering the Mobile View on Desktop
    <div className="min-h-[100dvh] w-full bg-slate-950 flex items-center justify-center font-sans overflow-hidden touch-none relative">
      
      {/* Desktop Hint outside the game area */}
      <div className="absolute top-4 left-4 text-slate-700 text-[10px] font-mono hidden lg:flex items-center gap-2">
         <Keyboard className="w-3 h-3" />
         <span>ALT + R to Reset</span>
      </div>

      {/* Mobile-sized Game Container */}
      <div className="w-full h-[100dvh] md:h-[95vh] md:max-w-[450px] md:rounded-3xl md:border-[8px] md:border-slate-800 bg-slate-900 shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Header / Scoreboard */}
        <div className="w-full h-[70px] shrink-0 flex items-center justify-between px-6 pt-2 pb-2 bg-slate-900 z-20 border-b border-slate-800/50">
          {gameState.status !== 'IDLE' ? (
            <>
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-[#ff003c] font-extrabold tracking-widest uppercase mb-0.5">YOU</span>
                <span className="text-4xl font-mono text-white font-bold drop-shadow-[0_0_10px_rgba(255,0,60,0.6)]">
                  {gameState.scores.player}
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                 <div className="w-[1px] h-6 bg-slate-700/50"></div>
                 <div className="px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700/50">
                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">TARGET: </span>
                   <span className="text-xs text-white font-black">{WINNING_SCORE}</span>
                 </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[10px] text-[#00f0ff] font-extrabold tracking-widest uppercase mb-0.5">CPU</span>
                <span className="text-4xl font-mono text-white font-bold drop-shadow-[0_0_10px_rgba(0,240,255,0.6)]">
                  {gameState.scores.ai}
                </span>
              </div>
            </>
          ) : (
             <div className="w-full text-center">
                <span className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase">Air Hockey</span>
             </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full relative overflow-hidden bg-slate-950">
          
          {/* Welcome Screen Overlay */}
          {gameState.status === 'IDLE' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-xs">
                <div className="text-center mb-10">
                  <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-2 italic tracking-tighter">
                    AIR<span className="text-[#ff003c] pl-2">HOCKEY</span>
                  </h1>
                  <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">Mobile Edition</p>
                </div>

                <div className="mb-6 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Player Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-[#ff003c] transition-colors" />
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="ENTER NAME"
                      maxLength={10}
                      className="w-full bg-slate-800 text-white pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-800 focus:border-[#ff003c] outline-none transition-all placeholder:text-slate-600 font-bold tracking-wide text-sm uppercase"
                    />
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="w-full py-4 bg-[#ff003c] hover:bg-[#d90033] text-white font-black rounded-2xl shadow-[0_0_20px_rgba(255,0,60,0.3)] flex items-center justify-center gap-2 group transition-all transform active:scale-[0.98] text-sm tracking-wider uppercase mb-8"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Start Game (5s)
                </button>

                {/* Leaderboard Mini */}
                <div className="border-t-2 border-slate-800 pt-6">
                  <div className="flex items-center gap-2 mb-4 text-amber-400 justify-center">
                    <Trophy className="h-3 w-3" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Rankings</h3>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    {leaderboard.length === 0 ? (
                      <div className="text-center text-slate-700 text-[10px] uppercase font-bold py-4">No records yet</div>
                    ) : (
                      leaderboard.slice(0, 5).map((record) => (
                        <div key={record.id} className="flex justify-between items-center text-[10px] p-3 rounded-lg bg-slate-800">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${record.winner === 'PLAYER' ? 'bg-green-500' : 'bg-[#00f0ff]'}`} />
                            <span className="text-slate-300 font-bold truncate uppercase">{record.playerName}</span>
                            <span className={`text-[9px] font-bold uppercase ml-1 ${record.winner === 'PLAYER' ? 'text-green-400' : 'text-[#00f0ff]'}`}>
                              {record.winner === 'PLAYER' ? 'WIN' : 'LOSS'}
                            </span>
                          </div>
                          <div className="font-mono font-bold text-slate-400 shrink-0 ml-2">
                            {record.playerScore}-{record.aiScore}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Canvas - Always rendered when not idle (including when ended, to show final frame) */}
          {gameState.status !== 'IDLE' && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
               <GameCanvas 
                 gameState={gameState} 
                 onScoreUpdate={handleScoreUpdate}
                 onGameEnd={() => {}} 
               />
            </div>
          )}

          {/* Overlays */}
          {gameState.status === 'COUNTDOWN' && (
            <CountdownOverlay count={gameState.countdown} />
          )}
          
          {gameState.status === 'ENDED' && matchResult && (
            <ResultModal 
              result={matchResult} 
              onHome={resetToHome} 
              onReplay={startGame} 
            />
          )}
          {/* Debug info */}
          {gameState.status === 'ENDED' && !matchResult && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/50">
              <div className="text-white p-4">
                <p>Game ended but no match result!</p>
                <p>Status: {gameState.status}</p>
                <p>MatchResult: {matchResult ? 'exists' : 'null'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}