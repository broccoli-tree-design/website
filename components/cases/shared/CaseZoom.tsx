import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/** A case's front item (no screenshot) or one of its steps */
export type CaseStep = {
  name: string;
  /** a module's key in MODULES */
  key?: string;
  color: string;
  fg: string;
  img?: string;
  w?: number;
  h?: number;
  /** next/image quality; must be listed in next.config's images.qualities */
  quality?: number;
  desc?: string;
};

/** The step open full size in CaseZoom */
export function useZoom() {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<CaseStep | null>(null);
  const open = (s: CaseStep) => {
    setStep(s);
    ref.current?.showModal();
  };
  return { ref, step, open, clear: () => setStep(null) };
}

/** Phones: one screen at full size, scrolled sideways. Closes itself when
 *  the window widens past the breakpoint */
export function CaseZoom({
  zoom,
  phone,
  noun,
  className,
}: {
  zoom: ReturnType<typeof useZoom>;
  phone: boolean;
  noun: string;
  className: string;
}) {
  const { ref, step, clear } = zoom;
  useEffect(() => {
    if (!phone) ref.current?.close();
  }, [phone, ref]);
  return (
    <dialog
      className={`case-zoom ${className}`}
      ref={ref}
      aria-label={step ? `${step.name} ${noun}, full size` : undefined}
      onClose={clear}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
    >
      <div className="case-zoom-bar">
        <span className="case-name">{step?.name}</span>
        <button
          type="button"
          className="case-zoom-close"
          onClick={() => ref.current?.close()}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      {step?.img && (
        <div className="case-zoom-scroll">
          <Image
            src={step.img}
            alt={`${step.name} ${noun}, full size`}
            width={step.w}
            height={step.h}
            quality={step.quality}
            sizes="1440px"
          />
        </div>
      )}
      <p className="case-zoom-desc">{step?.desc}</p>
    </dialog>
  );
}
