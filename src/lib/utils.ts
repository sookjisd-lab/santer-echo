import { Timestamp } from 'firebase/firestore'

export function formatDate(ts: Timestamp): string {
  const d = ts.toDate()
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatDateTime(ts: Timestamp): string {
  const d = ts.toDate()
  return d.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(ts: Timestamp): string {
  return ts.toDate().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

// Returns the week label for a date: e.g. "2025년 3월 2주차"
export function getWeekLabel(ts: Timestamp): string {
  const d = ts.toDate()
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const week = Math.ceil(d.getDate() / 7)
  return `${year}년 ${month}월 ${week}주차`
}

// Returns YYYY-MM-DD string for a date
export function toDateString(ts: Timestamp): string {
  const d = ts.toDate()
  return d.toISOString().slice(0, 10)
}

// Daily random nickname based on userId + date
const NICKNAMES = [
  '새벽이슬', '빛나는별', '잔잔한물', '푸른하늘', '은혜의강',
  '기쁨의샘', '평화의길', '소망의빛', '사랑의꽃', '믿음의산',
  '감사의노래', '찬양의새', '기도의손', '축복의비', '은총의바람',
  '순례자', '나그네', '목자', '양떼', '포도나무',
]

export function getDailyNickname(userId: string): string {
  const today = new Date().toISOString().slice(0, 10)
  const seed = `${userId}-${today}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return NICKNAMES[hash % NICKNAMES.length]
}
