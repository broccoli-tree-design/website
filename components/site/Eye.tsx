/** The logo's almond eye, drawn in HTML so the pupil can move.
 *  EyeTracker.tsx drives every [data-eye] on the page; the parent sizes it
 *  (height = width / 2). */
export default function Eye() {
  return (
    <span className="eye" data-eye="">
      <span className="eye-white">
        <span className="eye-pupil" data-pupil="" />
      </span>
    </span>
  );
}
