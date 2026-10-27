export function formatStorage(gigabytes: number) {
  return gigabytes >= 1000
    ? `${(gigabytes / 1000).toFixed(gigabytes % 1000 === 0 ? 0 : 1)} TB`
    : `${Math.round(gigabytes)} GB`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}
