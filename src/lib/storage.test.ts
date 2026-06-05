import { saveData, loadData, removeData } from './storage';

const isNum = (v: unknown): v is number => typeof v === 'number';

describe('storage', () => {
  test('round-trips data under a versioned envelope', () => {
    saveData('k', 42);
    expect(loadData('k', isNum)).toBe(42);
    expect(JSON.parse(localStorage.getItem('k')!)).toEqual({ version: 1, data: 42 });
  });

  test('returns null for missing key', () => {
    expect(loadData('nope', isNum)).toBeNull();
  });

  test('returns null for corrupt JSON', () => {
    localStorage.setItem('k', '{not json');
    expect(loadData('k', isNum)).toBeNull();
  });

  test('returns null for wrong version', () => {
    localStorage.setItem('k', JSON.stringify({ version: 99, data: 42 }));
    expect(loadData('k', isNum)).toBeNull();
  });

  test('returns null when validator rejects', () => {
    localStorage.setItem('k', JSON.stringify({ version: 1, data: 'str' }));
    expect(loadData('k', isNum)).toBeNull();
  });

  test('removeData deletes the key', () => {
    saveData('k', 1);
    removeData('k');
    expect(loadData('k', isNum)).toBeNull();
  });
});
