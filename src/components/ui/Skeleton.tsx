import './ui.css'

type SkeletonProps = {
  kind: 'line' | 'heading' | 'value'
  className?: string
}

export function Skeleton({ kind, className }: SkeletonProps) {
  return <div className={`ui-skeleton ui-skeleton-${kind}${className ? ` ${className}` : ''}`} aria-hidden="true" />
}
