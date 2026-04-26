declare module "*.jsx" {
  import type { ComponentType } from "react";
  const value: ComponentType<unknown>;
  export default value;
}
