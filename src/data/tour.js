// Tour dates are tentative (2027).
export const cities = [
  {
    slug: 'fort-lauderdale',
    name: 'Fort Lauderdale',
    date: 'MAY 20, 2027',
    venue: 'Broward County Convention Center',
    accent: 'blue',
    price: 49,
    teaser: 'Bring your next chapter to Fort Lauderdale.',
    description: 'A high-energy gathering for founders, operators, and ambitious professionals ready to turn ideas into momentum.'
  },
  {
    slug: 'denver',
    name: 'Denver',
    date: 'AUG 05, 2027',
    venue: 'Gaylord Rockies',
    accent: 'yellow',
    price: 49,
    teaser: 'Make your next move in Denver.',
    description: 'Meet operators, investors, and creative leaders building the next era of business and AI.'
  },
  {
    slug: 'dallas',
    name: 'Dallas',
    date: 'SEP 16, 2027',
    venue: 'Embassy Suites Dallas Frisco',
    accent: 'pink',
    price: 49,
    teaser: 'Build momentum in Dallas.',
    description: 'Learn practical strategies to grow revenue, adopt AI, and build lasting wealth with real-world examples.'
  },
  {
    slug: 'atlanta',
    name: 'Atlanta',
    date: 'OCT 21, 2027',
    venue: 'Gas South Convention Center',
    accent: 'red',
    price: 49,
    teaser: 'Bring your next chapter to Atlanta.',
    description: 'A high-energy gathering for founders, operators, and ambitious professionals ready to turn ideas into momentum.'
  }
];

export function getCityBySlug(slug) {
  return cities.find((city) => city.slug === slug);
}

// "Fort Lauderdale, Denver, Dallas, and Atlanta"
export function cityList() {
  const names = cities.map((city) => city.name);
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`;
}
