import type { ComponentPropsWithRef } from 'react'
import './ui.css'

type ButtonProps = Omit<ComponentPropsWithRef<'button'>, 'type'> & {
  type: 'button' | 'submit' | 'reset'
}

export function Button({ className, ...props }: ButtonProps) {
  return <button {...props} className={`ui-button${className ? ` ${className}` : ''}`} />
}
