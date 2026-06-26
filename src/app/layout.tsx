import type { ReactNode } from 'react'

/** Pass-through root — each route group owns its own <html>/<body> (site vs Payload admin). */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
