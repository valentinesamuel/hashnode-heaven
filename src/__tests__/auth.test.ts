describe('add', () => {
  const add = (a: number, b: number) => a + b;
  it('should add two numbers correctly', () => {
    expect(add(1, 2)).toBe(3);
  });
});
