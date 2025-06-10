/**
 * Teste de demonstração para verificar se a infraestrutura está funcionando
 */

describe('Demo Test Suite', () => {
  it('should run basic JavaScript tests', () => {
    const sum = (a: number, b: number) => a + b
    expect(sum(2, 3)).toBe(5)
  })

  it('should handle promises', async () => {
    const mockPromise = Promise.resolve('success')
    const result = await mockPromise
    expect(result).toBe('success')
  })

  it('should mock functions', () => {
    const mockFn = jest.fn()
    mockFn('test')
    expect(mockFn).toHaveBeenCalledWith('test')
  })

  it('should handle arrays', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })

  it('should validate objects', () => {
    const obj = { name: 'Test', value: 42 }
    expect(obj).toHaveProperty('name')
    expect(obj.name).toBe('Test')
  })
}) 