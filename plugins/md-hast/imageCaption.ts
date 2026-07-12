import { defineHastPlugin } from "satteri";

type ImgCaptionOptions = {
  containerClass: string
  captionClass: string
}

/**
 * Takes and pins caption from line after image.
 * Write markdown like this:
 *
 * ![alt](/img.jpg)
 * Caption
 */
export const imageCaption = ({ containerClass, captionClass }: ImgCaptionOptions) => defineHastPlugin({
  name: "image-caption",
  element: [
    {
      filter: ["p"],
      visit(node, ctx) {
        if (node.children.length !== 2) {
          return
        }
        if (node.children[0].type !== 'element') {
          return
        }
        if (node.children[0].tagName !== 'img') {
          return
        }
        if (node.children[1].type !== 'text') {
          return
        }
        const imgNode = node.children[0]
        const captionNode = node.children[1]
        const caption = captionNode.value.trim()
        if (!caption || !captionNode) {
          return
        }

        ctx.replaceNode(node, {
          type: "element",
          tagName: "div",
          properties: {
            className: containerClass
          },
          children: [
            imgNode,
            {
              type: "element",
              tagName: "span",
              properties: {
                className: captionClass
              },
              children: [
                { type: "text", value: caption }
              ],
            }
          ],
        })
      },
    },
  ],
});
