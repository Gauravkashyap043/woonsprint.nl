export interface ReviewCard {
  title: string;
  href: string;
  image: string;
  alt: string;
}

export interface CategoryCard {
  title: string;
  href: string;
  icon: 'chair' | 'bed' | 'table' | 'lamp' | 'cooker' | 'outdoor' | 'bar' | 'shower';
}

export const latestReviews: ReviewCard[] = [
  {
    title: 'Wasmand met deksel',
    href: '/beste-wasmand-met-deksel/',
    image: '/wp-content/uploads/2023/05/6f83ea46-04c7-4b6c-9e8a-89f1567cdadf-881x1024.jpeg',
    alt: 'Wasmand met deksel',
  },
  {
    title: 'Schommelstoel',
    href: '/beste-schommelstoel/',
    image: '/wp-content/uploads/2023/05/Schommelstoel-1024x1024.jpeg',
    alt: 'Schommelstoel',
  },
  {
    title: 'Robotstofzuiger met dweilfunctie',
    href: '/beste-robotstofzuiger-met-dweilfunctie/',
    image: '/wp-content/uploads/2023/05/d15937cc-c579-42e7-a14f-8ac2bf175efe-951x1024.jpeg',
    alt: 'Robotstofzuiger met dweilfunctie',
  },
  {
    title: 'Beveiligingscamera buiten',
    href: '/beste-beveiligingscamera-buiten/',
    image: '/wp-content/uploads/2023/05/5278a73e-38e6-49b7-83d6-a62d969e4dc2-1024x788.jpeg',
    alt: 'Beveiligingscamera buiten',
  },
  {
    title: 'Douchekop met slang',
    href: '/beste-douchekop-met-slang/',
    image: '/wp-content/uploads/2023/05/d-1024x1020.jpeg',
    alt: 'Douchekop met slang',
  },
  {
    title: 'Wekker op batterijen',
    href: '/beste-wekker-op-batterijen/',
    image: '/wp-content/uploads/2022/11/Rectangle-366.jpg',
    alt: 'Wekker op batterijen',
  },
];

export const homepageCategories: CategoryCard[] = [
  { title: 'Zitzak volwassenen', href: '/beste-zitzak-volwassenen/', icon: 'chair' },
  { title: 'Dekbedovertrek', href: '/beste-dekbedovertrek-200x200/', icon: 'bed' },
  { title: 'Bijzettafel', href: '/beste-bijzettafel/', icon: 'table' },
  { title: 'Kroonluchter', href: '/beste-kroonluchter/', icon: 'lamp' },
  { title: 'Slowcooker met timer', href: '/beste-slowcooker-met-timer/', icon: 'cooker' },
  {
    title: 'Buitenlamp met bewegingssensor',
    href: '/beste-buitenlamp-met-bewegingssensor/',
    icon: 'outdoor',
  },
  { title: 'Bartafel', href: '/beste-bartafel/', icon: 'bar' },
  {
    title: 'Waterbesparende douchekop',
    href: '/beste-waterbesparende-douchekop/',
    icon: 'shower',
  },
];

export const ctaSections = {
  boekenkast: {
    title: 'Wat is onze top 10 open boekenkast?',
    text: 'Jaarlijks beoordelen wij veel verschillende producten voor de woninginrichting. Per test hebben we een top 10 samengesteld van het beste product in die categorie. Wat is er mooier dan een grote open boekenkast in je zitkamer waar je je lekker kan terugtrekken bij de open haard me een fijn boek? Er is weinig dat dit gevoel kan overtreffen vinden wij!',
    ctaLabel: 'Klik snel door voor onze top 10 open boekenkast!',
    href: '/beste-open-boekenkast/',
    image: '/wp-content/uploads/2022/11/Frame2.svg',
    imageAlt: 'Open boekenkast illustratie',
    reverse: false,
  },
  rooms: {
    title: 'De beste producten voor elke ruimte.',
    text: 'Ben je op zoek naar een heerlijk nieuw bed of ga je de woonkamer opnieuw decoreren? Of misschien wil je de tuin wel een metamorfose geven. Wat je ook van plan bent, op onze website vind je de mooiste aankopen voor elke ruimte in jouw huis.',
    ctaLabel: 'Ontdek onze categorieën',
    href: '/inrichting/',
    image: '/wp-content/uploads/2022/11/Frame3.svg',
    imageAlt: 'Woonproducten voor elke ruimte',
    reverse: true,
  },
};
