// Web Audio API — zero dependencies, works in all modern browsers
let ctx = null
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function beep(freq = 880, duration = 0.06, vol = 0.08, type = 'sine') {
  try {
    const ac  = getCtx()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, ac.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration)
    osc.start(ac.currentTime)
    osc.stop(ac.currentTime + duration)
  } catch (_) {}
}

export const sound = {
  click:   () => beep(1200, 0.04, 0.06, 'sine'),
  success: () => { beep(880, 0.07, 0.07); setTimeout(() => beep(1100, 0.07, 0.07), 80) },
  error:   () => beep(220, 0.15, 0.08, 'sawtooth'),
  tab:     () => beep(660, 0.04, 0.05, 'sine'),
  toggle:  () => beep(990, 0.05, 0.06, 'triangle'),
}
