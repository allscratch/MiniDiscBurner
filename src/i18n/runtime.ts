import { FR } from './fr';

// Traduction runtime : observer le DOM traduit, sans toucher aux composants.
type Memorized = { source: string; translated: string };
type PatternEntry = { pattern: RegExp; translation: string };

const LANGUAGE_KEY = 'mdb-language';
const ATTRIBUTES = ['title', 'placeholder', 'aria-label', 'alt'] as const;
const EXCLUDED_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'SELECT', 'NOSCRIPT', 'IFRAME']);
const PLACEHOLDER_SOURCE = String.raw`\$\{[^}]*\}|\{\d+\}|%[sd]`;
const hasPlaceholder = (value: string): boolean => new RegExp(PLACEHOLDER_SOURCE).test(value);

let enabled = true;
let installed = false;
let scheduled = false;
let observer: MutationObserver | null = null;

const pending = new Set<Node>();
const tracked = new Set<Node>();
const memory = new WeakMap<Node, Memorized>();
const patterns: PatternEntry[] = [];
const reverse = new Map<string, string>();

function placeholderRegex(): RegExp {
  return new RegExp(PLACEHOLDER_SOURCE, 'g');
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
}

function readLanguage(): boolean {
  try {
    return localStorage.getItem(LANGUAGE_KEY) !== 'en';
  } catch {
    return true; // Par défaut, français.
  }
}

function writeLanguage(isFrench: boolean): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, isFrench ? 'fr' : 'en');
  } catch {
    // Stockage indisponible : on continue sans persister.
  }
}

function buildIndexes(): void {
  for (const [source, translation] of Object.entries(FR)) {
    if (!hasPlaceholder(source)) {
      if (!reverse.has(translation)) reverse.set(translation, source);
      continue;
    }
    const finder = placeholderRegex();
    const parts: string[] = [];
    let cursor = 0;
    let match: RegExpExecArray | null;
    while ((match = finder.exec(source)) !== null) {
      parts.push(escapeRegex(source.slice(cursor, match.index)));
      parts.push('([\\s\\S]*?)');
      cursor = match.index + match[0].length;
    }
    parts.push(escapeRegex(source.slice(cursor)));
    patterns.push({ pattern: new RegExp(`^${parts.join('')}$`), translation });
  }
}

function lookup(source: string): string | undefined {
  const direct = FR[source];
  if (direct !== undefined) return direct;
  for (const entry of patterns) {
    const match = entry.pattern.exec(source);
    if (!match) continue;
    let index = 1;
    return entry.translation.replace(placeholderRegex(), () => match[index++] ?? '');
  }
  return undefined;
}

function isExcluded(node: Node): boolean {
  let current: Node | null = node;
  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as Element;
      if (EXCLUDED_TAGS.has(element.tagName)) return true;
      const editable = element.getAttribute('contenteditable');
      if (editable !== null && editable !== 'false') return true;
    }
    current = current.parentNode;
  }
  return false;
}

function translateText(node: Text): void {
  const current = node.nodeValue ?? '';
  const memo = memory.get(node);
  // Si la valeur vaut la traduction mémorisée, c'est notre propre mutation.
  if (memo && current === memo.translated) return;

  const source = memo && current === memo.source ? memo.source : current;
  if (!memo && reverse.has(current)) return; // Déjà en français.

  const translated = lookup(source);
  if (translated === undefined) {
    if (memo) {
      memory.delete(node);
      tracked.delete(node);
    }
    return;
  }
  if (translated === current && !memo) return;

  node.nodeValue = translated; // React peut remplacer cette valeur : on la détectera au prochain passage.
  memory.set(node, { source, translated });
  tracked.add(node);
}

function translateAttribute(attribute: Attr, element: Element): void {
  // Les champs saisissables ne traduisent que leur placeholder.
  if (element.tagName === 'INPUT' && attribute.name !== 'placeholder') return;
  const current = attribute.value;
  const memo = memory.get(attribute);
  if (memo && current === memo.translated) return;

  const source = memo && current === memo.source ? memo.source : current;
  if (!memo && reverse.has(current)) return;

  const translated = lookup(source);
  if (translated === undefined) {
    if (memo) {
      memory.delete(attribute);
      tracked.delete(attribute);
    }
    return;
  }
  if (translated === current && !memo) return;

  attribute.value = translated;
  memory.set(attribute, { source, translated });
  tracked.add(attribute);
}

function walk(root: Node): void {
  if (!enabled || root.nodeType === Node.ATTRIBUTE_NODE) return;
  if (isExcluded(root)) return;

  if (root.nodeType === Node.TEXT_NODE) {
    translateText(root as Text);
    return;
  }

  if (root.nodeType === Node.ELEMENT_NODE) {
    const element = root as Element;
    for (const name of ATTRIBUTES) {
      const attribute = element.getAttributeNode(name);
      if (attribute) translateAttribute(attribute, element);
    }
  }

  for (const child of Array.from(root.childNodes)) walk(child);
}

function schedule(root: Node): void {
  if (!enabled) return;
  pending.add(root);
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    const roots = Array.from(pending);
    pending.clear();
    for (const node of Array.from(tracked)) {
      const alive = node.nodeType === Node.ATTRIBUTE_NODE ? !!(node as Attr).ownerElement : node.isConnected;
      if (!alive) {
        memory.delete(node);
        tracked.delete(node);
      }
    }
    for (const node of roots) {
      if (node.isConnected || node === document.body) walk(node);
    }
  });
}

function restoreSources(): void {
  for (const node of Array.from(tracked)) {
    const memo = memory.get(node);
    if (!memo) continue;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node as Text;
      if (text.nodeValue === memo.translated) text.nodeValue = memo.source;
    } else if (node.nodeType === Node.ATTRIBUTE_NODE) {
      const attribute = node as Attr;
      if (attribute.value === memo.translated) attribute.value = memo.source;
    }
  }
  for (const node of tracked) memory.delete(node);
  tracked.clear();
  pending.clear();
}

/** Installe l'observer une seule fois. */
export function installFrenchRuntime(): void {
  if (installed) return;
  installed = true;
  buildIndexes();
  enabled = readLanguage();

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        schedule(mutation.target);
      } else if (mutation.type === 'characterData') {
        schedule(mutation.target);
      } else {
        for (const node of Array.from(mutation.addedNodes)) schedule(node);
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['title', 'placeholder', 'aria-label', 'alt'],
  });

  if (enabled) schedule(document.body);
}

/** Active/désactive la traduction et restaure les sources quand on repasse en anglais. */
export function setFrenchEnabled(nextEnabled: boolean): void {
  enabled = nextEnabled;
  writeLanguage(nextEnabled);
  if (!nextEnabled) {
    restoreSources();
    return;
  }
  if (installed) schedule(document.body);
}
