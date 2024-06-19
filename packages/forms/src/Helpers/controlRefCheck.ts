import { ControlRef } from '../Models';

/**
 * @description see if any keys in a ControlRef has a "." probably a mistake by developer
 */
export const controlRefCheck = (ref: ControlRef): void => {
  try {
    const hasError = ref.some((key) => {
      if (typeof key === 'string') {
        return key.includes('.');
      }

      return false;
    });

    if (hasError) {
      const refString = `[${ref.reduce((acc: string, key, index) => {
        if (index > 0) {
          acc = acc.concat(', ');
        }
        if (typeof key === 'number') {
          return acc.concat(key.toString());
        }
        return acc.concat(`'${key}'`);
      }, '')}]`;

      const suggestion = `[${ref.reduce((acc: string, key, index) => {
        if (index > 0) {
          acc = acc.concat(', ');
        }

        if (typeof key === 'number') {
          return acc.concat(key.toString());
        }

        const splitted = key
          .split('.')
          .map((key) => `'${key}'`)
          .join(', ');

        return acc.concat(`${splitted}`);
      }, '')}]`;

      console.warn(`You provided ${refString}. Did you mean ${suggestion}?`);
    }
  } catch {}
};
