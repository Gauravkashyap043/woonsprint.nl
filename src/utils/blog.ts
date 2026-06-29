export function formatDutchDate(date: Date): string {
  const months = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getBlogPostUrl(slug: string): string {
  return `/${slug}/`;
}

export function getFeaturedImage(featuredImage?: string): string {
  return featuredImage || '/wp-content/uploads/2022/11/Frame1.svg';
}
