export type FunctionArguments<T extends Function> = T extends (
  ...args: infer R
) => any
  ? R
  : never;

export function callAllHandlers<T extends (event: any) => void>(
  ...fns: (T | undefined)[]
) {
  return function (event: FunctionArguments<T>[0]) {
    fns.some(fn => {
      fn && fn(event);
      return event && event.defaultPrevented;
    });
  };
}
