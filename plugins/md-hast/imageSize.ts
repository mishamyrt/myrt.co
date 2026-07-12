import { defineHastPlugin } from "satteri";
import { readFileSync } from 'node:fs'
import { basename, join } from "node:path";
import sizeOf from 'image-size';

export interface ImgSizeOptions {
  publicPath: string
  wrapperClass?: string
}

/**
 * Persist image size and places it in a wrapper div.
 * This is useful for lazy loading images.
 * Handles retina images as well.
 *
 * Image size is calculated from the image file,
 * so it is MUST exist in the public folder.
 */
export const imageSizeSetter = ({ publicPath, wrapperClass }: ImgSizeOptions) => defineHastPlugin({
  name: "image-size-setter",
  element: [
    {
      filter: ["img"],
      visit(node, ctx) {
        const imgPath = join(publicPath, node.properties.src as string);
        const img = readFileSync(imgPath);
        let { width, height } = sizeOf(img);

        if (isRetinaImg(imgPath)) {
            width = width / 2
            height = height / 2
        }

        ctx.replaceNode(node, {
          type: "element",
          tagName: "div",
          properties: {
            className: wrapperClass,
            style: `width: ${width}px; aspect-ratio: ${width}/${height};`
          },
          children: [
            node
          ]
        })
      },
    },
  ],
});

const isRetinaImg = (path: string) => {
  const base = getBaseName(path)
  return base.endsWith('@2x')
}

const getBaseName = (path: string) => {
  const base = basename(path)
  const parts = base.split('.')
  if (parts.length === 1) {
    return parts[0]
  }
  return parts.slice(0, parts.length - 1).join('.')
}
