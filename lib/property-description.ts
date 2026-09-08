import { removeEmojis } from './text';

export type PropertyDescriptionSections = {
  description: string[];
  location: string[];
  features: string[];
  surfaces: string[];
  distribution: string[];
  services: string[];
  additional: string[];
};

type DescriptionOptions = {
  title?: string | null;
  priceText?: string | null;
  recognizeCompactSurfaces?: boolean;
};

type CaptionLine = {
  raw: string;
  text: string;
};

const contactStartPattern = /^(?:(?:por\s+)?consultas?(?:\s+y\s+visitas?(?:\s+al\s+inmueble)?)?|consulas?|contact(?:o|anos|enos)|(?:para|por)\s+m[aá]s\s+(?:informaci[oó]n|detalles?)|para\s+coordinar\s+(?:una\s+)?visita(?:\s+con\s+nosotros)?|puede\s+solicitar\s+m[aá]s\s+informaci[oó]n|estamos\s+para\s+informarte)\s*:?$/i;
const phonePattern = /\b3447(?:[\s-]?\d){6}\b/;
const officeAddressPattern = /\bsourigues\s+12\b/i;
const commercialClosingPattern = /^[¡!\s]*(?:ven[ií]\s+a\s+(?:conocer|visitar)(?:la|lo|las|los)?(?:\s+con\s+nosotros)?|cons[uú]ltenos(?:\s+por.*)?|contact(?:a|á|e|anos|enos)(?:nos)?(?:\s+para.*)?)[!.\s]*$/i;
const locationMarkerPattern = /📍/u;
const surfaceMarkerPattern = /📐|🏠/u;
const featureMarkerPattern = /✅|☑|✔|🔹|▪|▫|➡|➕|❌|🔸|🔻|🔽|⬇|⬆|◆/u;
const serviceMarkerPattern = /💯/u;

function normalizeForComparison(text: string) {
  return removeEmojis(text)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
    .replace(/[^\p{Letter}\p{Number}$]+/gu, ' ')
    .trim();
}

function prepareCaptionLines(text: string) {
  const lines: CaptionLine[] = [];

  for (const raw of text.split(/\r?\n/)) {
    const cleaned = removeEmojis(raw);
    if (cleaned && contactStartPattern.test(cleaned)) break;
    if (cleaned && (phonePattern.test(cleaned) || officeAddressPattern.test(cleaned) || commercialClosingPattern.test(cleaned))) continue;
    lines.push({ raw, text: cleaned });
  }

  while (lines.length > 0 && !lines.at(-1)?.text) lines.pop();
  return lines;
}

export function cleanInstagramDescription(text: string) {
  return prepareCaptionLines(text)
    .map(line => line.text)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function addUnique(target: string[], value: string) {
  const formatted = value.replace(/(\d)\s*m2\b/gi, '$1 m²').replace(/\s+([,.;:])/g, '$1').trim();
  const normalized = normalizeForComparison(formatted);
  if (formatted && !target.some(item => normalizeForComparison(item) === normalized)) target.push(formatted);
}

export function parseInstagramDescription(text: string, options: DescriptionOptions = {}): PropertyDescriptionSections {
  const sections: PropertyDescriptionSections = {
    description: [],
    location: [],
    features: [],
    surfaces: [],
    distribution: [],
    services: [],
    additional: [],
  };
  const title = options.title ? normalizeForComparison(options.title) : '';
  const priceParts = new Set((options.priceText || '').split(/\||\r?\n/).map(normalizeForComparison).filter(Boolean));
  const lines = prepareCaptionLines(text);
  let mode: keyof PropertyDescriptionSections | null = null;
  let seenSemanticSection = false;
  let priceBlock = false;

  for (const line of lines) {
    const value = line.text;
    if (!value) {
      mode = null;
      priceBlock = false;
      continue;
    }

    const normalized = normalizeForComparison(value);
    if (!normalized || normalized === title) continue;

    if (options.priceText) {
      if (/^precios?\s*:?$/i.test(value)) {
        priceBlock = true;
        continue;
      }
      if (/^precios?(?:\s+\w+){0,4}\s*:/i.test(value) || priceParts.has(normalized) || (priceBlock && /(?:us\$|u\$s|usd|\$)\s*[\d.]/i.test(value))) continue;
    }

    if (locationMarkerPattern.test(line.raw) || /^(?:ubicad[oa]s?|localizad[oa]s?|direcci[oó]n)\b/i.test(value) || /^a\s+\d+(?:[.,]\d+)?\s*(?:m|mts?|metros|km)\b/i.test(value)) {
      addUnique(sections.location, value.replace(/^ubicaci[oó]n\s*:?\s*/i, ''));
      mode = 'location';
      seenSemanticSection = true;
      continue;
    }

    const compactSurface = options.recognizeCompactSurfaces && (/^\d+(?:[.,]\d+)?\s*m(?:2|²)\.?$/i.test(value) || /\d+(?:[.,]\d+)?\s*m(?:2|²)\b.*\b(?:lote|terreno)\b/i.test(value) || /^\d+\s+(?:departamentos?|unidades?|lotes?|parcelas?).*\d+(?:[.,]\d+)?\s*m(?:2|²)\b/i.test(value));
    if (surfaceMarkerPattern.test(line.raw) || /\b(?:sup(?:erficie)?\.?|medidas?|hect[aá]reas?|m2|m²|metros\s+cuadrados|mts?\s+de\s+frente|mts?\s+de\s+fondo)\b/i.test(value) || compactSurface) {
      addUnique(sections.surfaces, value);
      mode = 'surfaces';
      seenSemanticSection = true;
      continue;
    }

    if (serviceMarkerPattern.test(line.raw) || /\b(?:servicios?|luz|agua|cloacas?|gas\s+natural|electricidad|internet|wi-?fi|cable|asfalto)\b/i.test(value)) {
      addUnique(sections.services, value);
      mode = 'services';
      seenSemanticSection = true;
      continue;
    }

    if (/^(?:(?:en\s+)?planta\s+(?:baja|alta)|distribuci[oó]n)\b/i.test(value)) {
      addUnique(sections.distribution, value.replace(/:$/, ''));
      mode = 'distribution';
      seenSemanticSection = true;
      continue;
    }

    if (/^(?:sus\s+)?(?:caracter[ií]sticas|comodidades)|^(?:ofrece|cuenta\s+con)\s*:?$/i.test(value)) {
      mode = 'features';
      seenSemanticSection = true;
      continue;
    }

    if (featureMarkerPattern.test(line.raw)) {
      const target = mode === 'distribution' || mode === 'services' ? sections[mode] : sections.features;
      addUnique(target, value);
      seenSemanticSection = true;
      continue;
    }

    if (mode) {
      addUnique(sections[mode], value);
      continue;
    }

    addUnique(seenSemanticSection ? sections.additional : sections.description, value);
  }

  return sections;
}
