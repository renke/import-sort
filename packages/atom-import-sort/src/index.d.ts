declare module "loophole" {
  export function allowUnsafeEval(f: () => any);
  export function allowUnsafeNewFunction(f: () => any);
}
