import { LogoMark } from "./Icons";

const LINKS = [
  { route: "home", label: "Home", href: "#/" },
  { route: "analyze", label: "Analyze", href: "#/analyze" },
  { route: "history", label: "History", href: "#/history" },
];

export default function Navbar({ route = "home" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#/" className="flex items-center gap-2.5" aria-label="SecureFile AI home">
          <LogoMark className="h-8 w-8 text-brand-600" />
          <span className="font-display text-lg font-bold tracking-tight text-ink-900">
            SecureFile <span className="text-brand-600">AI</span>
          </span>
        </a>

        <nav aria-label="Main" className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = route === link.route;
            return (
              <a
                key={link.route}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-sm font-bold transition-colors sm:px-4 sm:py-2 ${
                  active
                    ? "bg-brand-600 text-white shadow-soft"
                    : "text-ink-500 hover:bg-mist hover:text-ink-900"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="w-8" aria-hidden="true" />
      </div>
    </header>
  );
}
