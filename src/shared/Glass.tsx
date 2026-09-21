import type { CSSProperties, ReactNode } from 'react';

/**
 * Sklo.
 *
 * Každý svět si ho obarví svými tokeny, ale fyzika zůstává stejná:
 * rozostří a dosytí to, co je pod ním (takže sklo lomí barvy scény),
 * má gradientový okraj, vnitřní odlesk při horní hraně a vlastní zrno.
 *
 * `--glass-tint`, `--glass-edge`, `--glass-sheen` a `--glass-blur` nastavuje svět.
 */
export function Glass({
  children,
  className = '',
  style,
  radius = 28,
  as: Tag = 'div',
  ...rest
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  radius?: number;
  as?: 'div' | 'button';
} & Record<string, unknown>) {
  return (
    <Tag
      className={`relative isolate overflow-hidden ${className}`}
      style={{
        borderRadius: radius,
        background: 'var(--glass-tint)',
        backdropFilter: 'blur(var(--glass-blur, 16px)) saturate(var(--glass-saturate, 1.7))',
        WebkitBackdropFilter: 'blur(var(--glass-blur, 16px)) saturate(var(--glass-saturate, 1.7))',
        boxShadow: 'var(--glass-shadow)',
        ...style,
      }}
      {...rest}
    >
      {/* Gradientový okraj — kreslený jako maskovaný rámeček, ne jako border. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: 'inherit',
          padding: 1.5,
          background: 'var(--glass-edge)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      {/* Vnitřní odlesk: světlo se opírá do horní hrany. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-2/5"
        style={{ background: 'var(--glass-sheen)', borderRadius: 'inherit' }}
      />
      {/*
        Obsah vyplňuje celé sklo. Kdyby byl jen `block`, zúžil by se na
        šířku textu a všechno, co se uvnitř polohuje absolutně (ciferník,
        podsvícení znaku), by se vztahovalo k té úzké šířce místo k celé
        ploše skla.
      */}
      <span className="relative z-10 flex h-full w-full items-center justify-center">{children}</span>
    </Tag>
  );
}
