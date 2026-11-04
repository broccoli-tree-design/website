/** Runs `fn` on the next animation frame, however many times the returned
 *  function is called before then. `.cancel()` drops a pending run. */
export function frameThrottle(fn: () => void) {
  let raf = 0;
  const schedule = () => {
    if (!raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        fn();
      });
  };
  schedule.cancel = () => cancelAnimationFrame(raf);
  return schedule;
}
