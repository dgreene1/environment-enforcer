import { itemsInAThatArenNotInB } from './compare';

describe('itemsInAThatArenNotInB', () => {
  it('produces an empty array when both are equal', () => {
    // Arrange
    const arrayA = ['foo', 'bar'];
    const arrayB = ['foo', 'bar'];

    // Act
    const result = itemsInAThatArenNotInB(arrayA, arrayB);

    // Assert
    expect(result.length).toEqual(0);
  });

  it('shows that A has 1 item that B does not have', () => {
    // Arrange
    const arrayA = ['foo', 'bar'];
    const arrayB = ['foo'];

    // Act
    const result = itemsInAThatArenNotInB(arrayA, arrayB);

    // Assert
    expect(result.length).toEqual(1);
    expect(result[0]).toEqual('bar');
  });

  it('shows that A has all the items that B has by producing an empty array', () => {
    // Arrange
    const arrayA = ['foo', 'bar'];
    const arrayB = ['foo', 'bar', 'something extra'];

    // Act
    const result = itemsInAThatArenNotInB(arrayA, arrayB);

    // Assert
    expect(result.length).toEqual(0);
  });
});
