import { PROMPT_STYLES } from "../data/promptOptions";

const UNCATEGORIZED_ID = "__uncategorized__";

/**
 * Groups the menu by category. Only active categories are included, plus
 * un-categorised items (e.g. after their category was deleted) under "Other Items".
 * Empty groups are dropped.
 */
export function getMenuGroups({ categories, menuItems, onlyAvailable }) {
  const usable = (item) => !onlyAvailable || item.status === "available";

  const groups = categories
    .filter((c) => c.status === "active")
    .map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description || "",
      items: menuItems.filter((i) => i.categoryId === c.id && usable(i)),
    }));

  const orphans = menuItems.filter(
    (i) => usable(i) && (!i.categoryId || !categories.some((c) => c.id === i.categoryId))
  );
  if (orphans.length) {
    groups.push({ id: UNCATEGORIZED_ID, name: "Other Items", description: "", items: orphans });
  }

  return groups.filter((g) => g.items.length > 0);
}

/**
 * Splits category groups into `pageCount` pages, keeping category order and
 * balancing the number of items per page. Every page gets at least one category.
 */
export function splitGroupsIntoPages(groups, pageCount) {
  const n = Math.max(1, Math.min(pageCount, groups.length));
  if (n === 1) return [groups];

  const total = groups.reduce((sum, g) => sum + g.items.length, 0);
  const pages = [];
  let current = [];
  let acc = 0;
  let used = 0;

  groups.forEach((group, i) => {
    current.push(group);
    acc += group.items.length;

    const pagesLeft = n - pages.length - 1; // pages still to be created after this one
    const groupsLeft = groups.length - i - 1;

    if (pagesLeft > 0 && groupsLeft >= pagesLeft) {
      const target = (total - used) / (pagesLeft + 1);
      // close the page when it is "full", or when we must leave one group per remaining page
      if (acc >= target || groupsLeft === pagesLeft) {
        pages.push(current);
        used += acc;
        current = [];
        acc = 0;
      }
    }
  });

  if (current.length) pages.push(current);
  return pages;
}

function formatItem(item, options) {
  const parts = [item.name];
  if (options.includePrices) parts.push(`₹${item.price}`);
  if (options.includeDescriptions && item.description) parts.push(item.description);
  let line = `   - ${parts.join(" — ")}`;
  if (options.highlightPopular && item.isPopular) line += " [POPULAR]";
  return line;
}

function buildPagePrompt({ groups, options, pageNumber, totalPages }) {
  const style = PROMPT_STYLES.find((s) => s.id === options.styleId) || PROMPT_STYLES[0];
  const name = options.restaurantName.trim();
  const multi = totalPages > 1;
  const isFirst = pageNumber === 1;
  const isLast = pageNumber === totalPages;
  const hasPopular =
    options.highlightPopular && groups.some((g) => g.items.some((i) => i.isPopular));

  const intro = multi
    ? `Design page ${pageNumber} of ${totalPages} of a multi-page restaurant menu${name ? ` for "${name}"` : ""}.`
    : `Design a single-page restaurant menu${name ? ` for "${name}"` : ""}.`;

  const layout = [];
  if (multi) {
    layout.push(`Design ONLY page ${pageNumber}. Do not include content that belongs to other pages.`);
    layout.push(
      `Keep colours, fonts, ornaments and spacing consistent so all ${totalPages} pages look like one matching set.`
    );
  } else {
    layout.push("Fit the whole menu on one page; use a two-column layout if it improves readability.");
  }
  layout.push("Portrait orientation, A4 proportions, print-ready with safe margins.");
  layout.push("Show every category as its own clearly labelled section, in the order listed below.");
  if (isFirst) {
    layout.push(
      name
        ? `Add a header with the restaurant name "${name}" and a placeholder area for the logo.`
        : "Add a header with a placeholder for the restaurant name and logo."
    );
  }
  if (multi) layout.push(`Add a small page indicator: "${pageNumber} / ${totalPages}".`);
  if (isLast) layout.push("Finish with a footer containing placeholders for address, phone number and opening hours.");

  const content = groups.flatMap((group, index) => {
    const heading = `${index + 1}. ${group.name.toUpperCase()}${group.description ? ` — ${group.description}` : ""}`;
    return [heading, ...group.items.map((item) => formatItem(item, options))];
  });

  const rules = [
    "Use ONLY the categories and items listed under MENU CONTENT. Do not invent, rename, translate or reorder anything.",
    "Spell every item name exactly as written.",
    options.includePrices
      ? "Show each price exactly as written, in Indian Rupees (₹)."
      : "Do not show any prices.",
    options.includeDescriptions
      ? "Show each item's short description in smaller text beneath its name."
      : "Show item names only, without descriptions.",
  ];
  if (hasPopular) {
    rules.push(
      "Items tagged [POPULAR] must stand out (for example with a star badge or a highlighted box). Never print the tag text itself."
    );
  }
  rules.push("Output one high-resolution, print-ready design.");

  const bullets = (list) => list.map((line) => `- ${line}`);

  return [
    intro,
    "",
    "DESIGN STYLE",
    `${style.label}: ${style.prompt}.`,
    "",
    "LAYOUT",
    ...bullets(layout),
    "",
    "MENU CONTENT",
    ...content,
    "",
    "RULES",
    ...bullets(rules),
  ].join("\n");
}

/**
 * Builds the prompt(s). Single-page layout -> one prompt.
 * Multiple-page layout -> one standalone prompt per page.
 */
export function generateMenuPrompts({ categories, menuItems, options }) {
  const groups = getMenuGroups({ categories, menuItems, onlyAvailable: options.onlyAvailable });
  const categoryTotal = groups.length;
  const itemTotal = groups.reduce((sum, g) => sum + g.items.length, 0);

  if (!categoryTotal) return { pages: [], categoryTotal: 0, itemTotal: 0 };

  const pageGroups =
    options.layout === "multiple" ? splitGroupsIntoPages(groups, options.pageCount) : [groups];
  const totalPages = pageGroups.length;

  const pages = pageGroups.map((pageGroup, index) => ({
    pageNumber: index + 1,
    totalPages,
    categoryNames: pageGroup.map((g) => g.name),
    itemCount: pageGroup.reduce((sum, g) => sum + g.items.length, 0),
    prompt: buildPagePrompt({ groups: pageGroup, options, pageNumber: index + 1, totalPages }),
  }));

  return { pages, categoryTotal, itemTotal };
}
