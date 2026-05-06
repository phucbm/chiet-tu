"use client"

import {useEffect, useRef, useState} from 'react'
import {ArrowLeft} from 'lucide-react'
import {useRouter} from 'next/navigation'
import {useToolBarSlot} from '@/components/shell/ToolBarSlot'
import {useBottomSheet} from '@/components/shell/BottomSheet'
import {ContributeSheet} from '@/components/contribute/ContributeSheet'
import {useCharStore} from '@/store/useCharStore'
import type {CharEntry, EtymologyComponent, Sentence} from '@/lib/types'
import {useCharHistory} from "@/hooks/useCharHistory"
import {useHeaderSlot} from "@/components/shell/HeaderSlot"
import {Dot} from "lucide-react"
import {StrokeBox} from "@/components/word/StrokeBox"
import {CharLink} from './_components/CharLink'
import {ClonePrompt} from './_components/ClonePrompt'
import {NewCharPrompt} from './_components/NewCharPrompt'
import {DangerZone} from './_components/DangerZone'
import {MeaningSection} from './_components/MeaningSection'
import {EtymologySection} from './_components/EtymologySection'
import {ComponentsSection} from './_components/ComponentsSection'
import {RelatedSection} from './_components/RelatedSection'

const RAW_BASE = 'https://raw.githubusercontent.com/phucbm/chiet-tu/main'

interface Props {
    char: string
    initialData: CharEntry
    knownLinkedChars: Set<string>
}

