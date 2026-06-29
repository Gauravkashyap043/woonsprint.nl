export interface FooterColumn {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}

export const footerInfoLinks = [
  { label: 'Home', href: '/' },
  { label: 'Over ons', href: '/over-ons/' },
  { label: 'Black Friday Deals', href: '/black-friday-deals/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Contact', href: '/contact/' },
];

export const footerColumns: FooterColumn[] = [
  {
    title: 'Veiligheid',
    links: [
      { label: 'Co2 meter', href: '/beste-co2-meter/' },
      { label: 'Rookmelder', href: '/beste-rookmelder/' },
      { label: 'Radiatorombouw', href: '/beste-radiatorombouw/' },
      { label: 'Beveiligingscamera buiten', href: '/beste-beveiligingscamera-buiten/' },
      { label: 'Buitenlamp met bewegingssensor', href: '/beste-buitenlamp-met-bewegingssensor/' },
      {
        label: 'Buitenlamp met dag en nacht sensor',
        href: '/beste-buitenlamp-met-dag-en-nacht-sensor/',
      },
    ],
  },
  {
    title: 'Slaapkamer',
    links: [
      { label: 'Dressboy', href: '/beste-dressboy/' },
      { label: 'Elektrische bovendeken', href: '/beste-elektrische-bovendeken/' },
      { label: 'Kledingkast met spiegel', href: '/beste-kledingkast-met-spiegel/' },
      { label: 'Kledingkast kinderkamer', href: '/beste-kledingkast-kinderkamer/' },
      { label: 'Flanellen dekbedovertrek', href: '/beste-flanellen-dekbedovertrek/' },
      { label: 'Kledingkast met schuifdeuren', href: '/beste-kledingkast-met-schuifdeuren/' },
    ],
  },
  {
    title: 'Inrichting',
    links: [
      { label: 'Hangstoel', href: '/beste-hangstoel/' },
      { label: 'Boekenkast', href: '/beste-boekenkast/' },
      { label: 'Kruimeldief', href: '/beste-kruimeldief/' },
      { label: 'Deurstopper', href: '/beste-deurstopper/' },
      { label: 'Kroonluchter', href: '/beste-kroonluchter/' },
      { label: 'Mini naaimachine', href: '/beste-mini-naaimachine/' },
    ],
  },
];

export const footerDescription =
  'Nieuw beddengoed, een schilderij, vaasjes of een nieuwe eettafel. Bij ons vind je alles voor jouw woninginrichting. Ook houden we je op de hoogte van de laatste trends en geven we tips voor het inrichten van jouw huis.';

export const socialLinks = [
  { label: 'Facebook', href: '#', icon: 'facebook' },
  { label: 'Instagram', href: '#', icon: 'instagram' },
  { label: 'Twitter', href: '#', icon: 'twitter' },
  { label: 'YouTube', href: '#', icon: 'youtube' },
];
