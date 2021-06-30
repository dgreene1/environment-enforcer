/**
 * Faster than Array.concat
 * @param array1
 * @param array2
 */
export const combine = <T>(array1: T[], array2: T[]): void => {
  array2.forEach((x) => {
    array1.push(x);
  });
};
