"use client"

import { useEffect, useRef, useState } from 'react'
import { ExternalLink, GitPullRequest, TriangleAlert } from 'lucide-react'
import { useBottomSheet } from '@/components/shell/BottomSheet'
import { contributeChar, getPRListUrl, prTitle } from '@/lib/github'
import { charChangeSummary } from '@/lib/utils'
import type { CharEntry } from '@/lib/types'

const inputCls =
  'w-full px-3 py-2.5 border border-[#E0E0DC] rounded-xl bg-white text-[#0F0F0F] placeholder-[#AAA] focus:border-[#0F0F0F] transition-colors outline-none text-sm'

const NICKNAME_KEY = 'chiettu_nickname'

interface Props {
  char: CharEntry
  repoOriginal?: CharEntry | null
}

export function ContributeSheet({ char, repoOriginal }: Props) {
  const { close, setFooter } = useBottomSheet()

  const isCopy = !!char.copiedFrom && !char.copiedFrom.startsWith('gen:')
  const diff = isCopy && repoOriginal ? charChangeSummary(char, repoOriginal) : null
  const isIdentical = isCopy && diff !== null && diff.changedFields === 0

  const [mode, setMode] = useState<'new' | 'edit'>('new')
  const [nickname, setNickname] = useState(() => {
    try { return localStorage.getItem(NICKNAME_KEY) ?? '' } catch { return '' }
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [prUrl, setPrUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const trimmed = nickname.trim()
  const tooShort = trimmed.length > 0 && trimmed.length < 2
  const canSubmit = trimmed.length >= 2 && status !== 'loading' && !isIdentical

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
      const url = await contributeChar(char, trimmed, mode)
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
            <ExternalLink size={14} />
            Xem PR trên GitHub
          </a>
          <button onClick={close} className="w-full py-2 text-sm text-[#AAA] hover:text-[#555] transition-colors">
            Đóng
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
          <GitPullRequest size={15} />
          Gửi đóng góp
        </button>
      )
    } else {
      setFooter(null)
    }
  }, [status, prUrl, canSubmit])

  if (status === 'success') {
    return (
      <div className="px-5 pb-4 py-8 text-center space-y-2">
        <p className="text-5xl">{char.char}</p>
        <p className="text-sm font-semibold text-[#0F0F0F]">PR đã tạo!</p>
        <p className="text-xs text-[#888]">Đóng góp của bạn đang chờ xét duyệt. Cảm ơn!</p>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="px-5 pb-4 py-8 text-center">
        <p className="text-sm text-[#888]">Đang tạo PR…</p>
      </div>
    )
  }

  return (
    <div className="px-5 pb-4 space-y-4">
      <p className="text-xs text-[#888] leading-relaxed">
        Tạo Pull Request để đóng góp dữ liệu cho <span className="font-medium text-[#0F0F0F]">{char.char}</span>.
        Sau khi được duyệt, sẽ xuất hiện trong từ điển cộng đồng.
      </p>

      {/* Diff status */}
      {isCopy && diff !== null && (
        <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs ${
          diff.changedFields > 0
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-[#F0F0EC] border border-[#E0E0DC] text-[#888]'
        }`}>
          <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${diff.changedFields > 0 ? 'bg-green-500' : 'bg-[#CCC]'}`} />
          {diff.changedFields === 0
            ? 'Giống hệt bản cộng đồng — không có thay đổi để đóng góp.'
            : `${diff.changedFields} trường đã thay đổi: ${diff.fieldNames.join(', ')}.`}
        </div>
      )}

      {/* Mode selector */}
      <div className={`space-y-1.5 ${isIdentical ? 'pointer-events-none opacity-40' : ''}`}>
        <p className="text-xs font-medium text-[#888]">Đóng góp dưới dạng</p>
        <div className="space-y-2">
          <label className={`flex items-start gap-3 px-3 py-3 rounded-xl border transition-colors cursor-pointer ${
            mode === 'new' ? 'border-[#0F0F0F] bg-[#F8F7F5]' : 'border-[#E0E0DC] bg-white'
          }`}>
            <input
              type="radio"
              name="contribute-mode"
              value="new"
              checked={mode === 'new'}
              onChange={() => setMode('new')}
              disabled={isIdentical}
              className="mt-0.5 accent-[#0F0F0F]"
            />
            <div>
              <p className="text-sm font-medium text-[#0F0F0F]">Chữ mới</p>
              <p className="text-[11px] text-[#888] mt-0.5">Thêm như một entry mới trong từ điển.</p>
            </div>
          </label>

          {isCopy && (
            <label className={`flex items-start gap-3 px-3 py-3 rounded-xl border transition-colors cursor-pointer ${
              mode === 'edit' ? 'border-[#0F0F0F] bg-[#F8F7F5]' : 'border-[#E0E0DC] bg-white'
            }`}>
              <input
                type="radio"
                name="contribute-mode"
                value="edit"
                checked={mode === 'edit'}
                onChange={() => setMode('edit')}
                disabled={isIdentical}
                className="mt-0.5 accent-[#0F0F0F]"
              />
              <div>
                <p className="text-sm font-medium text-[#0F0F0F]">Đề xuất chỉnh sửa</p>
                <p className="text-[11px] text-[#888] mt-0.5">Sửa entry gốc trong từ điển cộng đồng.</p>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* PR preview */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-[#888]">PR title</span>
        <p className="text-xs text-[#0F0F0F] bg-[#F0F0EC] rounded-xl px-3 py-2.5 font-mono leading-snug">
          {prTitle(char.char, trimmed || '…', mode)}
        </p>
      </div>

      {/* Nickname */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#888]">Nickname</label>
        <input
          className={inputCls}
          placeholder="e.g. phucbm"
          value={nickname}
          onChange={e => handleNicknameChange(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
        />
        {tooShort && <p className="text-[11px] text-red-500">Cần ít nhất 2 ký tự.</p>}
        <p className="text-[11px] text-[#AAA] leading-relaxed">
          Hiển thị trong tiêu đề PR. Công khai trên{' '}
          <a href={getPRListUrl()} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[#888]">
            GitHub
          </a>
          .
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          <TriangleAlert size={12} className="shrink-0 mt-0.5" />
          <span className="break-all">{error}</span>
        </div>
      )}
    </div>
  )
}
