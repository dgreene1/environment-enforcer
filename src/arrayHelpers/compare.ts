export const itemsInAThatArenNotInB = <T>(arrayA: T[], arrayB: T[]): T[] => {
  return arrayA.filter((x) => {
    return !arrayB.includes(x);
  });
};
