export interface ReviewCard {
  title: string;
  href: string;
  image: string;
  alt: string;
}

export interface CategoryCard {
  title: string;
  href: string;
  icon: string;
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
  {
    title: 'Zitzak volwassenen',
    href: '/beste-zitzak-volwassenen/',
    icon: '/wp-content/uploads/2022/11/ph_armchair-duotone.svg',
  },
  {
    title: 'Dekbedovertrek',
    href: '/beste-dekbedovertrek-200x200/',
    icon: '/wp-content/uploads/2022/11/ph_bed-duotone.svg',
  },
  {
    title: 'Bijzettafel',
    href: '/beste-bijzettafel/',
    icon: '/wp-content/uploads/2022/11/ph_house-duotone.svg',
  },
  {
    title: 'Kroonluchter',
    href: '/beste-kroonluchter/',
    icon: '/wp-content/uploads/2022/11/ph_lightbulb-filament-duotone.svg',
  },
  {
    title: 'Slowcooker met timer',
    href: '/beste-slowcooker-met-timer/',
    icon: '/wp-content/uploads/2022/11/ph_cooking-pot-duotone.svg',
  },
  {
    title: 'Buitenlamp met bewegingssensor',
    href: '/beste-buitenlamp-met-bewegingssensor/',
    icon: '/wp-content/uploads/2022/11/ph_plug-duotone.svg',
  },
  {
    title: 'Bartafel',
    href: '/beste-bartafel/',
    icon: '/wp-content/uploads/2022/11/ph_television-simple-duotone.svg',
  },
  {
    title: 'Waterbesparende douchekop',
    href: '/beste-waterbesparende-douchekop/',
    icon: '/wp-content/uploads/2022/11/ph_bathtub-duotone.svg',
  },
];

export const heroParagraphs = [
  'Geniet jij ook van het inrichten van je thuis en vind je het leuk om te lezen over de nieuwste trends, de beste producten te ontdekken en te snuffelen tussen al die verschillende soorten decoratie? Dan ben je bij ons aan het juiste adres!',
  'Wij vergelijken producten voor in huis, bekijken wat er hip is in de wereld van de woninginrichting en houden jou overal van op de hoogte!',
];

export const ctaSections = {
  boekenkast: {
    title: 'Wat is onze top 10 open boekenkast?',
    paragraphs: [
      'Jaarlijks beoordelen wij veel verschillende producten voor de woninginrichting.',
      'Per test hebben we een top 10 samengesteld van het beste product in die categorie.',
      'Wat is er mooier dan een grote open boekenkast in je zitkamer waar je je lekker kan terugtrekken bij de open haard me een fijn boek? Er is weinig dat dit gevoel kan overtreffen vinden wij!',
      'Klik snel door voor onze top 10 open boekenkast!',
    ],
    image: '/wp-content/uploads/2022/11/Frame2.svg',
    imageAlt: 'Open boekenkast illustratie',
    reverse: false,
  },
  rooms: {
    title: 'De beste producten voor elke ruimte.',
    paragraphs: [
      'Ben je op zoek naar een heerlijk nieuw bed of ga je de woonkamer opnieuw decoreren? Of misschien wil je de tuin wel een metamorfose geven.',
      'Wat je ook van plan bent, op onze website vind je de mooiste aankopen voor elke ruimte in jouw huis.',
      'Nieuw beddengoed, een schilderij, vaasjes of een nieuwe eettafel.',
      'Bij ons vind je alles voor jouw woninginrichting.',
      'Ook houden we je op de hoogte van de laatste trends en geven we tips voor het inrichten van jouw huis.',
    ],
    image: '/wp-content/uploads/2022/11/Frame3.svg',
    imageAlt: 'Woonproducten voor elke ruimte',
    reverse: true,
  },
};
