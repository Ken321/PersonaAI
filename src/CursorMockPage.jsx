import React, { useState, useEffect, useRef } from 'react';
import PluginConnectPage from './PluginConnectPage';

// ---------------------------------------------------------------------------
// Conversation steps: persona interruption → AI synthesis
// ---------------------------------------------------------------------------
const CONVERSATION_STEPS = [
  {
    type: 'persona',
    persona: {
      id: 'miyuki-1',
      name: '美雪',
      age: 25,
      occupation: '経理',
      avatarBg: '#fde68a',
      textColor: '#78350f',
      reply:
        '通知ってすぐに溜まっちゃうんだよね、、、どれが大事なのか分かんなくなるから、なんか種類で分けてくれる機能があったら嬉しいな〜',
    },
  },
  {
    type: 'ai',
    content: `美雪さんのフィードバックを踏まえて、以下のような仕様はいかがでしょうか？

「既読になるまで表示し続ける」という元々のご要件は維持しつつ、通知を種類別に分類することで「どれが大事か分からない」という課題を解消できると思います。

**提案仕様：**
• Notification に priority フィールドを追加（high / medium / low）
• 通知パネルに「全て」「重要」「メンション」タブを設置
• 重要度の高い通知はバッジや色で強調表示

この設計であれば、通知が溜まっても種類ごとに整理でき、大事なものを見落とすストレスを減らせます。いかがでしょうか？`,
  },
];

// ---------------------------------------------------------------------------
// Initial chat messages (mocked AI conversation)
// ---------------------------------------------------------------------------
const INITIAL_MESSAGES = [];

const DRAFT_MESSAGE = 'Medial のアプリ内通知システムを設計してほしい。ユーザーが既読にするまで通知を表示し続ける仕様で。';

// ---------------------------------------------------------------------------
// Syntax-highlighted code display helpers
// ---------------------------------------------------------------------------
const kw = (t) => <span style={{ color: '#569cd6' }}>{t}</span>;
const ty = (t) => <span style={{ color: '#4ec9b0' }}>{t}</span>;
const st = (t) => <span style={{ color: '#ce9178' }}>{t}</span>;
const cm = (t) => <span style={{ color: '#6a9955' }}>{t}</span>;
const fn = (t) => <span style={{ color: '#dcdcaa' }}>{t}</span>;
const pl = (t) => <span style={{ color: '#d4d4d4' }}>{t}</span>;
const nm = (t) => <span style={{ color: '#b5cea8' }}>{t}</span>;
const pr = (t) => <span style={{ color: '#9cdcfe' }}>{t}</span>;

