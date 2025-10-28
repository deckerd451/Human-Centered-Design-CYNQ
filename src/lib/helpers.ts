import { formatDistanceToNow } from 'date-fns';
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};
export const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Invalid date string:", isoString);
    return "a while ago";
  }
};