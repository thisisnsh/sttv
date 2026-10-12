const paths = {
  'arrow-up-right': '<path d="M3 21 21 3M7 3h14v14"/>',
  'arrow-down-left': '<path d="M21 3 3 21M17 21H3V7"/>',
  'arrow-down': '<path d="M12 3v18m-7-7 7 7 7-7"/>',
  'arrow-up': '<path d="M12 21V3m-7 7 7-7 7 7"/>',
  'arrow-left': '<path d="M21 12H3m7-7-7 7 7 7"/>',
  play: '<path d="m7 4 14 8-14 8Z"/>',
  pause: '<path d="M8 4v16M16 4v16"/>',
  plus: '<path d="M12 3v18M3 12h18"/>',
  close: '<path d="m5 5 14 14M5 19 19 5"/>',
  asterisk: '<path d="M30 2h4l-1 28 19-21 3 3-21 19 28-1v4l-28-1 21 19-3 3-19-21 1 28h-4l1-28-19 21-3-3 21-19-28 1v-4l28 1-21-19 3-3 19 21Z"/>'
};

export function icon(name) {
  if (!paths[name]) throw new Error(`Unknown icon: ${name}`);
  const viewBox = name === 'asterisk' ? '0 0 64 64' : '0 0 24 24';
  return `<svg class="icon icon-${name}" viewBox="${viewBox}" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${paths[name]}</svg>`;
}