const CODE_LINES = [
  [cm('// Medial — アプリ内通知システム')],
  [],
  [kw('import'), pl(' { '), pr('useState'), pl(', '), pr('useEffect'), pl(' } '), kw('from'), pl(' '), st("'react'"), pl(';')],
  [kw('import'), pl(' { '), ty('NotificationService'), pl(' } '), kw('from'), pl(' '), st("'@medial/core'"), pl(';')],
  [],
  [kw('interface'), pl(' '), ty('Notification'), pl(' {')],
  [pl('  '), pr('id'), pl(': '), ty('string'), pl(';')],
  [pl('  '), pr('type'), pl(': '), st('"system"'), pl(' | '), st('"mention"'), pl(' | '), st('"approval"'), pl(';')],
  [pl('  '), pr('title'), pl(': '), ty('string'), pl(';')],
  [pl('  '), pr('body'), pl(': '), ty('string'), pl(';')],
  [pl('  '), pr('isRead'), pl(': '), ty('boolean'), pl(';')],
  [pl('  '), pr('createdAt'), pl(': '), ty('Date'), pl(';')],
  [pl('}')],
  [],
  [kw('export function'), pl(' '), fn('useNotifications'), pl('('), pr('userId'), pl(': '), ty('string'), pl(') {')],
  [pl('  '), kw('const'), pl(' ['), pr('notifications'), pl(', '), fn('setNotifications'), pl('] = '), fn('useState'), pl('<'), ty('Notification'), pl('[]>([])'), pl(';')],
  [pl('  '), kw('const'), pl(' ['), pr('unreadCount'), pl(', '), fn('setUnreadCount'), pl('] = '), fn('useState'), pl('('), nm('0'), pl(');')],
  [],
  [pl('  '), fn('useEffect'), pl('(() => {')],
  [pl('    '), cm('// WebSocket でリアルタイム通知を受信する')],
  [pl('    '), kw('const'), pl(' '), pr('ws'), pl(' = '), kw('new'), pl(' '), ty('WebSocket'), pl('('), st('`wss://api.medial.app/notify/${'), pr('userId'), st('}` '), pl(');')],
  [],
  [pl('    '), pr('ws'), pl('.'), pr('onmessage'), pl(' = ('), pr('event'), pl(') => {')],
  [pl('      '), kw('const'), pl(' '), pr('data'), pl(' = '), ty('JSON'), pl('.'), fn('parse'), pl('('), pr('event'), pl('.'), pr('data'), pl(');')],
  [pl('      '), fn('setNotifications'), pl('('), pr('prev'), pl(' => ['), pr('data'), pl(', ...'), pr('prev'), pl(']);')],
  [pl('      '), fn('setUnreadCount'), pl('('), pr('prev'), pl(' => '), pr('prev'), pl(' + '), nm('1'), pl(');')],
  [pl('    };')],
  [],
  [pl('    '), kw('return'), pl(' () => '), pr('ws'), pl('.'), fn('close'), pl('();')],
  [pl('  }, ['), pr('userId'), pl(']);')],
  [],
  [pl('  '), kw('const'), pl(' '), fn('markAsRead'), pl(' = '), kw('async'), pl(' ('), pr('id'), pl(': '), ty('string'), pl(') => {')],
  [pl('    '), kw('await'), pl(' '), fn('fetch'), pl('('), st('`/api/notifications/${'), pr('id'), st('}/read`'), pl(', { '), pr('method'), pl(': '), st('"PATCH"'), pl(' });')],
  [pl('    '), fn('setNotifications'), pl('('), pr('prev'), pl(' =>')],
  [pl('      '), pr('prev'), pl('.'), fn('map'), pl('('), pr('n'), pl(' => '), pr('n'), pl('.'), pr('id'), pl(' === '), pr('id'), pl(' ? { ...'), pr('n'), pl(', '), pr('isRead'), pl(': '), kw('true'), pl(' } : '), pr('n')],
  [pl('    );')],
  [pl('    '), fn('setUnreadCount'), pl('('), pr('prev'), pl(' => '), ty('Math'), pl('.'), fn('max'), pl('('), nm('0'), pl(', '), pr('prev'), pl(' - '), nm('1'), pl('));')],
  [pl('  };')],
  [],
  [pl('  '), kw('return'), pl(' { '), pr('notifications'), pl(', '), pr('unreadCount'), pl(', '), fn('markAsRead'), pl(' };')],
  [pl('}')],
];

// ---------------------------------------------------------------------------
// SVG icon helpers (inline, no extra dependency)
// ---------------------------------------------------------------------------
const SvgFiles = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const SvgSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SvgGit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" />
    <line x1="6" y1="9" x2="6" y2="21" />
  </svg>
);

