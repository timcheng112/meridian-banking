import type { ComponentPropsWithRef } from 'react'
import './ui.css'

type SearchInputProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'aria-label'> & {
  'aria-label': string
}

export function SearchInput({ className, ...props }: SearchInputProps) {
  return <input {...props} type="search" className={`ui-search-input${className ? ` ${className}` : ''}`} />
}
