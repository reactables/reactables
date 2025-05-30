import { Reactable } from '../Models';

type CombinedActionStringMap<T> = T extends Record<
  infer Z extends string,
  Reactable<unknown, unknown, infer P>
>
  ? {
      [K in keyof T as `${P extends Record<infer Q, string>
        ? `[${Z & string}] ${Q & string}` & string
        : never}`]: `test`;
    }
  : never;

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
        ...createActionTypeString(actions$.types, key),
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
export const createActionTypeString = <
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

const parentKey = 'parent';
const types = { 'send messag': 'send messag', failedme: 'failedme' };

const test = createActionTypeString(types, parentKey);
const test2 = createActionTypeString(types);
