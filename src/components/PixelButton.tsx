import type { ButtonHTMLAttributes } from 'react';
import { playSound } from '../features/audio/sounds';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'grass' | 'stone' | 'danger';
}

const VARIANTS = {
  grass: 'bg-grass border-b-grass-dark text-white',
  stone: 'bg-stone border-b-night text-white',
  danger: 'bg-red-500 border-b-red-800 text-white',
};

export default function PixelButton({ variant = 'grass', className = '', onClick, ...rest }: PixelButtonProps) {
  return (
    <button
      {...rest}
      onClick={(e) => {
        playSound('pop');
        onClick?.(e);
      }}
      className={`rounded-md border-b-[5px] px-5 py-2.5 font-body font-black
        transition active:translate-y-0.5 active:border-b-2 disabled:opacity-40
        disabled:active:translate-y-0 cursor-pointer ${VARIANTS[variant]} ${className}`}
    />
  );
}
