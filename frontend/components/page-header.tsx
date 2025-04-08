interface PageHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function PageHeader({ title, subtitle, className = "" }: PageHeaderProps) {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-2 text-sm opacity-80">{subtitle}</p>}
    </div>
  )
}

