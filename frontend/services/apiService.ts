import { MatchRecord } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// 后端API响应格式（snake_case）
interface MatchRecordResponse {
  id: string;
  player_name: string;
  player_score: number;
  ai_score: number;
  winner: 'PLAYER' | 'AI';
  date: number;
}

interface LeaderboardResponse {
  records: MatchRecordResponse[];
}

// 将后端响应转换为前端格式
function toFrontendRecord(record: MatchRecordResponse): MatchRecord {
  return {
    id: record.id,
    playerName: record.player_name,
    playerScore: record.player_score,
    aiScore: record.ai_score,
    winner: record.winner,
    date: record.date,
  };
}

// 将前端格式转换为后端请求格式
function toBackendRecord(record: MatchRecord): {
  player_name: string;
  player_score: number;
  ai_score: number;
  winner: 'PLAYER' | 'AI';
  date: number;
} {
  return {
    player_name: record.playerName,
    player_score: record.playerScore,
    ai_score: record.aiScore,
    winner: record.winner,
    date: record.date,
  };
}

/**
 * 获取排行榜
 * @param limit 返回的记录数量，默认50
 */
export async function getLeaderboard(limit: number = 50): Promise<MatchRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
    }
    
    const data: LeaderboardResponse = await response.json();
    return data.records.map(toFrontendRecord);
  } catch (error) {
    console.error('Failed to load leaderboard from API', error);
    // 如果API失败，返回空数组
    return [];
  }
}

/**
 * 保存比赛记录
 * @param record 比赛记录
 */
export async function saveMatch(record: MatchRecord): Promise<MatchRecord | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toBackendRecord(record)),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save match: ${response.statusText}`);
    }
    
    const data: MatchRecordResponse = await response.json();
    return toFrontendRecord(data);
  } catch (error) {
    console.error('Failed to save match to API', error);
    return null;
  }
}

