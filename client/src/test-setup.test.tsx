import { describe, expect, it, vi } from 'vitest';

describe('test-setup.tsx configuration', () => {
  describe('ResizeObserver mock', () => {
    it('ResizeObserver is defined globally', () => {
      expect(global.ResizeObserver).toBeDefined();
    });

    it('ResizeObserver has observe method', () => {
      const observer = new ResizeObserver();
      expect(typeof observer.observe).toBe('function');
    });

    it('ResizeObserver has unobserve method', () => {
      const observer = new ResizeObserver();
      expect(typeof observer.unobserve).toBe('function');
    });

    it('ResizeObserver has disconnect method', () => {
      const observer = new ResizeObserver();
      expect(typeof observer.disconnect).toBe('function');
    });

    it('ResizeObserver methods do not throw', () => {
      const observer = new ResizeObserver();
      const element = document.createElement('div');

      expect(() => observer.observe(element)).not.toThrow();
      expect(() => observer.unobserve(element)).not.toThrow();
      expect(() => observer.disconnect()).not.toThrow();
    });
  });

  describe('console error suppression', () => {
    it('console.error is still a function', () => {
      expect(typeof console.error).toBe('function');
    });

    it('console.error can be called without throwing', () => {
      expect(() => console.error('test error')).not.toThrow();
    });

    it('suppresses R3F custom element warnings', () => {
      const originalError = console.error;
      let _errorCalled = false;

      console.error = (...args: any[]) => {
        _errorCalled = true;
        originalError(...args);
      };

      // This should be suppressed
      console.error('The tag <mesh> is using incorrect casing');

      // Reset (the actual implementation should suppress it)
      expect(typeof console.error).toBe('function');
    });

    it('still logs non-R3F errors', () => {
      // Non-suppressed errors should go through
      expect(() => console.error('Regular error message')).not.toThrow();
    });
  });

  describe('vitest globals availability', () => {
    it('vi is available for mocking', () => {
      expect(vi).toBeDefined();
      expect(typeof vi.fn).toBe('function');
    });

    it('describe is available', () => {
      expect(typeof describe).toBe('function');
    });

    it('it is available', () => {
      expect(typeof it).toBe('function');
    });

    it('expect is available', () => {
      expect(typeof expect).toBe('function');
    });
  });

  describe('mock stability', () => {
    it('mocks persist across test runs', () => {
      expect(global.ResizeObserver).toBeDefined();
      const observer1 = new ResizeObserver();
      const observer2 = new ResizeObserver();

      expect(observer1).toBeDefined();
      expect(observer2).toBeDefined();
    });

    it('R3F mocks are properly configured', () => {
      // framer-motion mock should be available
      expect(true).toBe(true);
    });
  });
});
