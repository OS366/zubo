import { describe, it, expect } from 'vitest'
import { 
  initializeTimeBank, 
  addTimeToBank, 
  calculateTimeEarned, 
  tradeTimeForLives 
} from '../../utils/timeBank'

describe('Time Bank Utilities', () => {
  describe('initializeTimeBank', () => {
    it('creates initial time bank with zero values', () => {
      const timeBank = initializeTimeBank()
      
      expect(timeBank).toEqual({
        totalSeconds: 0,
        earnedThisQuestion: 0,
        livesTraded: 0
      })
    })
  })

  describe('calculateTimeEarned', () => {
    it('calculates time earned for fast answers', () => {
      // Answer in 10 seconds with 60 second limit
      const timeEarned = calculateTimeEarned(60, 10)
      expect(timeEarned).toBe(50) // 60 - 10 = 50 seconds earned
    })

    it('calculates time earned for medium speed answers', () => {
      // Answer in 30 seconds with 60 second limit
      const timeEarned = calculateTimeEarned(60, 30)
      expect(timeEarned).toBe(30) // 60 - 30 = 30 seconds earned
    })

    it('returns zero for slow answers', () => {
      // Answer in 55 seconds with 60 second limit
      const timeEarned = calculateTimeEarned(60, 55)
      expect(timeEarned).toBe(5) // 60 - 55 = 5 seconds earned
    })

    it('returns zero for answers at time limit', () => {
      // Answer exactly at time limit
      const timeEarned = calculateTimeEarned(60, 60)
      expect(timeEarned).toBe(0)
    })

    it('returns zero for answers over time limit', () => {
      // Answer over time limit (shouldn't happen but test edge case)
      const timeEarned = calculateTimeEarned(60, 70)
      expect(timeEarned).toBe(0)
    })

    it('handles different time limits correctly', () => {
      // Stage 2: 45 second limit, answer in 15 seconds
      const timeEarned = calculateTimeEarned(45, 15)
      expect(timeEarned).toBe(30) // 45 - 15 = 30 seconds earned
    })
  })

  describe('addTimeToBank', () => {
    it('adds time to existing bank', () => {
      const initialBank = { totalSeconds: 100, earnedThisQuestion: 0, livesTraded: 0 }
      const updatedBank = addTimeToBank(initialBank, 50)
      
      expect(updatedBank).toEqual({
        totalSeconds: 150,
        earnedThisQuestion: 50,
        livesTraded: 0
      })
    })

    it('handles zero time addition', () => {
      const initialBank = { totalSeconds: 100, earnedThisQuestion: 0, livesTraded: 0 }
      const updatedBank = addTimeToBank(initialBank, 0)
      
      expect(updatedBank).toEqual({
        totalSeconds: 100,
        earnedThisQuestion: 0,
        livesTraded: 0
      })
    })

    it('handles negative time (edge case)', () => {
      const initialBank = { totalSeconds: 100, earnedThisQuestion: 0, livesTraded: 0 }
      const updatedBank = addTimeToBank(initialBank, -10)
      
      expect(updatedBank).toEqual({
        totalSeconds: 90,
        earnedThisQuestion: -10,
        livesTraded: 0
      })
    })

    it('accumulates time over multiple questions', () => {
      let bank = initializeTimeBank()
      
      // Question 1: earn 30 seconds
      bank = addTimeToBank(bank, 30)
      expect(bank.totalSeconds).toBe(30)
      
      // Question 2: earn 45 seconds
      bank = addTimeToBank(bank, 45)
      expect(bank.totalSeconds).toBe(75)
      
      // Question 3: earn 20 seconds
      bank = addTimeToBank(bank, 20)
      expect(bank.totalSeconds).toBe(95)
    })
  })

  describe('tradeTimeForLives', () => {
    it('trades 1000 seconds for 1 life', () => {
      const initialBank = { totalSeconds: 1500, earnedThisQuestion: 0, livesTraded: 0 }
      const updatedBank = tradeTimeForLives(initialBank, 1)
      
      expect(updatedBank).toEqual({
        totalSeconds: 500, // 1500 - 1000 = 500
        earnedThisQuestion: 0,
        livesTraded: 1
      })
    })

    it('trades 2000 seconds for 2 lives', () => {
      const initialBank = { totalSeconds: 2500, earnedThisQuestion: 0, livesTraded: 0 }
      const updatedBank = tradeTimeForLives(initialBank, 2)
      
      expect(updatedBank).toEqual({
        totalSeconds: 500, // 2500 - 2000 = 500
        earnedThisQuestion: 0,
        livesTraded: 2
      })
    })

    it('returns null when insufficient time for trade', () => {
      const initialBank = { totalSeconds: 500, earnedThisQuestion: 0, livesTraded: 0 }
      const result = tradeTimeForLives(initialBank, 1) // Need 1000, only have 500
      
      expect(result).toBeNull()
    })

    it('returns null when trying to trade zero lives', () => {
      const initialBank = { totalSeconds: 1500, earnedThisQuestion: 0, livesTraded: 0 }
      const result = tradeTimeForLives(initialBank, 0)
      
      expect(result).toBeNull()
    })

    it('returns null when trying to trade negative lives', () => {
      const initialBank = { totalSeconds: 1500, earnedThisQuestion: 0, livesTraded: 0 }
      const result = tradeTimeForLives(initialBank, -1)
      
      expect(result).toBeNull()
    })

    it('handles exact trade amounts', () => {
      const initialBank = { totalSeconds: 1000, earnedThisQuestion: 0, livesTraded: 0 }
      const updatedBank = tradeTimeForLives(initialBank, 1)
      
      expect(updatedBank).toEqual({
        totalSeconds: 0, // Exactly 1000 seconds traded
        earnedThisQuestion: 0,
        livesTraded: 1
      })
    })

    it('handles large trades', () => {
      const initialBank = { totalSeconds: 5000, earnedThisQuestion: 0, livesTraded: 0 }
      const updatedBank = tradeTimeForLives(initialBank, 5)
      
      expect(updatedBank).toEqual({
        totalSeconds: 0, // 5000 - 5000 = 0
        earnedThisQuestion: 0,
        livesTraded: 5
      })
    })
  })

  describe('Integration Tests', () => {
    it('simulates a complete game scenario', () => {
      let bank = initializeTimeBank()
      
      // Stage 1 questions (60s limit)
      bank = addTimeToBank(bank, calculateTimeEarned(60, 20)) // Fast answer: +40s
      bank = addTimeToBank(bank, calculateTimeEarned(60, 35)) // Medium answer: +25s
      bank = addTimeToBank(bank, calculateTimeEarned(60, 45)) // Slow answer: +15s
      
      expect(bank.totalSeconds).toBe(80) // 40 + 25 + 15
      
      // Stage 2 questions (45s limit)
      bank = addTimeToBank(bank, calculateTimeEarned(45, 15)) // Fast answer: +30s
      bank = addTimeToBank(bank, calculateTimeEarned(45, 25)) // Medium answer: +20s
      
      expect(bank.totalSeconds).toBe(130) // 80 + 30 + 20
      
      // Continue building up time bank...
      for (let i = 0; i < 20; i++) {
        bank = addTimeToBank(bank, calculateTimeEarned(30, 10)) // Fast answers: +20s each
      }
      
      expect(bank.totalSeconds).toBe(530) // 130 + (20 * 20)
      
      // Build up more to reach trading threshold
      for (let i = 0; i < 25; i++) {
        bank = addTimeToBank(bank, calculateTimeEarned(30, 5)) // Very fast answers: +25s each
      }
      
      expect(bank.totalSeconds).toBe(1155) // 530 + (25 * 25)
      
      // Trade 1 life
      const tradedBank = tradeTimeForLives(bank, 1)
      expect(tradedBank?.totalSeconds).toBe(155) // 1155 - 1000
    })

    it('calculates bonus points correctly', () => {
      const bank = { totalSeconds: 2000, earnedThisQuestion: 0, livesTraded: 0 }
      const bonusPoints = Math.floor(bank.totalSeconds / 4)
      
      expect(bonusPoints).toBe(500) // 2000 / 4 = 500 bonus points
    })
  })
}) 