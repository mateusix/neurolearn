import styles from './luna-mascot.module.css';

/** Same character geometry as corpo-acenando.svg, with independently moving parts. */
export type LunaMood = 'wave' | 'celebrate' | 'support' | 'think' | 'calm';
export default function LunaMascot({gesture = 0, className = '', mood = 'wave'}: {gesture?: number; className?: string; mood?: LunaMood}) {
  return <svg key={`${gesture}:${mood}`} data-luna-mood={mood} className={`${styles.mascot} ${className}`} viewBox="0 0 400 400" width="260" height="260" aria-hidden="true" focusable="false">
    <ellipse className={styles.shadow} cx="200" cy="367" rx="87" ry="10" fill="#dceef4" />
    <g className={styles.body}>
      <path d="M172 301v43m56-43v43" stroke="#63bbcf" strokeWidth="22" strokeLinecap="round" />
      <rect x="143" y="337" width="45" height="25" rx="12" fill="#23617b" />
      <rect x="212" y="337" width="45" height="25" rx="12" fill="#23617b" />
      <rect x="151" y="211" width="98" height="102" rx="33" fill="#69c6d9" />
      <path d="M174 277q26 16 52 0" stroke="#52aec4" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M155 240q-36 10-38 39" stroke="#69c6d9" strokeWidth="20" strokeLinecap="round" fill="none" />
      <ellipse cx="116" cy="282" rx="15" ry="16" fill="#88d8e6" />
      <g className={styles.arm}>
        <path d="M245 240q55-7 49-64" stroke="#69c6d9" strokeWidth="20" strokeLinecap="round" fill="none" />
        <path d="M283 176v-18q0-6 5-6t5 6v-10q0-6 5-6t5 6v5q0-6 5-6t5 6v9q0-5 5-5t5 5v17q-1 20-20 20-17 0-20-23Z" fill="#88d8e6" />
      </g>
      <g className={styles.head}>
        <g transform="translate(56 6) scale(.72)">
          <rect x="75" y="75" width="250" height="250" rx="45" fill="#88d8e6" />
          <g className={styles.eyes}>
            <circle cx="150" cy="180" r="22" fill="#12181f" /><circle cx="157" cy="173" r="7" fill="white" />
            <circle cx="250" cy="180" r="22" fill="#12181f" /><circle cx="257" cy="173" r="7" fill="white" />
          </g>
          <path d="M130 145Q150 132 170 145M230 145Q250 132 270 145" fill="none" stroke="#12181f" strokeWidth="6" strokeLinecap="round" />
          <path d={mood === 'celebrate' ? 'M175 216Q200 252 225 216Z' : mood === 'think' ? 'M185 224Q200 231 215 224' : 'M175 220Q200 240 225 220'} fill={mood === 'celebrate' ? '#12181f' : 'none'} stroke="#12181f" strokeWidth="6" strokeLinecap="round" />
        </g>
      </g>
    </g>
  </svg>;
}
