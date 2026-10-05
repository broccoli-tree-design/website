/** Phone connector, in px of the 90px-tall SVG under a stacked case frame
 *  (y = 0 is the frame's bottom edge): from the bottom-most card's or row's
 *  bottom border, `from` of the way across, down to the result label's left
 *  edge at `ex`. */
export function phoneFlow(w: number, ex: number, from = 0.5) {
  const x = (w * from).toFixed(1);
  const e = ex.toFixed(1);
  return `M ${x} 0 C ${x} 50, ${e} 40, ${e} 90`;
}
