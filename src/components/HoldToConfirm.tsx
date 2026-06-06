import { useEffect, useRef, useState } from 'react';

interface HoldToConfirmProps {
  label: string;
  holdMs?: number;
  onConfirm(): void;
  className?: string;
}

/**
 * Parent-guard button: fires onConfirm only after an uninterrupted press of
 * holdMs (default 1500). Shows fill progress while holding.
 */
export default function HoldToConfirm({ label, holdMs = 1500, onConfirm, className = '' }: HoldToConfirmProps) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      onConfirm();
    }, holdMs);
  };
  const cancel = () => {
    setHolding(false);
    if (timer.current) clearTimeout(timer.current);
  };

  // A pending hold must die with the component — otherwise onConfirm (e.g. a
  // profile delete) could fire after unmount.
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <button
      type="button"
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onTouchStart={start}
      onTouchEnd={cancel}
      onTouchCancel={cancel}
      className={`relative overflow-hidden rounded-md border-b-[5px] border-b-red-800
        bg-red-500 px-5 py-2.5 font-body font-black text-white cursor-pointer ${className}`}
    >
      <span
        data-testid="hold-progress"
        className={`absolute inset-0 origin-left bg-red-800/50 ${holding ? 'scale-x-100' : 'scale-x-0'}`}
        style={{ transition: holding ? `transform ${holdMs}ms linear` : 'none' }}
      />
      <span className="relative">{label}</span>
    </button>
  );
}
