declare module "find-line-column" {
  export default function findLineColumn(
    text: string,
    offset: number,
  ): {
    line: number;
    column: number;
  };
}
