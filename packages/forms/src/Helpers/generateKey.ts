export const generateKey = (length: number) => {
  let result = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const characters = letters + '0123456789';
  let counter = 0;
  while (counter < length) {
    // Keys are used as object property names (e.g. _changedControls), whose enumeration order
    // matters. An all-digit key is an integer-like property, which enumerates before all others
    // regardless of insertion order, so the first character is always a letter.
    const pool = counter === 0 ? letters : characters;
    result += pool.charAt(Math.floor(Math.random() * pool.length));
    counter += 1;
  }
  return result;
};
