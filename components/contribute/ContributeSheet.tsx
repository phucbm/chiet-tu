"use client"

import { useEffect, useRef, useState } from 'react'
import { useBottomSheet } from '@/components/shell/BottomSheet'
import { contributeChar, getPRListUrl } from '@/lib/github'
import { ArrowSquareOut, GitPullRequest, Warning } from '@phosphor-icons/react'
import type { CharEntry } from '@/lib/types'

const inputCls =
  'w-full px-3 py-2.5 border border-[#E0E0DC] rounded-xl bg-white text-[#0F0F0F] placeholder-[#AAA] focus:border-[#0F0F0F] transition-colors outline-none text-sm'

const textareaCls = inputCls + ' resize-none min-h-[80px]'

const NICKNAME_KEY = 'chietu_nickname'

interface Props {
  char: string
  existing?: CharEntry
}

export function ContributeSheet({ char, existing }: Props) {
  const { close, setFooter } = useBottomSheet()
  const mode = existing ? 'edit' : 'new'

  const [pinyin, setPinyin] = useState(existing?.pinyin ?? '')
  const [sinoViet, setSinoViet] = useState(existing?.sino_vietnamese ?? '')
  const [etymVi, setEtymVi] = useState(existing?.etymology.vi ?? '')
  const [etymEn, setEtymEn] = useState(existing?.etymology.en ?? '')
  const [components, setComponents] = useState(existing?.components.join(', ') ?? '')
  const [radical, setRadical] = useState(existing?.radical ?? '')
  const [sources, setSources] = useState(existing?.sources.join(', ') ?? '')
  const [nickname, setNickname] = useState(() => {
    try { return localStorage.getItem(NICKNAME_KEY) ?? '' } catch { return '' }
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [prUrl, setPrUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const trimmed = nickname.trim()
  const canSubmit = trimmed.length >= 2 && etymVi.trim().length > 0 && status !== 'loading'

  function handleNicknameChange(v: string) {
    setNickname(v)
    try { localStorage.setItem(NICKNAME_KEY, v) } catch {}
  }

  const submitRef = useRef(async () => {})

  submitRef.current = async () => {
    if (!canSubmit) return
    setStatus('loading')
    setError(null)
    try {
      const entry: Partial<CharEntry> = {
        char,
        pinyin: pinyin.trim(),
        sino_vietnamese: sinoViet.trim(),
        etymology: { vi: etymVi.trim(), en: etymEn.trim() },
        components: components.split(',').map(s => s.trim()).filter(Boolean),
        radical: radical.trim(),
        strokes: existing?.strokes ?? 0,
        tags: existing?.tags ?? [],
        notes: existing?.notes ?? '',
        sources: sources.split(',').map(s => s.trim()).filter(Boolean),
      }
      const url = await contributeChar(entry, trimmed, mode)
      setPrUrl(url)
      setStatus('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PR creation failed')
      setStatus('error')
    }
  }

  useEffect(() => {
    if (status === 'success' && prUrl) {
      setFooter(
        <div className="space-y-2">
          <a
            href={prUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 bg-[#0F0F0F] rounded-xl text-sm font-semibold text-white hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
          >
            <ArrowSquareOut size={14} />
            View PR on GitHub
          </a>
          <button onClick={close} className="w-full py-2 text-sm text-[#AAA] hover:text-[#555] transition-colors">
            Done
          </button>
        </div>
      )
    } else if (status !== 'loading') {
      setFooter(
        <button
          onClick={() => submitRef.current()}
          disabled={!canSubmit}
          className="w-full py-3.5 bg-[#0F0F0F] rounded-xl text-sm font-semibold text-white disabled:opacity-40 hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
        >
          <GitPullRequest size={15} weight="fill" />
          {mode === 'edit' ? 'Propose edits' : 'Send contribution'}
        </button>
      )
    } else {
      setFooter(null)
    }
  }, [status, prUrl, canSubmit, mode])

  if (status === 'success') {
    return (
      <div className="px-5 pb-4 py-6 text-center space-y-2">
        <p className="text-2xl">{char}</p>
        <p className="text-sm font-semibold text-[#0F0F0F]">PR created!</p>
        <p className="text-xs text-[#888]">Your contribution is under review. Thank you!</p>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="px-5 pb-4 py-8 text-center">
        <p className="text-sm text-[#888]">Creating PR…</p>
      </div>
    )
  }

  return (
    <div className="px-5 pb-4 space-y-4">
      <p className="text-xs text-[#888] leading-relaxed">
        {mode === 'new'
          ? `Create a Pull Request to add etymology for ${char}. Once merged, it appears on the site.`
          : `Propose edits for ${char}. Your changes will be reviewed before merging.`}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#888]">Pinyin</label>
          <input className={inputCls} placeholder="zhōng" value={pinyin} onChange={e => setPinyin(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#888]">Hán Việt</label>
          <input className={inputCls} placeholder="trung" value={sinoViet} onChange={e => setSinoViet(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[#888]">Etymology (Tiếng Việt) *</label>
        <textarea className={textareaCls} placeholder="Giải thích nguồn gốc..." value={etymVi} onChange={e => setEtymVi(e.target.value)} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[#888]">Etymology (English)</label>
        <textarea className={textareaCls} placeholder="Etymology explanation..." value={etymEn} onChange={e => setEtymEn(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#888]">Components (comma-sep)</label>
          <input className={inputCls} placeholder="口, 丨" value={components} onChange={e => setComponents(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#888]">Radical</label>
          <input className={inputCls} placeholder="丨" value={radical} onChange={e => setRadical(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[#888]">Sources (comma-sep)</label>
        <input className={inputCls} placeholder="chiettu-book, outlier-linguistics" value={sources} onChange={e => setSources(e.target.value)} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[#888]">Nickname *</label>
        <input
          className={inputCls}
          placeholder="e.g. phucbm"
          value={nickname}
          onChange={e => handleNicknameChange(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
        />
        <p className="text-[11px] text-[#AAA]">
          Shows in the PR title. Public on{' '}
          <a href={getPRListUrl()} target="_blank" rel="noreferrer" className="underline underline-offset-2">GitHub</a>.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          <Warning size={12} className="shrink-0 mt-0.5" />
          <span className="break-all">{error}</span>
        </div>
      )}
    </div>
  )
}
