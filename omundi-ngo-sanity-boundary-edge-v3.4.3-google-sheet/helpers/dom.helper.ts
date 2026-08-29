import { expect, type Locator, type Page } from '@playwright/test';

export function uuidPattern(): RegExp {
  return /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;
}

export async function textDoesNotOverflow(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();
  const metrics = await locator.evaluate((el) => {
    const node = el as HTMLElement;
    const style = getComputedStyle(node);
    return {
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
      scrollHeight: node.scrollHeight,
      clientHeight: node.clientHeight,
      overflow: style.overflow,
      textOverflow: style.textOverflow,
      whiteSpace: style.whiteSpace,
      title: node.getAttribute('title') ?? '',
      ariaLabel: node.getAttribute('aria-label') ?? ''
    };
  });

  const horizontallySafe =
    metrics.scrollWidth <= metrics.clientWidth + 1 ||
    metrics.textOverflow === 'ellipsis' ||
    metrics.overflow === 'hidden' ||
    Boolean(metrics.title) ||
    Boolean(metrics.ariaLabel);

  expect(horizontallySafe, 'Text overflows without wrapping, truncation or tooltip').toBe(true);
}

export async function findTopSearch(page: Page): Promise<Locator> {
  const search = page.getByRole('searchbox').first();
  await expect(search).toBeVisible();
  return search;
}

export function normalizeTitleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map(word => word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word)
    .join(' ');
}
