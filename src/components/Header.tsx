'use client'

interface HeaderProps {
  title: string
  right?: React.ReactNode
}

export default function Header({ title, right }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <h1 className="text-base font-semibold text-text">{title}</h1>
      {right && <div>{right}</div>}
    </header>
  )
}