const SvgPuzzle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const SvgSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// ---------------------------------------------------------------------------
// MessageBubble sub-component
// ---------------------------------------------------------------------------
function MessageBubble({ msg }) {
  if (msg.type === 'user') {
    return (
      <div style={{ padding: '4px 12px' }}>
        <div style={{
          backgroundColor: '#2a2a2a',
          borderRadius: 8,
          padding: '9px 12px',
          fontSize: 12.5,
          color: '#cccccc',
          lineHeight: 1.55,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.type === 'ai') {
    return (
      <div style={{ padding: '4px 12px' }}>
        <div style={{
          fontSize: 12.5,
          color: '#cccccc',
          lineHeight: 1.65,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          whiteSpace: 'pre-wrap',
        }}>
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.type === 'persona') {
    const { persona } = msg;
    return (
      <div style={{
        margin: '4px 10px',
        padding: '10px 12px',
        borderRadius: 9,
        backgroundColor: '#182818',
        border: '1px solid #2d5a2d',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        animation: 'fadeIn 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: persona.avatarBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: persona.textColor,
            flexShrink: 0,
          }}>
            {persona.name[0]}
          </div>
          <div>
            <span style={{ fontSize: 12.5, color: '#e2e2e2', fontWeight: 600 }}>{persona.name}</span>
            <span style={{ fontSize: 11, color: '#777', marginLeft: 6 }}>{persona.age}歳 / {persona.occupation}</span>
          </div>
        </div>
        <p style={{ fontSize: 12.5, color: '#c8c8c8', margin: 0, lineHeight: 1.65, paddingLeft: 32 }}>
          {persona.reply}
        </p>
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// ActivityBar button helper
// ---------------------------------------------------------------------------
function ActivityBtn({ active, onClick, title, children, style: extraStyle }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 40,
        height: 40,
        border: 'none',
        borderRadius: 6,
        backgroundColor: active ? '#3c3c3c' : 'transparent',
        color: active ? '#cccccc' : '#858585',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s',
        outline: 'none',
        ...extraStyle,
      }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function CursorMockPage() {
  const [showPluginPage, setShowPluginPage] = useState(false);
  const [activeIconTab, setActiveIconTab] = useState('files');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [personaPhase, setPersonaPhase] = useState(0);
  const [started, setStarted] = useState(false);
  const [inputText, setInputText] = useState(DRAFT_MESSAGE);
  const chatEndRef = useRef(null);

  // Auto-scroll chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer-based conversation steps: persona → AI synthesis (starts after send)
  useEffect(() => {
    if (!started) return;
    if (personaPhase >= CONVERSATION_STEPS.length) return;
    const t = setTimeout(() => {
      setMessages((prev) => [...prev, CONVERSATION_STEPS[personaPhase]]);
      setPersonaPhase((p) => p + 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [started, personaPhase]);

  function handleSend() {
    if (!inputText.trim() || started) return;
    setMessages([{ type: 'user', content: inputText.trim() }]);
    setInputText('');
    setStarted(true);
  }

  // If P icon was clicked, show the full PluginConnectPage
  if (showPluginPage) {
    return <PluginConnectPage onBack={() => setShowPluginPage(false)} />;
  }

  const iconTabs = [
    { id: 'files', Icon: SvgFiles, title: 'エクスプローラー' },
    { id: 'search', Icon: SvgSearch, title: '検索' },
    { id: 'git', Icon: SvgGit, title: 'ソース管理' },
    { id: 'ext', Icon: SvgPuzzle, title: '拡張機能' },
  ];

  const fileTree = [
    { label: '▾ medial', depth: 0, isFolder: true },
    { label: '  ▾ src', depth: 0, isFolder: true },
    { label: '    ▾ hooks', depth: 0, isFolder: true },
    { label: '      useNotifications.ts', depth: 0, isActive: true },
    { label: '    ▸ components', depth: 0, isFolder: true },
    { label: '    ▸ pages', depth: 0, isFolder: true },
    { label: '  package.json', depth: 0 },
    { label: '  tsconfig.json', depth: 0 },
  ];

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e1e1e',
      color: '#cccccc',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* ── Title bar ─────────────────────────────────────────── */}
      <div style={{
        height: 38,
        backgroundColor: '#2d2d2d',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        flexShrink: 0,
        userSelect: 'none',
        borderBottom: '1px solid #1a1a1a',
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 7 }}>
          <div style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#ff5f57', cursor: 'pointer' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#ffbd2e', cursor: 'pointer' }} />
          <div style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#28ca41', cursor: 'pointer' }} />
        </div>
        {/* Centered file name */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, color: '#aaaaaa' }}>useNotifications.ts — medial — Cursor</span>
        </div>
        {/* PersonaAI indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginRight: 16 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 500 }}>PersonaAI 接続中</span>
        </div>
      </div>

      {/* ── Main content area ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Sidebar (horizontal tabs at top) ──────────────────── */}
        <div style={{
          width: 260,
          backgroundColor: '#252526',
          borderRight: '1px solid #3c3c3c',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          {/* Horizontal tab icon row */}
          <div style={{
            height: 40,
            backgroundColor: '#2c2c2c',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 4,
            paddingRight: 6,
            gap: 0,
            borderBottom: '1px solid #3c3c3c',
            flexShrink: 0,
          }}>
            {iconTabs.map(({ id, Icon, title }) => (
              <ActivityBtn
                key={id}
                active={activeIconTab === id}
                onClick={() => setActiveIconTab((cur) => (cur === id ? null : id))}
                title={title}
                style={{ width: 36, height: 34, borderRadius: 5 }}
              >
                <Icon />
              </ActivityBtn>
            ))}

            {/* PersonaAI "P" tab */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowPluginPage(true)}
                title="PersonaAI パネルを開く"
                style={{
                  width: 36,
                  height: 34,
                  border: '1.5px solid #22c55e',
                  borderRadius: 6,
                  backgroundColor: '#1a3a2a',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontStyle: 'italic',
                  boxShadow: '0 0 8px rgba(34,197,94,0.25)',
                  outline: 'none',
                }}
              >
                P
              </button>
              <div style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                border: '1px solid #2c2c2c',
              }} />
            </div>

            <div style={{ flex: 1 }} />

            {/* Settings icon (far right of tab row) */}
            <ActivityBtn title="設定" style={{ width: 30, height: 30, borderRadius: 4 }}>
              <SvgSettings />
            </ActivityBtn>
          </div>

          {/* Sidebar content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeIconTab === 'files' && (
              <>
                <div style={{
                  padding: '10px 14px 6px',
                  fontSize: 11,
                  color: '#bbbbbb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                }}>
                  EXPLORER
                </div>
                {fileTree.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '3px 8px',
                      cursor: 'pointer',
                      backgroundColor: item.isActive ? '#094771' : 'transparent',
                      color: item.isActive ? '#ffffff' : item.isFolder ? '#cccccc' : '#aaaaaa',
                      fontSize: 12.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      whiteSpace: 'pre',
                    }}
                  >
                    {!item.isFolder && item.label.trim().endsWith('.ts') && (
                      <span style={{ color: '#4ec9b0', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>TS</span>
                    )}
                    {item.label}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── Code editor ─────────────────────────────────────── */}
        <div style={{
          flex: 1,
          backgroundColor: '#1e1e1e',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}>
          {/* Tab bar */}
          <div style={{
            height: 35,
            backgroundColor: '#2d2d2d',
            display: 'flex',
            alignItems: 'flex-end',
            borderBottom: '1px solid #1a1a1a',
            flexShrink: 0,
          }}>
            {/* Active tab */}
            <div style={{
              padding: '0 14px',
              height: 35,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1e1e1e',
              borderTop: '1px solid #007acc',
              borderRight: '1px solid #3c3c3c',
              gap: 7,
              fontSize: 12.5,
            }}>
              <span style={{ color: '#4ec9b0', fontSize: 10, fontWeight: 700 }}>TS</span>
              <span style={{ color: '#cccccc' }}>useNotifications.ts</span>
              <span style={{ color: '#777', fontSize: 14, cursor: 'pointer', lineHeight: 1 }}>×</span>
            </div>
            {/* Inactive tab */}
            <div style={{
              padding: '0 14px',
              height: 35,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#2d2d2d',
              borderRight: '1px solid #3c3c3c',
              gap: 7,
              fontSize: 12.5,
              color: '#888888',
            }}>
              <span style={{ fontSize: 10, fontWeight: 700 }}>TS</span>
              <span>NotificationPanel.tsx</span>
              <span style={{ fontSize: 14, cursor: 'pointer', lineHeight: 1 }}>×</span>
            </div>
          </div>

          {/* Code content area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                {CODE_LINES.map((line, i) => (
                  <tr key={i}>
                    <td style={{
                      width: 52,
                      paddingRight: 20,
                      paddingLeft: 16,
                      textAlign: 'right',
                      color: '#4a4a4a',
                      fontSize: 12.5,
                      fontFamily: '"Cascadia Code", "Fira Code", "Consolas", "Courier New", monospace',
                      userSelect: 'none',
                      verticalAlign: 'top',
                      lineHeight: '1.65',
                    }}>
                      {i + 1}
                    </td>
                    <td style={{
                      paddingRight: 20,
                      fontSize: 13,
                      fontFamily: '"Cascadia Code", "Fira Code", "Consolas", "Courier New", monospace',
                      whiteSpace: 'pre',
                      verticalAlign: 'top',
                      lineHeight: '1.65',
                    }}>
                      {line.length === 0 ? <span>&nbsp;</span> : line}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right AI chat panel ──────────────────────────────── */}
        <div style={{
          width: 340,
          backgroundColor: '#1a1a1a',
          borderLeft: '1px solid #3c3c3c',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          {/* Panel header */}
          <div style={{
            padding: '9px 14px',
            borderBottom: '1px solid #3c3c3c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 13, color: '#dddddd', fontWeight: 500 }}>New Chat</span>
            <div style={{ display: 'flex', gap: 10, color: '#666666', fontSize: 17, lineHeight: 1 }}>
              <span style={{ cursor: 'pointer' }}>⊕</span>
              <span style={{ cursor: 'pointer' }}>⊞</span>
              <span style={{ cursor: 'pointer', letterSpacing: 1 }}>···</span>
            </div>
          </div>

          {/* Messages list */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingTop: 6,
            paddingBottom: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Model selector row */}
          <div style={{
            padding: '5px 14px',
            borderTop: '1px solid #3c3c3c',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, color: '#777777' }}>∞∞ Agent</span>
            <span style={{ color: '#555555', fontSize: 12 }}>›</span>
            <span style={{ fontSize: 11, color: '#777777' }}>claude-sonnet-4</span>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#444' }} />
              <span style={{ fontSize: 11, color: '#666666' }}>Local</span>
            </div>
          </div>

          {/* Input area */}
          <div style={{ padding: '0 10px 10px', flexShrink: 0 }}>
            <div style={{
              border: '1px solid #3c3c3c',
              borderRadius: 8,
              backgroundColor: '#252525',
              overflow: 'hidden',
            }}>
              <textarea
                placeholder="Plan, @ for context, / for commands"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                style={{
                  width: '100%',
                  minHeight: 72,
                  padding: '10px 12px',
                  fontSize: 12.5,
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#cccccc',
                  resize: 'none',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  boxSizing: 'border-box',
                  lineHeight: 1.5,
                }}
                rows={3}
              />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 10px',
                borderTop: '1px solid #3c3c3c',
              }}>
                <div style={{ display: 'flex', gap: 10, color: '#666666', fontSize: 12 }}>
                  <span style={{ cursor: 'pointer' }}>@ Add context</span>
                  <span style={{ cursor: 'pointer' }}>/</span>
                </div>
                <button
                  onClick={handleSend}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 5,
                    backgroundColor: inputText.trim() && !started ? '#4f46e5' : '#444444',
                    border: 'none',
                    cursor: inputText.trim() && !started ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: 13,
                    outline: 'none',
                    transition: 'background 0.15s',
                  }}
                >↑</button>
              </div>
            </div>
          </div>

          {/* "Past Chats" section */}
          <div style={{
            borderTop: '1px solid #3c3c3c',
            padding: '8px 14px',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#777777' }}>Past Chats</span>
              <span style={{ fontSize: 12, color: '#555555', cursor: 'pointer' }}>∨</span>
            </div>
            {[
              'Medial 記事生成ロジックの設計',
              'ダッシュボード UI のリファクタリング',
            ].map((title, i) => (
              <div key={i} style={{
                fontSize: 11.5,
                color: '#666666',
                padding: '3px 0',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Status bar ─────────────────────────────────────────── */}
      <div style={{
        height: 22,
        backgroundColor: '#007acc',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 12,
        gap: 14,
        flexShrink: 0,
        fontSize: 11,
        color: 'rgba(255,255,255,0.92)',
      }}>
        <span>⎇ master</span>
        <span>Medial</span>
        <span>TypeScript</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#4ade80' }} />
          <span>PersonaAI</span>
        </div>
        <span>UTF-8</span>
        <span>Ln 22, Col 8</span>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
