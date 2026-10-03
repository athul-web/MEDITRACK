/**
 * Kerala Geographic Coordinates Reference
 * Contains coordinates for all 14 districts and major healthcare hubs across Kerala.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const KERALA_DISTRICT_COORDINATES: Record<string, Coordinates> = {
  alappuzha: { latitude: 9.4981, longitude: 76.3388 },
  ernakulam: { latitude: 9.9816, longitude: 76.2999 },
  idukki: { latitude: 9.8500, longitude: 76.9700 },
  kannur: { latitude: 11.8745, longitude: 75.3704 },
  kasaragod: { latitude: 12.5102, longitude: 74.9852 },
  kasargod: { latitude: 12.5102, longitude: 74.9852 },
  kollam: { latitude: 8.8932, longitude: 76.6141 },
  kottayam: { latitude: 9.5916, longitude: 76.5222 },
  kozhikode: { latitude: 11.2588, longitude: 75.7804 },
  calicut: { latitude: 11.2588, longitude: 75.7804 },
  malappuram: { latitude: 11.0732, longitude: 76.0740 },
  palakkad: { latitude: 10.7867, longitude: 76.6548 },
  pathanamthitta: { latitude: 9.2648, longitude: 76.7870 },
  thiruvananthapuram: { latitude: 8.5241, longitude: 76.9366 },
  trivandrum: { latitude: 8.5241, longitude: 76.9366 },
  thrissur: { latitude: 10.5276, longitude: 76.2144 },
  wayanad: { latitude: 11.6854, longitude: 76.1320 },
};

export const KERALA_TOWN_COORDINATES: Record<string, Coordinates> = {
  kochi: { latitude: 9.9312, longitude: 76.2673 },
  cochin: { latitude: 9.9312, longitude: 76.2673 },
  kalamassery: { latitude: 10.0285, longitude: 76.3361 },
  aluva: { latitude: 10.1120, longitude: 76.3450 },
  angamaly: { latitude: 10.2410, longitude: 76.4320 },
  tripunithura: { latitude: 9.9120, longitude: 76.2850 },
  perumbavoor: { latitude: 10.1530, longitude: 76.5210 },
  kothamangalam: { latitude: 10.1820, longitude: 76.7120 },
  muvattupuzha: { latitude: 10.0520, longitude: 76.6530 },
  chengannur: { latitude: 9.3175, longitude: 76.6111 },
  kayamkulam: { latitude: 9.1728, longitude: 76.5011 },
  mavelikara: { latitude: 9.2672, longitude: 76.5434 },
  cherthala: { latitude: 9.6844, longitude: 76.3338 },
  thiruvalla: { latitude: 9.3835, longitude: 76.5741 },
  adoor: { latitude: 9.1530, longitude: 76.7356 },
  punalur: { latitude: 9.0191, longitude: 76.9248 },
  kottarakkara: { latitude: 8.9984, longitude: 76.7709 },
  changanassery: { latitude: 9.4442, longitude: 76.5385 },
  pala: { latitude: 9.7107, longitude: 76.6836 },
  thodupuzha: { latitude: 9.8959, longitude: 76.7184 },
  chalakudy: { latitude: 10.3070, longitude: 76.3335 },
  kodungallur: { latitude: 10.2294, longitude: 76.1963 },
  guruvayur: { latitude: 10.5946, longitude: 76.0421 },
  kunnamkulam: { latitude: 10.6517, longitude: 76.0717 },
  ottapalam: { latitude: 10.7739, longitude: 76.3800 },
  manjeri: { latitude: 11.1215, longitude: 76.1211 },
  tirur: { latitude: 10.9167, longitude: 75.9234 },
  perinthalmanna: { latitude: 10.9760, longitude: 76.2255 },
  vatakara: { latitude: 11.6089, longitude: 75.5917 },
  badagara: { latitude: 11.6089, longitude: 75.5917 },
  thalassery: { latitude: 11.7480, longitude: 75.4894 },
  tellicherry: { latitude: 11.7480, longitude: 75.4894 },
  payyanur: { latitude: 12.1030, longitude: 75.2017 },
  kanhangad: { latitude: 12.3087, longitude: 75.0906 },
  kalpetta: { latitude: 11.6103, longitude: 76.0829 },
  'sulthan bathery': { latitude: 11.6627, longitude: 76.2570 },
  mananthavady: { latitude: 11.8028, longitude: 76.0033 },
  nedumangad: { latitude: 8.6015, longitude: 76.9998 },
  attingal: { latitude: 8.6961, longitude: 76.8143 },
  neyyattinkara: { latitude: 8.4005, longitude: 77.0863 },
  edappally: { latitude: 10.0261, longitude: 76.3125 },
  kakkanad: { latitude: 10.0159, longitude: 76.3419 },
  kaloor: { latitude: 9.9934, longitude: 76.2921 },
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Longest names first so "sulthan bathery" wins over a shorter overlapping name. */
function buildMatchers(table: Record<string, Coordinates>) {
  return Object.entries(table)
    .sort(([a], [b]) => b.length - a.length)
    .map(([name, coords]) => ({
      coords,
      // Whole-word match: "pala" must not match "Palakkad" or "Palarivattom".
      pattern: new RegExp(`(^|[^a-z])${escapeRegExp(name)}([^a-z]|$)`),
    }));
}

const TOWN_MATCHERS = buildMatchers(KERALA_TOWN_COORDINATES);
const DISTRICT_MATCHERS = buildMatchers(KERALA_DISTRICT_COORDINATES);

const findIn = (text: string, matchers: ReturnType<typeof buildMatchers>): Coordinates | null => {
  if (!text) return null;
  const hit = matchers.find(m => m.pattern.test(text));
  return hit ? hit.coords : null;
};

/**
 * Resolves *approximate* coordinates (a town or district centre) from a city
 * and/or address. Callers must treat the result as approximate: it is only good
 * for rough ordering, never for routing or "get directions".
 */
export function resolveKeralaCoordinates(city?: string | null, address?: string | null): Coordinates | null {
  const normCity = (city || '').toLowerCase().trim();
  const normAddress = (address || '').toLowerCase();

  return (
    findIn(normCity, TOWN_MATCHERS) ??
    findIn(normAddress, TOWN_MATCHERS) ??
    findIn(normCity, DISTRICT_MATCHERS) ??
    findIn(normAddress, DISTRICT_MATCHERS) ??
    null
  );
}
