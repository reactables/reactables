import { Reactable } from '../Models';
import { DestroyAction } from './RxBuilder';

type ExpandedMap<T extends Record<string, Reactable<unknown, unknown & DestroyAction>>> = {
  [K in keyof T]: T[K] extends Reactable<unknown, unknown & DestroyAction, infer P>
    ? {
        [Pkey in keyof P as `[${K & string}] - ${Pkey & string}`]: `[${K & string}] - ${Pkey &
          string}`;
      }
    : never;
};

type FlattenedEntries<T> = {
  [K in keyof T]: T[K] extends Record<string, any> ? T[K] : never;
}[keyof T];

type CombinedActionStringMap<
  T extends Record<string, Reactable<unknown, unknown & DestroyAction>>,
> = FlattenedEntries<ExpandedMap<T>> & { [key: string]: string };

/**
 * @description helper method to create an action type string map for a combined reacatable
 */
export const combineActionTypeStringMaps = <
  T extends Record<string, Reactable<unknown, unknown & DestroyAction>>,
>(
  sourceReactables: T,
) => {
  const result = Object.entries(sourceReactables).reduce(
    <S, U extends DestroyAction, V extends Record<string, string>>(
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

/**
 * @description creates an action type string map from existing string maps or an ActionMap,
 * if given a parent key it will append a prefix to the resulting strings
 */
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