export function CharPageClient({ char, initialData, knownLinkedChars }: Props) {
    const router = useRouter()
    const { open, closeAll } = useBottomSheet()
    const { findLocal, cloneFromRepo, cloneFromGen, addChar, updateChar, deleteChar } = useCharStore()
    const { addView } = useCharHistory()

    const localChar = findLocal(char)
    const curated = initialData.source === 'repo' ? initialData : null
    const entry = localChar ?? initialData
    const isLocal = !!localChar

    // ── Edit field state ──────────────────────────────────────────────────
    const [activeSection, setActiveSection] = useState<string | null>(null)
    const [vi, setVi] = useState('')
    const [pinyinVal, setPinyinVal] = useState('')
    const [sinoViet, setSinoViet] = useState('')
    const [trad, setTrad] = useState('')
    const [radical, setRadical] = useState('')
    const [note, setNote] = useState('')
    const [components, setComponents] = useState<EtymologyComponent[]>([])
    const [sentences, setSentences] = useState<Sentence[]>([])
    const [related, setRelated] = useState<string[]>([])
    const [resetting, setResetting] = useState(false)
    const initialized = useRef(false)

    // Sync from localChar — only when char identity changes (createdAt is stable unique ID)
    useEffect(() => {
        if (!localChar) { initialized.current = false; return }
        initialized.current = false
        setVi(localChar.vi ?? '')
        setPinyinVal(localChar.pinyin)
        setSinoViet(localChar.sino_vietnamese)
        setTrad(localChar.trad ?? '')
        setRadical(localChar.radical ?? '')
        setNote(localChar.etymology.note)
        setComponents(localChar.etymology.components)
        setSentences(localChar.sentences ?? [])
        setRelated(localChar.etymology.related)
        requestAnimationFrame(() => { initialized.current = true })
    }, [localChar?.char, localChar?.createdAt])

    // Auto-save debounced — skips during init to avoid write-back loop
    useEffect(() => {
        if (!localChar || !initialized.current) return
        const t = setTimeout(() => {
            updateChar(localChar.char, {
                vi: vi.trim() || undefined,
                pinyin: pinyinVal.trim(),
                sino_vietnamese: sinoViet.trim(),
                trad: trad.trim() || undefined,
                radical: radical.trim() || undefined,
                etymology: { note: note.trim(), components, related },
                sentences: sentences.filter(s => s.zh.trim()),
            })
        }, 500)
        return () => clearTimeout(t)
    }, [vi, pinyinVal, sinoViet, trad, radical, note, components, sentences, related])

    useEffect(() => { addView(entry) }, [char])

    // ── Actions ───────────────────────────────────────────────────────────

    function toggle(id: string) {
        if (!isLocal) return
        setActiveSection(prev => prev === id ? null : id)
    }

    async function handleReset() {
        if (!localChar?.copiedFrom || localChar.copiedFrom.startsWith('gen:')) return
        if (!window.confirm('Khôi phục về phiên bản gốc từ GitHub? Mọi chỉnh sửa local sẽ mất.')) return
        setResetting(true)
        try {
            const res = await fetch(`${RAW_BASE}/chars/${encodeURIComponent(localChar.copiedFrom)}.json`)
            if (!res.ok) throw new Error()
            const original: CharEntry = await res.json()
            initialized.current = false
            setVi(original.vi ?? '')
            setPinyinVal(original.pinyin)
            setSinoViet(original.sino_vietnamese)
            setTrad(original.trad ?? '')
            setRadical(original.radical ?? '')
            setNote(original.etymology.note)
            setComponents(original.etymology.components)
            setSentences(original.sentences ?? [])
            setRelated(original.etymology.related)
            updateChar(char, { ...original, source: 'local', copiedFrom: localChar.copiedFrom })
            requestAnimationFrame(() => { initialized.current = true })
        } catch {
            window.alert('Không thể tải file gốc từ GitHub.')
        } finally {
            setResetting(false)
        }
    }

    function handleDelete() {
        if (!localChar) return
        if (!window.confirm(`Xóa ${char} khỏi thiết bị? Dữ liệu repo không bị ảnh hưởng.`)) return
        deleteChar(char, String(localChar.createdAt ?? 0))
        router.push('/')
    }

    function openEdit() {
        open(
            <ClonePrompt onClone={() => {
                if (curated) cloneFromRepo(curated)
                else cloneFromGen(initialData)
                closeAll()
            }}/>,
            `Chỉnh sửa ${char}`
        )
    }

    function openUnknown(c: string) {
        open(
            <NewCharPrompt
                c={c}
                onConfirm={() => {
                    const blank: CharEntry = {
                        char: c, pinyin: '', sino_vietnamese: '', vi: '',
                        etymology: { note: '', components: [], related: [] },
                        source: 'local', createdAt: Date.now(), editedFields: [],
                    }
                    addChar(blank)
                    closeAll()
                }}
            />,
            `Thêm chữ ${c}`
        )
    }

    function openContribute() {
        if (!localChar) return
        open(<ContributeSheet char={localChar} repoOriginal={curated}/>, `Đóng góp ${char}`)
    }

    useToolBarSlot([
        { icon: <ArrowLeft size={20}/>, label: 'Back', position: 'left', onClick: () => router.push('/') },
        // HIDDEN: edit/contribute buttons temporarily disabled
        // ...(isLocal
        //     ? [{ icon: <GitPullRequest size={20}/>, label: 'Contribute', position: 'right' as const, onClick: openContribute }]
        //     : [{ icon: <CopySimple size={20}/>, label: 'Edit', position: 'right' as const, onClick: openEdit }]
        // ),
    ])

    useHeaderSlot(
        <h1 className="text-xl tracking-tight grid grid-cols-12">
            <div className="col-span-4">Chiết Tự</div>
            <div className="col-span-4 flex justify-center items-center gap-1">
                <span>{entry.char}</span>
                <Dot className="text-muted-foreground"/>
                <span className="text-blue-500">{entry.pinyin}</span>
                <Dot className="text-muted-foreground"/>
                <span className="text-green-500">{entry.sino_vietnamese}</span>
            </div>
            <div className="col-span-4 flex justify-end text-sm"></div>
        </h1>
    )

    // ── Display values (local edit state when local, entry data otherwise) ─
    const dVi = isLocal ? vi : (entry.vi ?? '')
    const dPinyin = isLocal ? pinyinVal : entry.pinyin
    const dSinoViet = isLocal ? sinoViet : entry.sino_vietnamese
    const dTrad = isLocal ? trad : (entry.trad ?? '')
    const dRadical = isLocal ? radical : (entry.radical ?? '')
    const dNote = isLocal ? note : (entry.etymology?.note ?? '')
    const dComponents = isLocal ? components : (entry.etymology?.components ?? [])
    const dSentences = isLocal ? sentences : (entry.sentences ?? [])
    const dRelated = isLocal ? related : (entry.etymology?.related ?? [])

    const sp = (id: string) => ({ isLocal, isActive: activeSection === id, onToggle: () => toggle(id) })
    const showTrad = entry.trad && entry.trad !== entry.char

    return (
        <>
            <div className="char-page__content space-y-6">

                <div className="flex flex-wrap justify-evenly gap-4 mb-5">
                    <StrokeBox char={entry.char} simp={entry.char} trad={entry.trad ?? entry.char}/>
                    {showTrad && <StrokeBox char={entry.trad!} simp={entry.char} trad={entry.trad ?? entry.char} defaultTrad/>}
                </div>

                <MeaningSection {...sp('vi')} value={vi} onChange={setVi} displayValue={dVi}/>

                {initialData.definitions_en?.length ? (
                    <section className="space-y-1.5">
                        <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">English</h2>
                        <p className="text-sm text-[#666]">{initialData.definitions_en.slice(0, 3).join(' · ')}</p>
                    </section>
                ) : null}

                {/*<PronunciationSection {...sp('pronunciation')}*/}
                {/*    pinyinVal={pinyinVal} sinoViet={sinoViet}*/}
                {/*    onPinyinChange={setPinyinVal} onSinoVietChange={setSinoViet}*/}
                {/*    displayPinyin={dPinyin} displaySinoViet={dSinoViet}*/}
                {/*/>*/}

                {/*<CharMetaSection {...sp('char-meta')}*/}
                {/*    trad={trad} radical={radical}*/}
                {/*    onTradChange={setTrad} onRadicalChange={setRadical}*/}
                {/*    displayTrad={dTrad} displayRadical={dRadical}*/}
                {/*/>*/}

                <EtymologySection {...sp('etym-note')} value={note} onChange={setNote} displayValue={dNote}/>

                <ComponentsSection {...sp('components')}
                    components={components} onComponentsChange={setComponents}
                    displayComponents={dComponents}
                    knownLinkedChars={knownLinkedChars} onUnknown={openUnknown}
                />

                {/*<ExamplesSection {...sp('sentences')}*/}
                {/*    sentences={sentences} onSentencesChange={setSentences}*/}
                {/*    displaySentences={dSentences}*/}
                {/*/>*/}

                <RelatedSection {...sp('related')}
                    related={related} onRelatedChange={setRelated}
                    displayRelated={dRelated}
                    knownLinkedChars={knownLinkedChars} onUnknown={openUnknown}
                />

                {!isLocal && entry.radical && (
                    <section className="space-y-1.5">
                        <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Bộ thủ</h2>
                        <CharLink c={entry.radical} known={knownLinkedChars.has(entry.radical)} onUnknown={() => openUnknown(entry.radical!)} className="text-2xl hover:text-blue-500 transition-colors"/>
                    </section>
                )}

                {curated?.contributor && (
                    <p className="text-xs text-[#BBB]">Contributed by {curated.contributor}</p>
                )}

                {isLocal && localChar && (
                    <DangerZone localChar={localChar} onReset={handleReset} onDelete={handleDelete} resetting={resetting}/>
                )}
            </div>

            <div
                className="dev-data hidden text-xs overflow-auto 2xl:block fixed bottom-2 left-2 top-2 rounded-xl bg-white w-[400px] p-6">
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(entry, null, 2)}</pre>
            </div>
        </>
    )
}
