import { Icon, type IconName } from '../ui'

/*
 * The mockup's three lines read END-TO-END ENCRYPTION / INSTANT SYNC ACROSS
 * DEVICES / OFFLINE FIRST ARCHITECTURE. None of the three is being built, and a
 * sign-in page that claims encryption it does not have is the same placeholder
 * marketing copy the first attempt at this project was rejected for. These are
 * things the app does.
 */
const FEATURES = [
  { icon: 'lock', label: 'Private to your account' },
  { icon: 'draw', label: 'Rich text editing' },
  { icon: 'dark_mode', label: 'Light and dark themes' },
] as const satisfies readonly { icon: IconName; label: string }[]

export function AuthBrandPanel() {
  return (
    <section className="hidden w-1/2 flex-col justify-between p-margin-page lg:flex">
      <p className="text-headline-md text-primary">Aether Notes</p>

      <div className="max-w-[500px]">
        {/* Styled as the largest text on the page but not a heading: the page is
            a sign-in form, and the heading it announces should be the form's. */}
        <p className="mb-stack-md text-headline-xl text-primary">
          Capture ideas before they disappear.
        </p>

        <ul className="space-y-stack-sm">
          {FEATURES.map((feature) => (
            <li className="flex items-center gap-3 text-on-surface-variant" key={feature.label}>
              <Icon className="text-primary" name={feature.icon} />
              <span className="text-label-sm uppercase">{feature.label}</span>
            </li>
          ))}
        </ul>

        {/* The mockup blends these with `mix-blend-multiply`, which darkens
            towards the backdrop and leaves all three invisible on the dark
            palette. Flat opacity holds in both. */}
        <div aria-hidden="true" className="relative mt-12 h-64">
          <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-primary opacity-10" />
          <div className="absolute top-10 left-20 h-48 w-48 rotate-12 border border-accent-gold opacity-40 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
          <div className="absolute right-10 bottom-0 h-24 w-24 bg-secondary-fixed opacity-30" />
        </div>
      </div>

      <p className="font-mono text-label-caps text-muted-green">CRAFTED FOR FOCUS</p>
    </section>
  )
}
