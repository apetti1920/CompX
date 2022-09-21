export type WithID = { id: string };

// Conditionals
export type True = '1';
export type False = '0';

// Numbers
export type IsZero<T extends number> = T extends 0 ? True : False;
export type IsOne<T extends number> = T extends 1 ? True : False;
export type NumberToString<N extends number> = Numbers[N];
export type Numbers = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '50',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '59',
  '60',
  '61',
  '62',
  '63'
];
export type Next<T extends number> = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  64
][T];
export type Prev<T extends number> = [
  -1,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62
][T];
export type Add<A extends number, B extends number> = {
  '1': A;
  '0': Add<Next<A>, Prev<B>>;
}[IsZero<B>];
export type Sub<A extends number, B extends number> = {
  '1': A;
  '0': Sub<Prev<A>, Prev<B>>;
}[IsZero<B>];
export type NumberEqual<A extends number, B extends number> = A extends B ? (B extends A ? True : False) : False;

// Tuples
export type LengthOfTuple<T extends any[]> = T extends { length: infer L } ? L : never;
type DropFirstInTuple<T extends any[]> = T extends [arg: any, ...rest: infer U] ? U : T;
type TupleSplit<T, N extends number, O extends any[] = []> = O['length'] extends N
  ? [O, T]
  : T extends [infer F, ...infer R]
  ? TupleSplit<[...R], N, [...O, F]>
  : [O, T];
type TakeFirst<T extends any[], N extends number> = TupleSplit<T, N>[0];
type SkipFirst<T extends any[], N extends number> = TupleSplit<T, N>[1];

export type ReplaceInTuple<T extends any[], B extends number, R> = NumberEqual<B, 0> extends True
  ? [R, ...DropFirstInTuple<T>]
  : ReplaceInTuple2<T, B, TakeFirst<T, 1>, R, SkipFirst<T, 1>>;
type ReplaceInTuple2<T extends any[], B extends number, C extends any[], R, D extends any[]> = NumberEqual<
  B,
  LengthOfTuple<C>
> extends True
  ? [...C, R, ...DropFirstInTuple<D>]
  : ReplaceInTuple2<T, B, TakeFirst<T, Add<LengthOfTuple<C>, 1>>, R, SkipFirst<T, Add<LengthOfTuple<C>, 1>>>;
