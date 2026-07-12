import { defineHastPlugin } from "satteri";

export const honeymateLoader = () => defineHastPlugin({
  name: "honeymate-loader",
  element: [
    {
      filter: ["img"],
      visit(node, ctx) {
        ctx.setProperty(node, "className", "honey")
        ctx.setProperty(node, "data-spin", "true")
      },
    },
  ],
});
