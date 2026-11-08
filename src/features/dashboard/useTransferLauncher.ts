import { useRef, useState, type MouseEvent } from 'react'

export function useTransferLauncher() {
  const [isOpen, setIsOpen] = useState(false)
  const opener = useRef<HTMLButtonElement | null>(null)
  function open(event: MouseEvent<HTMLButtonElement>) {
    opener.current = event.currentTarget
    setIsOpen(true)
  }
  function close() {
    setIsOpen(false)
    requestAnimationFrame(() => {
      const isVisible = (element: HTMLElement) => element.getClientRects().length > 0
      const counterpart = Array.from(document.querySelectorAll<HTMLButtonElement>('.transfer-button')).find(isVisible)
      const target = opener.current && isVisible(opener.current) ? opener.current : counterpart
      if (target) target.focus()
      else {
        const heading = document.querySelector<HTMLElement>('.dashboard-greeting h1')
        if (heading) { heading.tabIndex = -1; heading.focus() }
      }
    })
  }
  return { isOpen, open, close }
}
