import { useRef, useState, type MouseEvent } from 'react'

export function useTransferLauncher() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const visibility = useRef(false)
  const opener = useRef<HTMLButtonElement | null>(null)
  function open(event: MouseEvent<HTMLButtonElement>) {
    opener.current = event.currentTarget
    visibility.current = true
    setHasSession(true)
    setIsOpen(true)
  }
  function close(retain = false) {
    visibility.current = false
    if (!retain) setHasSession(false)
    setIsOpen(false)
    requestAnimationFrame(() => {
      if (visibility.current) return
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
  return { isOpen, hasSession, open, close, discardHidden: () => { if (!visibility.current) setHasSession(false) } }
}
