export const cities = [
  {
    slug: 'atlanta',
    name: 'Atlanta',
    date: 'APR 17, 2027',
    venue: 'The Momentum Exchange',
    accent: 'blue',
    price: 49,
    teaser: 'Bring your next chapter to Atlanta.',
    description: 'A high-energy gathering for founders, operators, and ambitious professionals ready to turn ideas into momentum.'
  },
  {
    slug: 'phoenix',
    name: 'Phoenix',
    date: 'MAY 08, 2027',
    venue: 'The Future Foundry',
    accent: 'yellow',
    price: 49,
    teaser: 'Make your next move in Phoenix.',
    description: 'Meet operators, investors, and creative leaders building the next era of business and AI.'
  },
  {
    slug: 'houston',
    name: 'Houston',
    date: 'JUN 12, 2027',
    venue: 'The Wealth District',
    accent: 'pink',
    price: 49,
    teaser: 'Build momentum in Houston.',
    description: 'Learn practical strategies to grow revenue, adopt AI, and build lasting wealth with real-world examples.'
  }
];

export function getCityBySlug(slug) {
  return cities.find((city) => city.slug === slug);
}
