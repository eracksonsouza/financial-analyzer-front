import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import chatBotIcon from '../assets/chat-bot.png'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Olá! Sou seu assistente financeiro. Por onde quer começar?',
    time: '09:00',
  },
]

const mockReplies: Record<string, string> = {
  'Como economizar mais?':
    'Para economizar mais, comece rastreando todos os seus gastos por 30 dias. Identifique os 3 maiores vilões do orçamento e tente reduzi-los em 20%. Pequenas mudanças diárias geram grandes economias ao longo do ano.',
  'Como montar uma reserva de emergência?':
    'Uma reserva de emergência ideal cobre de 3 a 6 meses dos seus gastos fixos. Abra uma conta separada rendendo pelo menos 100% do CDI e transfira um valor fixo todo mês. Comece com o que puder, mesmo que seja R$ 100,00.',
  'Devo investir ou quitar dívidas?':
    'Depende dos juros! Se sua dívida tem juros acima de 10% a.m. (cartão de crédito, cheque especial), quite primeiro. Se forem dívidas com juros baixos (financiamento imobiliário), é possível investir e quitar ao mesmo tempo.',
}

const defaultReply =
  'Ótima pergunta! Vou te ajudar com isso. Para uma análise mais precisa do seu caso, recomendo também usar o módulo de Análise disponível na barra lateral.'

const initialSuggestions = [
  'Como economizar mais?',
  'Como montar uma reserva de emergência?',
  'Devo investir ou quitar dívidas?',
]

function getTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const BOT_AVATAR_SIZE = 28

