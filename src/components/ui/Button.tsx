import type { ComponentPropsWithRef } from 'react'
import './ui.css'

type ButtonProps = Omit<ComponentPropsWithRef<'button'>, 'type'> & {
  type: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return <button {...props} className={`ui-button ui-button-${variant}${className ? ` ${className}` : ''}`} />
}
