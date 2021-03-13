export type SimpleType = 'number' | 'string' | 'null' | 'undefined';

export const typeGuards = {
  isSimpleType: (thingToTest: unknown): thingToTest is SimpleType => {
    const recordOfSimpleTypes: Record<SimpleType, true> = {
      null: true,
      number: true,
      string: true,
      undefined: true,
    };

    if (typeof thingToTest !== 'string') {
      return false;
    }

    return Object.keys(recordOfSimpleTypes).some(aSimpleType => {
      return aSimpleType === thingToTest;
    });
  },
};

export interface INonArrayDef<V = SimpleType> {
  isArray: false;
  jsType: V;
}

export interface IArrayTypeDef {
  isArray: true;
  jsType: TypeDef;
}

export interface INonUnionNonIntersectionDef<
  D extends IArrayTypeDef | INonArrayDef = IArrayTypeDef | INonArrayDef
> {
  variation: 'nonUnionNonIntersection';
  details: D;
}

export interface IUnionTypeDef<
  D extends IArrayTypeDef | INonArrayDef = IArrayTypeDef | INonArrayDef
> {
  variation: 'union';
  details: Array<TypeDef<D>>;
}

export type TypeDef<
  D extends IArrayTypeDef | INonArrayDef = IArrayTypeDef | INonArrayDef
> = INonUnionNonIntersectionDef<D> | IUnionTypeDef<D>;

export interface PropertyNameAndTypeDef<
  D extends IArrayTypeDef | INonArrayDef = IArrayTypeDef | INonArrayDef
> {
  propertyName: string;
  isOptional: boolean;
  typeDef: TypeDef<D>;
}

export const recordOfVariationKeys: Record<TypeDef['variation'], true> = {
  nonUnionNonIntersection: true,
  union: true,
};
