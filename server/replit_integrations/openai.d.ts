declare module "openai" {
  const OpenAI: any;
  export function toFile(...args: any[]): any;
  export default OpenAI;
}
