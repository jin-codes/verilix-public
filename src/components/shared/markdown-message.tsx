'use client'

import React, { useEffect, useMemo, useState } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Copy, Check, X } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

type CopyStatus = 'idle' | 'copied' | 'error'

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode }
    return extractText(props.children)
  }
  return ''
}

function CodeBlock({ lang, children }: { lang: string; children: React.ReactNode }) {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const isKo = lang === 'ko'

  useEffect(() => {
    if (status === 'idle') return
    const timer = setTimeout(() => setStatus('idle'), 1500)
    return () => clearTimeout(timer)
  }, [status])

  const handleCopy = async () => {
    const text = extractText(children).replace(/\n$/, '')
    const ok = await copyToClipboard(text)
    setStatus(ok ? 'copied' : 'error')
  }

  const tooltip =
    status === 'copied'
      ? isKo
        ? '복사됨'
        : 'Copied'
      : status === 'error'
        ? isKo
          ? '복사 실패'
          : 'Copy failed'
        : isKo
          ? '코드 복사'
          : 'Copy code'

  return (
    <div className="group/code relative my-1">
      <pre className="m-0">{children}</pre>
      <button
        type="button"
        onClick={handleCopy}
        title={tooltip}
        // Force-visible once a result is set, not just while hovering — otherwise the
        // confirmation icon disappears the instant the pointer leaves after the click.
        className={`absolute top-1.5 right-1.5 p-1.5 rounded-sm cursor-pointer transition-opacity duration-150 ${
          status === 'idle' ? 'opacity-0 group-hover/code:opacity-100' : 'opacity-100'
        }`}
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          color: status === 'error' ? 'var(--destructive)' : 'var(--text-secondary)',
        }}
      >
        {status === 'copied' ? (
          <Check className="w-3.5 h-3.5" />
        ) : status === 'error' ? (
          <X className="w-3.5 h-3.5" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  )
}

function buildComponents(lang: string): Components {
  return {
    p: ({ children }) => (
      <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h1 className="text-lg font-semibold mt-2" style={{ color: 'var(--foreground)' }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-base font-semibold mt-2" style={{ color: 'var(--foreground)' }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-sm font-semibold mt-2" style={{ color: 'var(--foreground)' }}>
        {children}
      </h3>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold" style={{ color: 'var(--foreground)' }}>
        {children}
      </strong>
    ),
    ul: ({ children }) => <ul className="text-sm leading-relaxed pl-5 list-disc space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="text-sm leading-relaxed pl-5 list-decimal space-y-1">{children}</ol>,
    li: ({ children }) => <li style={{ color: 'var(--foreground)' }}>{children}</li>,
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
        style={{ color: 'var(--primary)' }}
      >
        {children}
      </a>
    ),
    code: ({ children, className }) => {
      const isBlock = className?.includes('language-')
      if (isBlock) {
        return (
          <code
            className="block text-xs font-mono p-3 rounded-sm overflow-x-auto whitespace-pre"
            style={{ backgroundColor: 'var(--sidebar)', color: 'var(--foreground)' }}
          >
            {children}
          </code>
        )
      }
      return (
        <code
          className="text-xs font-mono px-1 py-0.5 rounded-sm"
          style={{ backgroundColor: 'var(--sidebar)', color: 'var(--foreground)' }}
        >
          {children}
        </code>
      )
    },
    // Fenced code blocks always render as `pre > code`, regardless of language tag —
    // unlike inline code, which react-markdown never wraps in `pre`. Anchoring the
    // copy button here (rather than in `code`) reliably targets only real code blocks.
    pre: ({ children }) => <CodeBlock lang={lang}>{children}</CodeBlock>,
    blockquote: ({ children }) => (
      <blockquote
        className="text-sm pl-3 italic"
        style={{ borderLeft: '2px solid var(--border-strong)', color: 'var(--text-secondary)' }}
      >
        {children}
      </blockquote>
    ),
    hr: () => <hr style={{ borderColor: 'var(--border)' }} />,
  }
}

interface MarkdownMessageProps {
  content: string
  lang?: string
}

// remark-math parses `$$` as a fence (like a code block): anything glued to the
// same line as the opening `$$` is treated as fence "meta" and dropped, and a
// closing `$$` not alone on its own line isn't recognized as closing the block.
// The system prompt asks the model to always put `$$` on its own line, but LLM
// output isn't 100% reliable, so isolate every `$$` onto its own line here too.
function isolateBlockMathFences(input: string): string {
  let result = ''
  let i = 0
  while (i < input.length) {
    if (input[i] === '$' && input[i + 1] === '$') {
      if (result.length > 0 && !result.endsWith('\n')) result += '\n'
      result += '$$'
      i += 2
      if (input[i] !== undefined && input[i] !== '\n') result += '\n'
    } else {
      result += input[i]
      i++
    }
  }
  return result
}

export default function MarkdownMessage({ content, lang = 'en' }: MarkdownMessageProps) {
  const components = useMemo(() => buildComponents(lang), [lang])

  return (
    <div className="flex flex-col gap-2">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
        {isolateBlockMathFences(content)}
      </ReactMarkdown>
    </div>
  )
}
