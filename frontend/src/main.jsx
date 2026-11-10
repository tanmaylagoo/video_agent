import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const Icon = ({ name, size = 18 }) => {
  const paths = {
    play: <><path d="m8 5 11 7-11 7z" /></>,
    sparkle: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z"/></>,
    upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    video: <><rect x="3" y="5" width="13" height="14" rx="3"/><path d="m16 10 5-3v10l-5-3"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function App() {
  const [source, setSource] = useState('')
  const [file, setFile] = useState(null)
  const [language, setLanguage] = useState('english')
  const [result, setResult] = useState(null)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function analyze(event) {
    event.preventDefault()
    if (!file && !source.trim()) { setError('Paste a video link or upload a file to get started.'); return }
    setBusy(true); setError(''); setResult(null); setMessages([])
    const body = new FormData()
    body.append('source', source)
    body.append('language', language)
    if (file) body.append('media', file)
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, { method: 'POST', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Analysis failed.')
      setResult(data)
    } catch (err) { setError(err.message || 'Could not reach VidWise. Make sure the backend is running.') }
    finally { setBusy(false) }
  }

  async function sendQuestion(event) {
    event.preventDefault()
    const text = question.trim()
    if (!text || !result || busy) return
    setQuestion(''); setMessages((items) => [...items, { role: 'user', content: text }]); setBusy(true); setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${result.session_id}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: text }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Could not answer that question.')
      setMessages((items) => [...items, { role: 'assistant', content: data.answer }])
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  return <div className="min-h-screen bg-[#f7f7f4] text-[#20211f]">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark"><Icon name="play" size={17}/></span>vidwise<span className="brand-dot">.</span></a><div className="top-note"><span className="live-dot"/> VIDEO INTELLIGENCE, SIMPLIFIED</div><a href="#workspace" className="header-link">Open workspace <Icon name="arrow" size={15}/></a></header>
    <main id="top" className="mx-auto max-w-[1180px] px-5 pb-20 pt-14 sm:px-8 sm:pt-20">
      <section className="hero-grid">
        <div className="hero-copy"><div className="eyebrow"><Icon name="sparkle" size={15}/> YOUR VIDEO, UNDERSTOOD</div><h1>Every video has<br/>a <span>clearer story.</span></h1><p className="hero-desc">Turn long videos into useful notes, decisions, and answers. Drop in a link or upload a recording to begin.</p><div className="hero-proof"><div className="proof-avatar">V</div><div><strong>One video. All the signal.</strong><small>Transcript · Summary · Action items · AI chat</small></div></div></div>
        <div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-window"><div className="window-top"><i/><i/><i/><span>vidwise / insights</span></div><div className="video-frame"><div className="frame-sun"/><div className="frame-hill hill-back"/><div className="frame-hill hill-front"/><div className="frame-play"><Icon name="play" size={21}/></div></div><div className="art-lines"><b/><i/><i/></div></div><div className="float-card"><span className="float-icon"><Icon name="sparkle" size={15}/></span><div><b>Key insight found</b><small>Ready when you are</small></div><span className="float-check">✓</span></div><span className="art-star star-a">✳</span><span className="art-star star-b">✦</span></div>
      </section>

      <section id="workspace" className="workspace-card"><div className="workspace-heading"><div><div className="section-kicker">START A NEW ANALYSIS</div><h2>Bring your video</h2></div><div className="secure-note"><span>✦</span> Your files stay yours</div></div>
        <form onSubmit={analyze} className="input-layout"><div className="source-panel"><label className="field-label" htmlFor="video-url"><span className="field-icon"><Icon name="link" size={16}/></span>PASTE A VIDEO LINK</label><input id="video-url" value={source} onChange={e => setSource(e.target.value)} placeholder="YouTube link or video URL" disabled={busy}/><div className="or-divider"><span/> OR <span/></div><label className={`upload-zone ${file ? 'has-file' : ''}`} htmlFor="media-file"><input id="media-file" type="file" accept="audio/*,video/*" onChange={e => setFile(e.target.files?.[0] || null)}/><span className="upload-icon"><Icon name="upload" size={19}/></span><span><b>{file ? file.name : 'Upload a video or audio file'}</b><small>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Click to change` : 'MP4, MOV, MP3, WAV and more'}</small></span><span className="browse-link">Browse</span></label></div>
        <aside className="options-panel"><label className="field-label" htmlFor="language">VIDEO LANGUAGE</label><div className="select-wrap"><select id="language" value={language} onChange={e => setLanguage(e.target.value)} disabled={busy}><option value="english">English</option><option value="hinglish">Hindi / Hinglish</option></select><span>⌄</span></div><div className="pipeline-note"><div className="pipeline-icon"><Icon name="sparkle" size={17}/></div><p><b>Made useful in minutes</b><small>VidWise transcribes, summarizes, and pulls out what matters.</small></p></div><button className="analyze-button" type="submit" disabled={busy}><span>{busy ? 'Working on it…' : 'Analyze video'}</span>{!busy && <Icon name="arrow" size={17}/>}</button></aside></form>
        {error && <div className="error-banner" role="alert">{error}</div>}
        {busy && !result && <div className="loading-state"><span className="spinner"/> Analyzing your video. Longer recordings can take a few minutes.</div>}
      </section>

      {result ? <section className="results-section"><div className="results-heading"><div><div className="section-kicker">YOUR VIDEO, DECODED</div><h2>{result.title || 'Video insights'}</h2></div><button className="new-analysis" onClick={() => { setResult(null); setMessages([]); setFile(null); setSource('') }}>New analysis <Icon name="arrow" size={15}/></button></div><div className="results-grid"><article className="result-card summary-card"><div className="result-label"><span className="result-symbol purple"><Icon name="sparkle" size={16}/></span> THE SHORT VERSION</div><p>{result.summary}</p></article><article className="result-card"><div className="result-label"><span className="result-symbol green">✓</span> ACTION ITEMS</div><div className="result-body">{result.action_items || 'No action items found.'}</div></article><article className="result-card"><div className="result-label"><span className="result-symbol yellow">↗</span> KEY DECISIONS</div><div className="result-body">{result.key_decisions || 'No key decisions found.'}</div></article><article className="result-card"><div className="result-label"><span className="result-symbol blue">?</span> OPEN QUESTIONS</div><div className="result-body">{result.open_questions || 'No open questions found.'}</div></article></div><details className="transcript-details"><summary>Read the full transcript <span>＋</span></summary><div>{result.transcript}</div></details><div className="chat-card"><div className="result-label"><span className="result-symbol purple"><Icon name="sparkle" size={16}/></span> ASK YOUR VIDEO</div><p className="chat-intro">Curious about a detail? Ask a question and get an answer grounded in the transcript.</p>{messages.length > 0 && <div className="message-list">{messages.map((m, i) => <div className={`message ${m.role}`} key={i}><b>{m.role === 'user' ? 'You' : 'VidWise'}</b><p>{m.content}</p></div>)}</div>}<form className="chat-form" onSubmit={sendQuestion}><input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask something about this video…"/><button aria-label="Send question" disabled={busy}><Icon name="send" size={17}/></button></form></div></section> : <section className="steps-row"><div className="step"><span>01</span><div><b>Drop in a video</b><small>Paste a link or upload a file</small></div></div><div className="step-line"/><div className="step"><span>02</span><div><b>Let VidWise listen</b><small>We find the important moments</small></div></div><div className="step-line"/><div className="step"><span>03</span><div><b>Get to the good part</b><small>Explore notes and ask questions</small></div></div></section>}
    </main><footer className="footer"><span className="brand small-brand"><span className="brand-mark"><Icon name="play" size={12}/></span>vidwise<span className="brand-dot">.</span></span><span>Make more of what you watch.</span></footer>
  </div>
}

createRoot(document.getElementById('app')).render(<React.StrictMode><App/></React.StrictMode>)