export function FinanceChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [hasUnread, setHasUnread] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (open) {
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), time: getTime() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    setTimeout(() => {
      const reply = mockReplies[text.trim()] ?? defaultReply
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, time: getTime() }])
      setIsTyping(false)
      if (!open) setHasUnread(true)
    }, 1100)
  }

  const handleSuggestion = (s: string) => {
    setSuggestions((prev) => prev.filter((x) => x !== s))
    sendMessage(s)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage(input)
  }

  const canSend = input.trim().length > 0 && !isTyping

  return createPortal(
    <>
      <style>{`
        @keyframes cb-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes cb-window-in {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes cb-msg-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cb-unread {
          0%, 100% { box-shadow: 0 0 0 0 rgba(79,202,136,0.55); }
          50%       { box-shadow: 0 0 0 7px rgba(79,202,136,0); }
        }
        .cb-trigger {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 99999;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(79,202,136,0.35);
          background: #0d1910;
          cursor: pointer;
          padding: 0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.55), 0 2px 8px rgba(79,202,136,0.12);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cb-trigger:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 4px 16px rgba(79,202,136,0.28);
        }
        .cb-trigger:active { transform: scale(0.95); }
        .cb-window {
          position: fixed;
          bottom: 100px;
          right: 28px;
          z-index: 99998;
          width: 370px;
          height: 540px;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #111316;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 28px 80px rgba(0,0,0,0.65), 0 8px 24px rgba(0,0,0,0.4);
          animation: cb-window-in 0.24s cubic-bezier(0.34, 1.15, 0.64, 1) forwards;
          font-family: 'Instrument Sans', sans-serif;
        }
        .cb-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          flex-shrink: 0;
          background: linear-gradient(135deg, #091610 0%, #0e2016 50%, #091610 100%);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .cb-avatar-wrap {
          position: relative;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(79,202,136,0.4);
          box-shadow: 0 0 14px rgba(79,202,136,0.15);
        }
        .cb-avatar-wrap img {
          display: block;
          width: 42px;
          height: 42px;
          object-fit: cover;
        }
        .cb-online-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #4fca88;
          border: 2px solid #091610;
          box-shadow: 0 0 6px rgba(79,202,136,0.7);
        }
        .cb-header-info { flex: 1; min-width: 0; }
        .cb-title {
          font-size: 15px;
          font-weight: 600;
          color: #f0f1f2;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        .cb-subtitle {
          font-size: 11px;
          color: #4fca88;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.01em;
          margin-top: 2px;
        }
        .cb-close {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.35);
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
          padding: 0;
        }
        .cb-close:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.8); }
        .cb-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scroll-behavior: smooth;
        }
        .cb-messages::-webkit-scrollbar { width: 3px; }
        .cb-messages::-webkit-scrollbar-track { background: transparent; }
        .cb-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }
        .cb-row {
          display: flex;
          gap: 8px;
          animation: cb-msg-in 0.2s ease forwards;
        }
        .cb-row--user  { justify-content: flex-end; }
        .cb-row--bot   { justify-content: flex-start; }
        .cb-msg-avatar {
          width: ${BOT_AVATAR_SIZE}px;
          height: ${BOT_AVATAR_SIZE}px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          margin-top: 4px;
          border: 1.5px solid rgba(79,202,136,0.22);
        }
        .cb-msg-avatar img {
          display: block;
          width: ${BOT_AVATAR_SIZE}px;
          height: ${BOT_AVATAR_SIZE}px;
          object-fit: cover;
        }
        .cb-bubble-col { display: flex; flex-direction: column; gap: 3px; max-width: 78%; }
        .cb-bubble-col--user { align-items: flex-end; }
        .cb-bubble-col--bot  { align-items: flex-start; }
        .cb-bubble {
          font-size: 13.5px;
          line-height: 1.6;
          padding: 10px 14px;
        }
        .cb-bubble--user {
          background: linear-gradient(135deg, #17382a 0%, #1b4733 100%);
          color: #d8f0e5;
          border: 1px solid rgba(79,202,136,0.18);
          border-radius: 18px 18px 4px 18px;
        }
        .cb-bubble--bot {
          background: #1c2025;
          color: #e5e7ea;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 4px 18px 18px 18px;
        }
        .cb-time {
          font-size: 10px;
          color: #38404a;
          font-family: 'DM Mono', monospace;
          padding: 0 4px;
        }
        .cb-typing {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 12px 16px;
          background: #1c2025;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 4px 18px 18px 18px;
          animation: cb-msg-in 0.2s ease forwards;
        }
        .cb-dot {
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4fca88;
        }
        .cb-suggestions { display: flex; flex-direction: column; gap: 8px; margin-top: 2px; }
        .cb-suggestions-label {
          font-size: 10px;
          color: #38404a;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.06em;
          padding: 0 2px;
        }
        .cb-chips { display: flex; flex-wrap: wrap; gap: 7px; }
        .cb-chip {
          font-size: 12px;
          padding: 6px 13px;
          border-radius: 999px;
          border: 1px solid rgba(79,202,136,0.22);
          color: #72c99a;
          background: rgba(79,202,136,0.05);
          cursor: pointer;
          font-family: 'Instrument Sans', sans-serif;
          transition: background 0.15s, border-color 0.15s, transform 0.12s;
          line-height: 1;
        }
        .cb-chip:hover {
          background: rgba(79,202,136,0.13);
          border-color: rgba(79,202,136,0.5);
          transform: translateY(-1px);
        }
        .cb-chip:active { transform: scale(0.96); }
        .cb-footer {
          flex-shrink: 0;
          padding: 12px;
          background: #0c0e10;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .cb-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 14px;
          background: #181c20;
          transition: border-color 0.2s;
        }
        .cb-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 13.5px;
          color: #e5e7ea;
          font-family: 'Instrument Sans', sans-serif;
          caret-color: #4fca88;
          min-width: 0;
        }
        .cb-input::placeholder { color: #3a4048; }
        .cb-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .cb-send {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 0;
          transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
        }
        .cb-send:not(:disabled):hover { transform: scale(1.1); }
        .cb-send:not(:disabled):active { transform: scale(0.93); }
        .cb-send:disabled { cursor: not-allowed; opacity: 0.5; }
        .cb-unread-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #4fca88;
          border: 2px solid #0d1910;
          animation: cb-unread 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* ── Floating trigger ── */}
      <button
        className="cb-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Abrir assistente financeiro"
        style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 99999 }}
      >
        <img
          src={chatBotIcon}
          alt="Finance AI"
          style={{ display: 'block', width: 54, height: 54, objectFit: 'cover', borderRadius: '50%' }}
        />
        {hasUnread && <span className="cb-unread-badge" />}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div
          className="cb-window"
          style={{ position: 'fixed', bottom: 100, right: 28, zIndex: 99998 }}
        >
          {/* Header */}
          <div className="cb-header">
            <div className="cb-avatar-wrap" style={{ position: 'relative' }}>
              <img src={chatBotIcon} alt="Finance AI" />
              <span className="cb-online-dot" />
            </div>

            <div className="cb-header-info">
              <div className="cb-title">Finance AI</div>
              <div className="cb-subtitle">Assistente de finanças pessoais</div>
            </div>

            <button className="cb-close" onClick={() => setOpen(false)} aria-label="Fechar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="cb-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`cb-row cb-row--${msg.role === 'user' ? 'user' : 'bot'}`}>
                {msg.role === 'assistant' && (
                  <div className="cb-msg-avatar">
                    <img src={chatBotIcon} alt="" />
                  </div>
                )}
                <div className={`cb-bubble-col cb-bubble-col--${msg.role === 'user' ? 'user' : 'bot'}`}>
                  <div className={`cb-bubble cb-bubble--${msg.role === 'user' ? 'user' : 'bot'}`}>
                    {msg.content}
                  </div>
                  <span className="cb-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing dots */}
            {isTyping && (
              <div className="cb-row cb-row--bot">
                <div className="cb-msg-avatar">
                  <img src={chatBotIcon} alt="" />
                </div>
                <div className="cb-typing">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="cb-dot"
                      style={{ animation: `cb-bounce 1.3s ease-in-out ${i * 0.18}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggestion chips */}
            {suggestions.length > 0 && !isTyping && (
              <div className="cb-suggestions">
                <span className="cb-suggestions-label">SUGESTÕES</span>
                <div className="cb-chips">
                  {suggestions.map((s) => (
                    <button key={s} className="cb-chip" onClick={() => handleSuggestion(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input footer */}
          <div className="cb-footer">
            <div
              className="cb-input-row"
              style={{ border: `1px solid ${canSend ? 'rgba(79,202,136,0.22)' : 'rgba(255,255,255,0.07)'}` }}
            >
              <input
                ref={inputRef}
                className="cb-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                disabled={isTyping}
              />
              <button
                className="cb-send"
                onClick={() => sendMessage(input)}
                disabled={!canSend}
                aria-label="Enviar"
                style={{
                  background: canSend
                    ? 'linear-gradient(135deg, #4fca88 0%, #38b872 100%)'
                    : 'rgba(255,255,255,0.06)',
                  boxShadow: canSend ? '0 2px 12px rgba(79,202,136,0.32)' : 'none',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={canSend ? '#071510' : '#3a4048'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transform: 'rotate(45deg) translate(1px,-1px)' }}
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  )
}
