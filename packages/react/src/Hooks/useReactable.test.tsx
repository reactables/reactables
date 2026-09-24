import { renderHook, act } from '@testing-library/react';
import { RxBuilder, combine } from '@reactables/core';
import { Action } from '@reactables/core';
import { useReactable } from './useReactable';

interface CounterState {
  count: number;
}

const RxCounter = () =>
  RxBuilder({
    initialState: { count: 0 } as CounterState,
    reducers: {
      increment: (state) => ({ count: state.count + 1 }),
      set: (_, action: Action<number>) => ({ count: action.payload }),
    },
  });

const RxToggle = () =>
  RxBuilder({
    initialState: { on: false },
    reducers: {
      toggle: (state) => ({ on: !state.on }),
    },
  });

describe('useReactable select', () => {
  describe('without selectors', () => {
    it('does not expose .select when factory has no selectors', () => {
      const { result } = renderHook(() => useReactable(RxCounter));
      expect((result.current as any).select).toBeUndefined();
    });
  });

  describe('with selectors', () => {
    const RxCounterWithSelectors = () =>
      RxCounter().selectors({
        double: (state) => state.count * 2,
        isPositive: (state) => state.count > 0,
      });

    it('exposes .select on the returned tuple', () => {
      const { result } = renderHook(() => useReactable(RxCounterWithSelectors));
      expect(result.current.select).toBeDefined();
      expect(result.current.select.double).toBeDefined();
      expect(result.current.select.isPositive).toBeDefined();
    });

    it('returns the initial computed value', () => {
      const { result } = renderHook(() => useReactable(RxCounterWithSelectors));
      expect(result.current.select.double()).toBe(0);
      expect(result.current.select.isPositive()).toBe(false);
    });

    it('returns the updated value after an action', () => {
      const { result } = renderHook(() => useReactable(RxCounterWithSelectors));

      act(() => {
        result.current[1].increment();
      });

      expect(result.current.select.double()).toBe(2);
      expect(result.current.select.isPositive()).toBe(true);
    });

    it('selector value stays in sync across multiple actions', () => {
      const { result } = renderHook(() => useReactable(RxCounterWithSelectors));

      act(() => {
        result.current[1].increment();
      });
      act(() => {
        result.current[1].increment();
      });
      act(() => {
        result.current[1].increment();
      });

      expect(result.current.select.double()).toBe(6);
    });
  });

  describe('with extra args', () => {
    const RxCounterWithMultiply = () =>
      RxCounter().selectors({
        multiplyBy: (state, factor: number) => state.count * factor,
      });

    it('passes extra args through to the selector', () => {
      const { result } = renderHook(() => useReactable(RxCounterWithMultiply));

      act(() => {
        result.current[1].set(5);
      });

      expect(result.current.select.multiplyBy(3)).toBe(15);
      expect(result.current.select.multiplyBy(10)).toBe(50);
    });
  });

  describe('with combine()', () => {
    const RxApp = () => {
      const counter = RxCounter().selectors({ double: (s) => s.count * 2 });
      const toggle = RxToggle().selectors({ label: (s) => (s.on ? 'on' : 'off') });
      return combine({ counter, toggle }).selectors({
        summary: (state) => `count=${state.counter.count} on=${state.toggle.on}`,
      });
    };

    it('exposes nested child selectors under their key', () => {
      const { result } = renderHook(() => useReactable(RxApp));
      expect(result.current.select.counter.double()).toBe(0);
      expect(result.current.select.toggle.label()).toBe('off');
    });

    it('exposes top-level selectors on the combined state', () => {
      const { result } = renderHook(() => useReactable(RxApp));
      expect(result.current.select.summary()).toBe('count=0 on=false');
    });

    it('nested and top-level selectors update after actions', () => {
      const { result } = renderHook(() => useReactable(RxApp));

      act(() => {
        result.current[1].counter.increment();
      });

      expect(result.current.select.counter.double()).toBe(2);
      expect(result.current.select.summary()).toBe('count=1 on=false');
    });
  });
});
