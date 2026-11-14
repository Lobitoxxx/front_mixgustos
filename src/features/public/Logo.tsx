//! Brand mark: a flame-in-plate monogram evoking the mixgustos kitchen.

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M14 2 L24 12 L14 26 L4 12 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M14 8 L19.5 13.5 L14 20 L8.5 13.5 Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}
