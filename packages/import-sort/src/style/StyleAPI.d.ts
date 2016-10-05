declare module "is-builtin-module" {
  function isNodeModule(moduleName: string): boolean;
  export = isNodeModule;
}
