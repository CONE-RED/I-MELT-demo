describe('Jest Setup Test', () => {
  test('Jest is working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('Environment setup is valid', () => {
    expect(typeof process.env).toBe('object');
  });
});