
/**
 * Creates double hover effect.
 *
 * On link hover adds `className` to all links with same href
 */
export function attachHover(className: string) {
  const links = document.querySelectorAll<HTMLAnchorElement>('a[href]');
  const linksMap: Record<string, HTMLAnchorElement[]> = {};

  function handleHover(event: MouseEvent) {
    const target = event.target as HTMLAnchorElement;
    const href = target.getAttribute('href');
    if (!href) {
      return;
    }

    const sameLinks = linksMap[href];
    if (!sameLinks || sameLinks.length < 2) {
      return;
    }

    if (event.type === 'mouseenter') {
      sameLinks.forEach((link) => link.classList.add(className));
    } else {
      sameLinks.forEach((link) => link.classList.remove(className));
    }
  }

  for (const link of links) {
    const href = link.getAttribute('href');
    if (!href) {
      continue;
    }

    if (!linksMap[href]) {
      linksMap[href] = [];
    }
    linksMap[href].push(link);

    link.addEventListener('mouseenter', handleHover);
    link.addEventListener('mouseleave', handleHover);
  }
}
