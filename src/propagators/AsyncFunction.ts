export interface AsyncFunction extends Function {
}
export interface AsyncFunctionConstructor extends Function {
  new (...args: string[]): AsyncFunction;
  (...args: string[]): AsyncFunction;
  readonly prototype: AsyncFunction;
}

export const AsyncFunction: AsyncFunctionConstructor = ((async function () {}).constructor as unknown) as AsyncFunctionConstructor;
