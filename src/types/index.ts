import { Timestamp } from 'firebase/firestore'

// 사용자 권한
export type UserRole = 'pending' | 'user' | 'admin'

export interface AppUser {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: Timestamp
  approvedAt: Timestamp | null
  readNotifications: {
    koinonia: string[]
    prayer: string[]
  }
}

// 말씀 강론
export interface Sermon {
  id: string
  title: string
  content: string
  worshipDate: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
  authorId: string
}

// 큐티 나눔
export interface QtPost {
  id: string
  title: string
  content: string
  authorId: string
  nickname: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// 코이노니아
export interface Koinonia {
  id: string
  title: string
  content: string
  worshipDate: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
  authorId: string
}

// 기도 제목 나눔
export interface PrayerTopic {
  id: string
  title: string
  content: string
  worshipDate: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
  authorId: string
}
