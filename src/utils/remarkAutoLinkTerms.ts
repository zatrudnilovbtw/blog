export interface AutoLinkTerm {
  label: string;
  slug: string;
}

export interface AutoLinkOptions {
  perTermLimit?: number;
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function remarkAutoLinkTerms(terms: AutoLinkTerm[], options: AutoLinkOptions = {}) {
  const perTermLimit = options.perTermLimit ?? 2;

  const normalized: Record<string, string> = Object.create(null);
  for (const t of terms) {
    const key = t.label.trim().toLowerCase();
    if (!key) continue;
    if (!(key in normalized)) normalized[key] = t.slug;
  }

  const alternation = Object.keys(normalized)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join('|');

  if (!alternation) {
    return function noop() { return (tree: any) => tree; };
  }

  const boundary = '[\\p{L}\\p{N}_-]';
  const re = new RegExp(`(?<!${boundary})(?:${alternation})(?!${boundary})`, 'giu');

  return function plugin() {
    return function transformer(tree: any) {
      const counts: Record<string, number> = Object.create(null);

      function shouldSkip(nodeType: string): boolean {
        return nodeType === 'link' || nodeType === 'linkReference' || nodeType === 'code' || nodeType === 'inlineCode';
      }

      function visit(node: any, parent: any | null) {
        if (!node) return;
        if (shouldSkip(node.type)) return;

        if (node.type === 'text' && typeof node.value === 'string' && parent && Array.isArray(parent.children)) {
          const original = node.value as string;
          re.lastIndex = 0;
          let match: RegExpExecArray | null;
          const newChildren: any[] = [];
          let cursor = 0;

          while ((match = re.exec(original)) !== null) {
            const start = match.index;
            const end = re.lastIndex;
            if (start > cursor) {
              newChildren.push({ type: 'text', value: original.slice(cursor, start) });
            }

            const matchedText = original.slice(start, end);
            const key = matchedText.toLowerCase();
            const slug = normalized[key];
            const used = counts[key] || 0;

            if (slug && used < perTermLimit) {
              counts[key] = used + 1;
              newChildren.push({
                type: 'link',
                url: `/guide/${slug}`,
                title: null,
                children: [{ type: 'text', value: matchedText }],
              });
            } else {
              newChildren.push({ type: 'text', value: matchedText });
            }

            cursor = end;
          }

          if (cursor === 0) return; 

          if (cursor < original.length) {
            newChildren.push({ type: 'text', value: original.slice(cursor) });
          }

          const index = parent.children.indexOf(node);
          if (index !== -1) {
            parent.children.splice(index, 1, ...newChildren);
          }
          return; 
        }

        if (Array.isArray(node.children)) {
          for (const child of [...node.children]) {
            visit(child, node);
          }
        }
      }

      visit(tree, null);
      return tree;
    };
  };
}


