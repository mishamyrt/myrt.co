import { defineHastPlugin, type HastContent } from "satteri";

const graphemes = new Intl.Segmenter();
const emoji = /^\p{RGI_Emoji}$/v;

export const wrapEmoji = () => defineHastPlugin({
  name: "wrap-emoji",
  text(node, ctx) {
    const children: HastContent[] = [];
    let offset = 0;

    for (const { segment, index } of graphemes.segment(node.value)) {
      if (!emoji.test(segment)) continue;

      if (index > offset) {
        children.push({ type: "text", value: node.value.slice(offset, index) });
      }
      children.push({
        type: "element",
        tagName: "span",
        properties: { className: ["emoji"] },
        children: [{ type: "text", value: segment }],
      });
      offset = index + segment.length;
    }

    if (!children.length) return;

    for (let parent = ctx.parent(node); parent.type === "element"; parent = ctx.parent(parent)) {
      if (parent.tagName === "code" || parent.tagName === "pre") return;
    }

    if (offset < node.value.length) {
      children.push({ type: "text", value: node.value.slice(offset) });
    }
    ctx.replaceNode(node, children);
  },
});
