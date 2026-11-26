/**
 * Minimal 3x5 bitmap pixel font (each string has 5 rows of 3 pixels: '1' = filled, '0' = empty).
 * Renders crisp integer-grid SVG paths so text inside pixel-art SVGs matches the exact pixel scale.
 */
const GLYPHS_3X5: Readonly<Record<string, readonly string[]>> = {
  A: ['010', '101', '111', '101', '101'],
  C: ['011', '100', '100', '100', '011'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  L: ['100', '100', '100', '100', '111'],
  M: ['101', '111', '111', '101', '101'],
  N: ['111', '101', '101', '101', '101'],
  O: ['010', '101', '101', '101', '010'],
  P: ['110', '101', '110', '100', '100'],
  R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'],
  T: ['111', '010', '010', '010', '010'],
  W: ['101', '101', '111', '111', '101'],
  Y: ['101', '101', '010', '010', '010'],
  ' ': ['00', '00', '00', '00', '00'],
};

export interface PixelTextLayout {
  readonly path: string;
  readonly width: number;
}

/** Converts an uppercase string into an SVG path on an integer pixel grid starting at (startX, startY). */
export function buildPixelTextPath(text: string, startX: number, startY: number): PixelTextLayout {
  const segments: string[] = [];
  let cursorX = startX;

  for (const ch of text.toUpperCase()) {
    const glyph = GLYPHS_3X5[ch] ?? GLYPHS_3X5[' '];
    const glyphWidth = glyph[0].length;
    for (let row = 0; row < glyph.length; row++) {
      const line = glyph[row];
      let col = 0;
      while (col < line.length) {
        if (line[col] === '1') {
          let run = 1;
          while (col + run < line.length && line[col + run] === '1') {
            run++;
          }
          segments.push(`M${cursorX + col} ${startY + row}h${run}v1h-${run}z`);
          col += run;
        } else {
          col++;
        }
      }
    }
    cursorX += glyphWidth + 1;
  }

  const width = Math.max(0, cursorX - startX - 1);
  return { path: segments.join(''), width };
}
