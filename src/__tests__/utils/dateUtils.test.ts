/**
 * Date Utilities Tests
 * Tests the date formatting and validation functions
 */

import { getCurrentDateForInput, getDefaultSLADate } from '@/utils/dateUtils'

describe('Date Utils', () => {
  describe('getCurrentDateForInput', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const result = getCurrentDateForInput()
      
      // Should match YYYY-MM-DD pattern
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should return current date', () => {
      const result = getCurrentDateForInput()
      const today = new Date().toISOString().split('T')[0]
      
      expect(result).toBe(today)
    })
  })

  describe('getDefaultSLADate', () => {
    it('should return date 7 days from now by default', () => {
      const result = getDefaultSLADate()
      const expected = new Date()
      expected.setDate(expected.getDate() + 7)
      const expectedString = expected.toISOString().split('T')[0]
      
      expect(result).toBe(expectedString)
    })

    it('should accept custom days parameter', () => {
      const customDays = 14
      const result = getDefaultSLADate(customDays)
      const expected = new Date()
      expected.setDate(expected.getDate() + customDays)
      const expectedString = expected.toISOString().split('T')[0]
      
      expect(result).toBe(expectedString)
    })

    it('should handle negative days', () => {
      const customDays = -3
      const result = getDefaultSLADate(customDays)
      const expected = new Date()
      expected.setDate(expected.getDate() + customDays)
      const expectedString = expected.toISOString().split('T')[0]
      
      expect(result).toBe(expectedString)
    })
  })
}) 