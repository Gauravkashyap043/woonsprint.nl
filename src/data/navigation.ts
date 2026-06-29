export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const mainNavigation: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Inrichting',
    href: '/inrichting/',
    children: [
      { label: 'Poef', href: '/beste-poef/' },
      { label: 'Zitzak', href: '/beste-zitzak/' },
      { label: 'Bartafel', href: '/beste-bartafel/' },
      { label: 'Platenspeler', href: '/beste-platenspeler/' },
      { label: 'Schommelstoel', href: '/beste-schommelstoel/' },
      { label: 'Rotan bijzettafel', href: '/beste-rotan-bijzettafel/' },
      { label: 'Open boekenkast', href: '/beste-open-boekenkast/' },
      { label: 'Zitzak volwassenen', href: '/beste-zitzak-volwassenen/' },
      { label: 'Boomstam bijzettafel', href: '/beste-boomstam-bijzettafel/' },
      { label: 'Slowcooker met timer', href: '/beste-slowcooker-met-timer/' },
    ],
  },
  {
    label: 'Slaapkamer',
    href: '/slaapkamer/',
    children: [
      { label: 'Matras 90×200', href: '/beste-matras-90x200/' },
      { label: 'Donzen dekbed', href: '/beste-donzen-dekbed/' },
      { label: 'Matras 140×200', href: '/beste-matras-140x200/' },
      { label: 'Stille mobiele airco', href: '/beste-stille-mobiele-airco/' },
      { label: 'Boxspring met tv lift', href: '/beste-boxspring-met-tv-lift/' },
      { label: 'Slaapbank 1 persoons', href: '/beste-slaapbank-1-persoons/' },
      { label: 'Slaapbank 2 persoons', href: '/beste-slaapbank-2-persoons/' },
      { label: 'Stoomreiniger kleding', href: '/beste-stoomreiniger-kleding/' },
      { label: 'Prullenbak met sensor', href: '/beste-prullenbak-met-sensor/' },
      { label: 'Boxspring met opbergruimte', href: '/beste-boxspring-met-opbergruimte/' },
    ],
  },
  {
    label: 'Badkamer',
    href: '/badkamer/',
    children: [
      { label: 'Droger', href: '/beste-droger/' },
      { label: 'Mini wasmachine', href: '/beste-mini-wasmachine/' },
      { label: 'Droogrek trapgat', href: '/beste-droogrek-trapgat/' },
      { label: 'Stoomreiniger vloer', href: '/beste-stoomreiniger-vloer/' },
      { label: 'Bovenlader wasmachine', href: '/beste-bovenlader-wasmachine/' },
      { label: 'Wasmachine en droger in 1', href: '/beste-wasmachine-en-droger-in-1/' },
      { label: 'Waterbesparende regendouche', href: '/beste-waterbesparende-regendouche/' },
      { label: 'Strijkplank voor stoomstrijkijzer', href: '/beste-strijkplank-voor-stoomstrijkijzer/' },
      { label: 'Infrarood verwarming badkamer', href: '/beste-infrarood-verwarming-badkamer/' },
      { label: 'Robotstofzuiger met dweilfunctie', href: '/beste-robotstofzuiger-met-dweilfunctie/' },
    ],
  },
  { label: 'Over ons', href: '/over-ons/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Contact', href: '/contact/' },
];

export const siteMeta = {
  name: 'Woonsprint.nl',
  title: 'Woonsprint.nl voor inspiratie voor jouw droomhuis.',
  description:
    'Ben je op zoek naar een nieuwe inrichting voor jouw huis? Zoek dan niet verder en ren snel naar woonsprint.nl',
  url: 'https://woonsprint.nl',
};
