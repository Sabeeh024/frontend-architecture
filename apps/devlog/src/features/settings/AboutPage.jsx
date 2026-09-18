import { useT } from '../../shared/i18n/t'

export function AboutPage() {
  const t = useT()
  return (
    <div className="card">
      <p>{t('about.body')}</p>
      <p className="muted">{t('about.note')}</p>
    </div>
  )
}
