import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 16, children, ...props }: IconProps & { children: ReactNode }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>
}

export const SendIcon = (p: IconProps) => <Icon {...p}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></Icon>
export const PlusIcon = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>
export const TrashIcon = (p: IconProps) => <Icon {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/></Icon>
export const CopyIcon = (p: IconProps) => <Icon {...p}><rect x="9" y="9" width="10" height="10" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>
export const SunIcon = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></Icon>
export const MoonIcon = (p: IconProps) => <Icon {...p}><path d="M20.4 15.4A8 8 0 0 1 8.6 3.6 8.9 8.9 0 1 0 20.4 15.4Z"/></Icon>
export const HistoryIcon = (p: IconProps) => <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></Icon>
export const XIcon = (p: IconProps) => <Icon {...p}><path d="m6 6 12 12M18 6 6 18"/></Icon>
export const ChevronIcon = (p: IconProps) => <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>
export const SearchIcon = (p: IconProps) => <Icon {...p}><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></Icon>
export const CheckIcon = (p: IconProps) => <Icon {...p}><path d="m5 12 4 4L19 6"/></Icon>
export const CopyCheckIcon = (p: IconProps) => <Icon {...p}><path d="M9 9h10v10H9zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1M13 14l2 2 4-4"/></Icon>
