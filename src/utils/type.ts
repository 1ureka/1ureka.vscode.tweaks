type Prettify<T> = { [K in keyof T]: T[K] } & {};

type MergeTypes<TypesArray extends any[], Res = {}> = TypesArray extends [infer Head, ...infer Rem]
  ? MergeTypes<Rem, Res | Head>
  : Res;

type OnlyFirst<F, S> = F & { [Key in keyof Omit<S, keyof F>]?: never };

type OneOf<TypesArray extends any[], Res = never, AllProps = MergeTypes<TypesArray>> = TypesArray extends [
  infer Head,
  ...infer Rem
]
  ? OneOf<Rem, Res | OnlyFirst<Head, AllProps>, AllProps>
  : Prettify<Res>;

export { Prettify, OneOf };
