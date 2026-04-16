import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { label: 'Home',    href: '#hero' },
  { label: 'About',   href: '#about' },
  { label: 'Work',    href: '#work' },
  { label: 'Contact', href: '#contact' },
];

export default function SideNav() {
  const [active, setActive] = useState('Home');

  useEffect(() => {
    const onAboutActiveChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ active?: boolean }>;
      setActive(customEvent.detail?.active ? 'About' : 'Home');
    };

    window.addEventListener('treezoom:about-active', onAboutActiveChange);
    return () => {
      window.removeEventListener('treezoom:about-active', onAboutActiveChange);
    };
  }, []);

  return (
    <nav
      aria-label="Side navigation"
      className="
        fixed left-6 top-1/2 z-50 -translate-y-1/2
        flex flex-col items-start gap-5
      "
    >
      {/* thin vertical rail */}
      <div className="absolute left-0 top-0 h-full w-px bg-neutral-300" />

      {NAV_ITEMS.map(({ label, href }) => {
        const isActive = active === label;
        return (
          <a
            key={label}
            href={href}
            onClick={(event) => {
              if (label === 'About') {
                event.preventDefault();
                setActive('About');
                window.dispatchEvent(new CustomEvent('treezoom:go-about'));
                return;
              }
              if (label === 'Home') {
                event.preventDefault();
                setActive('Home');
                window.dispatchEvent(new CustomEvent('treezoom:go-home'));
                return;
              }
              setActive(label);
            }}
            className={`
              group relative flex items-center gap-2 pl-4
              text-[10px] font-light uppercase tracking-[0.18em]
              transition-all duration-300
              ${isActive
                ? 'text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-600'}
            `}
          >
            {/* tick mark on the rail */}
            <span
              className={`
                absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-300
                ${isActive
                  ? 'h-px w-3 bg-neutral-900'
                  : 'h-px w-1.5 bg-neutral-300 group-hover:w-2.5 group-hover:bg-neutral-500'}
              `}
            />
            {label}
          </a>
        );
      })}
    </nav>
  );
}
