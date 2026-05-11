import { useEffect, useState } from 'react'

const slides = [
  {
    title: 'Focus and Clarity.',
    desc: "Your career deserves a command center. Track opportunities, build your strategy, and move with precision toward the role you've been aiming for.",
  },
  {
    title: 'Stay Organized.',
    desc: 'Never lose track of an application again. Keep every job, contact, and follow-up in one clean, structured board.',
  },
  {
    title: 'Move with Intent.',
    desc: 'Turn your job search into a system. Set goals, monitor progress, and make every action count toward your next role.',
  },
  {
    title: 'Built for Hunters.',
    desc: 'Designed for professionals who are serious about their next move. No noise — just signal.',
  },
]

export default function LoginSidebar() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % slides.length)
        setVisible(true)
      }, 500)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const slide = slides[index]

  return (
    <div
      className="relative flex flex-col justify-center h-full px-12 pr-16 py-8 overflow-hidden"
      style={{ background: '#1a1b2e' }}
    >
      {/* fondo decorativo */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        right: '-80px',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,111,205,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '60px',
        left: '-60px',
        width: '240px',
        height: '240px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,111,205,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* logo arriba */}
      <span
        className="absolute top-8 left-12 font-bold tracking-[0.25em] text-purple-400 uppercase z-10"
        style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px' }}
      >
        TRACKBOOK
      </span>

      {/* slide centrado */}
      <div
        className="relative z-10"
        style={{
          transition: 'opacity 0.6s ease',
          opacity: visible ? 1 : 0,
        }}
      >
        <p
          className="text-white font-bold mb-4 leading-snug"
          style={{ fontFamily: 'Manrope, sans-serif', fontSize: '40px' }}
        >
          {slide.title}
        </p>
        <p className="text-gray-300 leading-relaxed max-w-[600px]" style={{ fontSize: '20px' }}>
          {slide.desc}
        </p>
      </div>
    </div>
  )
}
