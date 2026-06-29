export interface Product {
  slug: string;
  title: string;
  image: string;
  alt: string;
  description?: string;
  category: 'gereedschappen' | 'inrichting' | 'slaapkamer' | 'home';
}

export const featuredProducts: Product[] = [
  {
    slug: 'beste-glasboor',
    title: 'Glasboor',
    image: '/images/products/glasboor.jpeg',
    alt: 'Glasboor',
    description:
      'De glasboor, een klein maar krachtig instrument, snijdt moeiteloos door het glas en opent de weg naar creatieve mogelijkheden en prachtige ambachtelijke projecten.',
    category: 'gereedschappen',
  },
  {
    slug: 'beste-moker',
    title: 'Moker',
    image: '/images/products/moker.jpeg',
    alt: 'Moker',
    category: 'gereedschappen',
  },
  {
    slug: 'beste-elektrische-dweil',
    title: 'Elektrische dweil',
    image: '/images/products/elektrische-dweil.jpeg',
    alt: 'Elektrische dweil',
    category: 'home',
  },
  {
    slug: 'beste-elektrische-muizenval',
    title: 'Elektrische muizenval',
    image: '/images/products/elektrische-muizenval.jpg',
    alt: 'Elektrische muizenval',
    category: 'home',
  },
  {
    slug: 'beste-striptang',
    title: 'Striptang',
    image: '/images/products/striptang.jpeg',
    alt: 'Striptang',
    category: 'gereedschappen',
  },
];

export const toolProducts: Product[] = [
  {
    slug: 'beste-tegelsnijder',
    title: 'Tegelsnijder',
    image: '/images/products/tegelsnijder.jpeg',
    alt: 'Tegelsnijder',
    category: 'gereedschappen',
  },
  {
    slug: 'beste-boormachine',
    title: 'Boormachine',
    image: '/images/products/boormachine.jpeg',
    alt: 'Boormachine',
    category: 'gereedschappen',
  },
  {
    slug: 'beste-gereedschapstrolley',
    title: 'Gereedschapstrolley',
    image: '/images/products/gereedschapstrolley.jpeg',
    alt: 'Gereedschapstrolley',
    category: 'gereedschappen',
  },
  {
    slug: 'beste-staalborstel',
    title: 'Staalborstel',
    image: '/images/products/staalborstel.jpg',
    alt: 'Staalborstel',
    category: 'gereedschappen',
  },
  {
    slug: 'beste-handcirkelzaag',
    title: 'Handcirkelzaag',
    image: '/images/products/handcirkelzaag.jpg',
    alt: 'Handcirkelzaag',
    category: 'gereedschappen',
  },
  {
    slug: 'beste-gereedschapskist',
    title: 'Gereedschapskist',
    image: '/images/products/gereedschapskist.jpeg',
    alt: 'Gereedschapskist',
    category: 'gereedschappen',
  },
];

export const allProducts: Product[] = [...featuredProducts, ...toolProducts];

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: Product['category']): Product[] {
  return allProducts.filter((p) => p.category === category);
}

export function getProductTitle(slug: string): string {
  const product = getProductBySlug(slug);
  if (product) return product.title;
  return slug
    .replace(/^beste-/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function getAllProductSlugs(): string[] {
  return Array.from(new Set(allProducts.map((p) => p.slug)));
}
