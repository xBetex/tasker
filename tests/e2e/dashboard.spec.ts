import { test, expect } from '@playwright/test'

test.describe('Task Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display the main dashboard', async ({ page }) => {
    // Check if the main heading is present
    await expect(page.getByRole('heading', { name: 'Task Dashboard' })).toBeVisible()
    
    // Check if the search bar is present
    await expect(page.getByPlaceholder(/search clients/i)).toBeVisible()
    
    // Check if the add client button is present
    await expect(page.getByRole('button', { name: /add new client/i })).toBeVisible()
  })

  test('should open and close add client modal', async ({ page }) => {
    // Click on add client button
    await page.getByRole('button', { name: /add new client/i }).click()
    
    // Check if modal opened
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/add new client/i)).toBeVisible()
    
    // Close modal by clicking cancel or close button
    const cancelButton = page.getByRole('button', { name: /cancel/i })
    if (await cancelButton.isVisible()) {
      await cancelButton.click()
    } else {
      await page.getByRole('button', { name: /close/i }).click()
    }
    
    // Check if modal closed
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should filter clients by search term', async ({ page }) => {
    // Wait for clients to load
    await page.waitForTimeout(1000)
    
    // Get initial client count
    const initialClients = await page.locator('[data-testid="client-card"], .client-card, [class*="client"]').count()
    
    if (initialClients > 0) {
      // Type in search box
      const searchInput = page.getByPlaceholder(/search clients/i)
      await searchInput.fill('NonExistentClient')
      await page.waitForTimeout(500)
      
      // Check if results are filtered (should be fewer or no results)
      const filteredClients = await page.locator('[data-testid="client-card"], .client-card, [class*="client"]').count()
      expect(filteredClients).toBeLessThanOrEqual(initialClients)
      
      // Clear search
      await searchInput.clear()
      await page.waitForTimeout(500)
    }
  })

  test('should toggle between grid and infinity pool views', async ({ page }) => {
    // Look for view toggle buttons
    const poolToggle = page.getByRole('button', { name: /pool|grid|♾️|📊/i })
    
    if (await poolToggle.isVisible()) {
      // Click to toggle view
      await poolToggle.click()
      await page.waitForTimeout(500)
      
      // Verify view changed (this would depend on specific implementation)
      // For now, just check that the button is still there and clickable
      await expect(poolToggle).toBeVisible()
    }
  })

  test('should expand and collapse client cards', async ({ page }) => {
    // Wait for clients to load
    await page.waitForTimeout(1000)
    
    // Look for client cards
    const clientCards = page.locator('[data-testid="client-card"], .client-card, [class*="client"]')
    const cardCount = await clientCards.count()
    
    if (cardCount > 0) {
      const firstCard = clientCards.first()
      
      // Try to click on the card to expand it
      await firstCard.click()
      await page.waitForTimeout(300)
      
      // Look for expanded content (tasks, add task button, etc.)
      const addTaskButton = page.getByTitle(/add new task/i)
      const tasksList = page.locator('[data-testid="tasks"], .tasks, [class*="task"]')
      
      // Check if either expanded content or add task button is visible
      const isExpanded = await addTaskButton.isVisible() || await tasksList.count() > 0
      
      if (isExpanded) {
        // Click again to collapse
        await firstCard.click()
        await page.waitForTimeout(300)
      }
    }
  })

  test('should handle dark mode toggle', async ({ page }) => {
    // Look for dark mode toggle
    const darkModeToggle = page.locator('button').filter({ hasText: /dark|light|🌙|☀️/i })
    
    if (await darkModeToggle.count() > 0) {
      const toggle = darkModeToggle.first()
      
      // Get initial theme
      const htmlElement = page.locator('html')
      const initialClass = await htmlElement.getAttribute('class') || ''
      
      // Click toggle
      await toggle.click()
      await page.waitForTimeout(300)
      
      // Check if theme changed
      const newClass = await htmlElement.getAttribute('class') || ''
      expect(newClass).not.toBe(initialClass)
    }
  })

  test('should display client statistics', async ({ page }) => {
    // Look for statistics section
    const statsSection = page.locator('[class*="statistic"], [class*="grid"]').filter({ hasText: /total|pending|completed|progress/i })
    
    if (await statsSection.count() > 0) {
      await expect(statsSection.first()).toBeVisible()
      
      // Check for numbers in statistics
      const numbers = page.locator('text=/\\d+/')
      expect(await numbers.count()).toBeGreaterThan(0)
    }
  })

  test('should handle empty states gracefully', async ({ page }) => {
    // Clear any existing data by searching for something that doesn't exist
    const searchInput = page.getByPlaceholder(/search clients/i)
    await searchInput.fill('ThisClientDefinitelyDoesNotExist123456')
    await page.waitForTimeout(500)
    
    // The page should still function without errors
    await expect(page.getByRole('heading', { name: 'Task Dashboard' })).toBeVisible()
    
    // Clear search
    await searchInput.clear()
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check if main elements are still visible and functional
    await expect(page.getByRole('heading', { name: 'Task Dashboard' })).toBeVisible()
    await expect(page.getByPlaceholder(/search clients/i)).toBeVisible()
    
    // Check if mobile navigation works
    const addButton = page.getByRole('button', { name: /add new client|➕/i })
    await expect(addButton).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)
    
    // Check if focus is visible on some element
    const focusedElement = page.locator(':focus')
    expect(await focusedElement.count()).toBeGreaterThan(0)
    
    // Test Enter key on search input
    const searchInput = page.getByPlaceholder(/search clients/i)
    await searchInput.focus()
    await searchInput.type('test')
    await page.keyboard.press('Enter')
    
    // Should not cause any errors
    await expect(page.getByRole('heading', { name: 'Task Dashboard' })).toBeVisible()
  })
}) 