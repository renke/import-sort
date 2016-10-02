declare module "file" {
  export function walkSync(directory: string, callback: (directory: string, directories: Array<string>, files: Array<string>) => void);
}
