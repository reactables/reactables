/**
 * Modified from https://github.com/AsyncBanana/microdiff
 * v 1.3.2
 * @description handles serializable (JSON) objects only
 */
export interface DifferenceCreate {
  type: 'CREATE';
  path: (string | number)[];
  value: unknown;
}

export interface DifferenceRemove {
  type: 'REMOVE';
  path: (string | number)[];
  oldValue: unknown;
}

export interface DifferenceChange {
  type: 'CHANGE';
  path: (string | number)[];
  value: unknown;
  oldValue: unknown;
}

export type Difference = DifferenceCreate | DifferenceRemove | DifferenceChange;

interface Options {
  cyclesFix: boolean;
}

const jsonDiff = (
  obj: Record<string, any> | any[],
  newObj: Record<string, any> | any[],
  options: Partial<Options> = { cyclesFix: true },
  _stack: Record<string, any>[] = [],
): Difference[] => {
  const diffs: Difference[] = [];
  const isObjArray = Array.isArray(obj);

  for (const key in obj) {
    const objKey = obj[key] as unknown;
    const path = isObjArray ? +key : key;
    if (!(key in newObj)) {
      diffs.push({
        type: 'REMOVE',
        path: [path],
        oldValue: obj[key],
      });
      continue;
    }
    const newObjKey = newObj[key] as unknown;
    const areObjects = typeof objKey === 'object' && typeof newObjKey === 'object';
    if (objKey && newObjKey && areObjects && (!options.cyclesFix || !_stack.includes(objKey))) {
      const nestedDiffs = jsonDiff(
        objKey,
        newObjKey,
        options,
        options.cyclesFix ? _stack.concat([objKey]) : [],
      );
      // eslint-disable-next-line prefer-spread
      diffs.push.apply(
        diffs,
        nestedDiffs.map((difference) => {
          difference.path.unshift(path);
          return difference;
        }),
      );
    } else if (
      objKey !== newObjKey &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      !(areObjects && (isNaN(objKey) ? objKey + '' === newObjKey + '' : +objKey === +newObjKey))
    ) {
      diffs.push({
        path: [path],
        type: 'CHANGE',
        value: newObjKey,
        oldValue: objKey,
      });
    }
  }

  const isNewObjArray = Array.isArray(newObj);
  for (const key in newObj) {
    if (!(key in obj)) {
      diffs.push({
        type: 'CREATE',
        path: [isNewObjArray ? +key : key],
        value: newObj[key],
      });
    }
  }
  return diffs;
};

export default jsonDiff;
