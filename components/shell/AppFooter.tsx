import { GithubLogo } from '@phosphor-icons/react/dist/ssr'

export function AppFooter() {
  return (
    <footer className="pt-2 pb-4 flex flex-col items-center gap-3">
      <a
        href="https://github.com/phucbm/chiet-tu"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F0F0F]/8 text-[#0F0F0F] text-xs font-medium hover:bg-[#0F0F0F]/15 transition-colors"
      >
        <GithubLogo size={14} weight="fill" />
        GitHub
      </a>
      <p className="text-[10px] text-[#bbb]">chiết tự · open source &amp; free forever</p>
    </footer>
  )
}
