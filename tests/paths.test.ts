import { describe, expect, it } from 'vitest';
import { toSnakeCase, toPascalCase, toPackageName } from '../src/utils/paths';

describe('paths utils', () => {
  it('converts to snake_case', () => {
    expect(toSnakeCase('UserProfile')).toBe('user_profile');
    expect(toSnakeCase('user-profile')).toBe('user_profile');
  });

  it('converts to PascalCase', () => {
    expect(toPascalCase('user_profile')).toBe('UserProfile');
    expect(toPascalCase('user-profile')).toBe('UserProfile');
  });

  it('builds package name', () => {
    expect(toPackageName('com.example', 'MyApp')).toBe('com.example.my_app');
  });
});
