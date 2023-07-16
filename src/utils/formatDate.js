export const formatDate = ts => new Date(ts).toLocaleString('en-US', {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
});