import { assertNever } from './assertNever';

describe('assertNever', () => {
  it('should throw if someone lies to TypeScript or has bad types', (): void => {
    const fakeUnion = 4 as unknown as string | undefined;

    let errToTest: Error | undefined;

    try {
      if (fakeUnion === undefined) {
        return;
      } else if (typeof fakeUnion === 'string') {
        return;
      } else {
        return assertNever(fakeUnion);
      }
    } catch (err) {
      errToTest = err;
    }

    expect(errToTest?.message).toEqual('We do not currently support this: 4');
  });
});
