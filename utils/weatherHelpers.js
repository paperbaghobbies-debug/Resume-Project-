export function formatTemperature(temp) {
  if (temp === null || temp === undefined || isNaN(temp)) {
    return 0;
  }
  return Math.round(temp);
}