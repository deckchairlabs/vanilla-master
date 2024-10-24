import { createCssContext } from "hono/css";

const context = createCssContext({
  id: "app",
});

export const css = context.css;
export const cx = context.cx;
export const keyframes = context.keyframes;
export const viewTransition = context.viewTransition;
export const Style = context.Style;
