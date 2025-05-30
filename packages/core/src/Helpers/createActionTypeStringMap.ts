import { Reactable } from '../Models';

type CombinedActionStringMap<T> = {
  [K in keyof T as `${T[K] extends Reactable<unknown, unknown, infer P>
    ? `[${K & string}] - ${P extends Record<infer Q extends string, string> ? P[Q] : never}`
    : never}`]: `${T[K] extends Reactable<unknown, unknown, infer P>
    ? `[${K & string}] - ${P extends Record<infer Q extends string, string> ? P[Q] : never}`
    : never}`;
};

export const combineActionTypeStringMaps = <T extends Record<string, Reactable<unknown, unknown>>>(
  sourceReactables: T,
) => {
  const result = Object.entries(sourceReactables).reduce(
    <S, U, V extends Record<string, string>>(
      acc: CombinedActionStringMap<T>,
      [key, [, , actions$]]: [string, Reactable<S, U, V>],
    ) => {
      return {
        ...acc,
        ...createActionTypeStringMap(actions$.types, key),
      };
    },
    {} as CombinedActionStringMap<T>,
  );

  return result;
};

export type ActionTypeString<
  S extends Record<string, unknown>,
  Z extends string,
> = Z extends undefined
  ? {
      [K in keyof S as `${string & K}`]: `${string & K}`;
    }
  : {
      [K in keyof S as `[${Z}] - ${string & K}`]: `[${Z}] - ${string & K}`;
    };
export const createActionTypeStringMap = <
  S extends Record<string, unknown>,
  Z extends string = undefined,
>(
  types: S,
  parentKey?: Z,
) =>
  Object.keys(types).reduce((acc, childKey: string) => {
    const newKey = parentKey ? `[${parentKey}] - ${childKey}` : childKey;
    return {
      ...acc,
      [newKey]: newKey,
    } as ActionTypeString<S, Z>;
  }, {} as ActionTypeString<S, Z>);
