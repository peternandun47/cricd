import { ref } from 'vue'
import type { Ref } from 'vue'

interface TrailPoint {
  x: number
  y: number
  timestamp: number
}

// Constants for trail configuration
const TRAIL_CONFIG = {
  FADE_DURATION: 500, // ms
  MAX_OPACITY: 0.3,
  MIN_OPACITY: 0.1,
  LINE_WIDTH: 20,
  COLOR: '255, 255, 0' // Yellow in RGB
} as const

export function useMouseTrail(ctx: Ref<CanvasRenderingContext2D | null>) {
  const trail = ref<TrailPoint[]>([])
  const isFielderDrag = ref(false)

  const addPoint = (x: number, y: number) => {
    if (isFielderDrag.value) return
    
    trail.value.push({
      x,
      y,
      timestamp: Date.now()
    })
  }

  const clearTrail = () => {
    trail.value = []
  }

  const drawTrail = () => {
    if (!ctx.value || isFielderDrag.value || trail.value.length < 2) return
    
    const context = ctx.value
    const currentTime = Date.now()
    
    // Remove old trail points
    trail.value = trail.value.filter(point => 
      currentTime - point.timestamp < TRAIL_CONFIG.FADE_DURATION
    )
    
    context.save()
    
    for (let i = 0; i < trail.value.length - 1; i++) {
      const point = trail.value[i]
      const nextPoint = trail.value[i + 1]
      const age = currentTime - point.timestamp
      const opacity = Math.max(0, 1 - age / TRAIL_CONFIG.FADE_DURATION)
      
      // Create gradient between points
      const gradient = context.createLinearGradient(
        point.x, point.y,
        nextPoint.x, nextPoint.y
      )
      
      gradient.addColorStop(0, `rgba(${TRAIL_CONFIG.COLOR}, ${opacity * TRAIL_CONFIG.MAX_OPACITY})`)
      gradient.addColorStop(1, `rgba(${TRAIL_CONFIG.COLOR}, ${opacity * TRAIL_CONFIG.MIN_OPACITY})`)
      
      // Draw trail segment
      context.beginPath()
      context.moveTo(point.x, point.y)
      context.lineTo(nextPoint.x, nextPoint.y)
      context.lineWidth = TRAIL_CONFIG.LINE_WIDTH * opacity
      context.strokeStyle = gradient
      context.lineCap = 'round'
      context.stroke()
    }
    
    context.restore()
  }

  return {
    addPoint,
    clearTrail,
    drawTrail,
    isFielderDrag
  }
} 