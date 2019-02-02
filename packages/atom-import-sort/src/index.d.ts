declare module "loophole" {
  export function allowUnsafeEval(f: () => unknown);
  export function allowUnsafeNewFunction(f: () => unknown);
}
