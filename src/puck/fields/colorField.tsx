import type { CustomField } from '@puckeditor/core'

const SWATCHES = [
  '#0f172a',
  '#ffffff',
  '#f8fafc',
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#dc2626',
  '#ea580c',
  '#16a34a',
  '#0d9488',
  'transparent',
]

/** Custom Puck field: hex color picker + swatches, for leigos ajustarem cores sem digitar código. */
export function colorField(label: string): CustomField<string> {
  return {
    type: 'custom',
    label,
    render: ({ value, onChange }) => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value && value !== 'transparent' ? value : '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-10 cursor-pointer rounded-md border border-[var(--vb-border)] bg-transparent p-0.5"
            aria-label={label}
          />
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#ffffff"
            className="h-9 w-full rounded-md border border-[var(--vb-border)] bg-[var(--vb-surface-1)] px-2 text-xs text-[var(--vb-text)] outline-none focus:border-[var(--vb-accent)]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              title={swatch}
              onClick={() => onChange(swatch)}
              className="h-6 w-6 rounded-full border border-[var(--vb-border)] shadow-sm transition-transform hover:scale-110"
              style={{
                background:
                  swatch === 'transparent'
                    ? 'repeating-conic-gradient(#cbd5e1 0% 25%, transparent 0% 50%) 50% / 8px 8px'
                    : swatch,
              }}
            />
          ))}
        </div>
      </div>
    ),
  }
}
