import { ref, onMounted, onUnmounted } from 'vue'
import { FIELD_DIMENSIONS } from '../constants/dimensions'
import type { FieldingPosition } from '../types/FieldingPosition'
import { FIELDING_POSITIONS } from '../constants/fieldingPositions'
import { cartesianToPolar, polarToCartesian, findClosestPosition, getFieldSetting } from '../utils/fieldingUtils'
import { useMouseTrail } from './useMouseTrail'

// Constants
const MARKER_RADIUS = 10
const CLICK_RADIUS = 15
const TEXT_PADDING = 8
const BACKGROUND_HEIGHT = 40
const TEXT_OFFSET = 20

// Type definitions
type FieldPhase = 'test_attacking' | 'odi_powerplay' | 'death_overs'

export function useCanvas() {
  // State
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const ctx = ref<CanvasRenderingContext2D | null>(null)
  const isDragging = ref(false)
  const selectedPosition = ref<FieldingPosition | null>(null)
  const positions = ref<FieldingPosition[]>(getFieldSetting('odi_powerplay'))
  const currentPhase = ref<FieldPhase>('odi_powerplay')
  const dragOffset = ref({ x: 0, y: 0 })
  const showDebugBoundaries = ref(true)

  // Mouse trail composable
  const { addPoint, clearTrail, drawTrail, isFielderDrag } = useMouseTrail(ctx)

  // Canvas initialization and cleanup
  const initCanvas = () => {
    if (!canvasRef.value) return
    
    const canvas = canvasRef.value
    ctx.value = canvas.getContext('2d')
    
    if (!ctx.value) return

    canvas.width = FIELD_DIMENSIONS.CANVAS_WIDTH
    canvas.height = FIELD_DIMENSIONS.CANVAS_HEIGHT
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    
    redraw()
  }

  const cleanup = () => {
    if (!canvasRef.value) return
    const canvas = canvasRef.value
    canvas.removeEventListener('mousedown', handleMouseDown)
    canvas.removeEventListener('mousemove', handleMouseMove)
    canvas.removeEventListener('mouseup', handleMouseUp)
    canvas.removeEventListener('mouseleave', handleMouseUp)
  }

  // Field phase management
  const setFieldPhase = (phase: FieldPhase) => {
    currentPhase.value = phase
    positions.value = getFieldSetting(phase)
    redraw()
  }

  // Drawing functions
  const redraw = () => {
    drawField()
    drawTrail()
    drawPositions()
  }

  const drawField = () => {
    if (!ctx.value || !canvasRef.value) return
    
    const context = ctx.value
    const canvas = canvasRef.value
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.save()
    
    // Calculate dimensions in pixels
    const centerX = FIELD_DIMENSIONS.CENTER_X
    const centerY = FIELD_DIMENSIONS.CENTER_Y
    const boundaryRadius = FIELD_DIMENSIONS.BOUNDARY_RADIUS * FIELD_DIMENSIONS.PIXELS_PER_YARD
    const innerCircleRadius = FIELD_DIMENSIONS.INNER_CIRCLE_RADIUS * FIELD_DIMENSIONS.PIXELS_PER_YARD
    
    // Draw field background
    drawFieldBackground(context, centerX, centerY, boundaryRadius)
    
    // Draw boundary and inner circle
    drawBoundary(context, centerX, centerY, boundaryRadius, innerCircleRadius)
    
    // Draw pitch
    drawPitch(context, centerX, centerY)
    
    context.restore()
  }

  const drawFieldBackground = (context: CanvasRenderingContext2D, centerX: number, centerY: number, boundaryRadius: number) => {
    const fieldGradient = context.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, boundaryRadius
    )
    
    fieldGradient.addColorStop(0, '#9ed16f')
    fieldGradient.addColorStop(0.2, '#8fc966')
    fieldGradient.addColorStop(0.4, '#7fb858')
    fieldGradient.addColorStop(0.7, '#6fa849')
    fieldGradient.addColorStop(1, '#5c8c3c')
    
    context.beginPath()
    context.arc(centerX, centerY, boundaryRadius, 0, Math.PI * 2)
    context.fillStyle = fieldGradient
    context.fill()
    
    // Add grass pattern
    const patternSize = 30
    context.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    context.lineWidth = 1
    
    for (let i = -boundaryRadius; i < boundaryRadius; i += patternSize) {
      context.beginPath()
      context.moveTo(centerX - boundaryRadius, centerY + i)
      context.lineTo(centerX + boundaryRadius, centerY + i)
      context.stroke()
    }
  }

  const drawBoundary = (context: CanvasRenderingContext2D, centerX: number, centerY: number, boundaryRadius: number, innerCircleRadius: number) => {
    // Draw boundary rope
    context.beginPath()
    context.arc(centerX, centerY, boundaryRadius - 2, 0, Math.PI * 2)
    context.strokeStyle = '#ffffff'
    context.lineWidth = 4
    context.stroke()
    
    // Draw 30-yard circle
    context.beginPath()
    context.arc(centerX, centerY, innerCircleRadius, 0, Math.PI * 2)
    context.strokeStyle = '#ffffff'
    context.setLineDash([10, 10])
    context.lineWidth = currentPhase.value === 'odi_powerplay' ? 3 : 2
    context.stroke()
    context.setLineDash([])
  }

  const drawPitch = (context: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    const pitchWidth = FIELD_DIMENSIONS.PITCH_WIDTH * FIELD_DIMENSIONS.PIXELS_PER_YARD
    const pitchLength = FIELD_DIMENSIONS.PITCH_LENGTH * FIELD_DIMENSIONS.PIXELS_PER_YARD
    
    // Draw main pitch area
    const pitchGradient = context.createLinearGradient(
      centerX - pitchWidth / 2,
      centerY - pitchLength / 2,
      centerX + pitchWidth / 2,
      centerY + pitchLength / 2
    )
    pitchGradient.addColorStop(0, '#d4b590')
    pitchGradient.addColorStop(0.5, '#c4a484')
    pitchGradient.addColorStop(1, '#d4b590')
    
    context.beginPath()
    context.rect(
      centerX - pitchWidth / 2,
      centerY - pitchLength / 2,
      pitchWidth,
      pitchLength
    )
    context.fillStyle = pitchGradient
    context.fill()
    context.strokeStyle = '#8b4513'
    context.lineWidth = 2
    context.stroke()
    
    // Draw crease lines
    const creaseWidth = pitchWidth * 1.2
    const creaseLength = pitchWidth * 0.2
    const poppingCreaseOffset = pitchWidth * 0.3
    
    context.strokeStyle = '#ffffff'
    context.lineWidth = 2
    
    // Draw creases
    drawCrease(context, centerX, centerY, creaseWidth, pitchLength, -1) // Top crease
    drawCrease(context, centerX, centerY, creaseWidth, pitchLength, 1)  // Bottom crease
    
    // Draw popping creases
    drawPoppingCrease(context, centerX, centerY, creaseWidth, pitchLength, poppingCreaseOffset, -1) // Top popping crease
    drawPoppingCrease(context, centerX, centerY, creaseWidth, pitchLength, poppingCreaseOffset, 1)  // Bottom popping crease
  }

  const drawCrease = (context: CanvasRenderingContext2D, centerX: number, centerY: number, creaseWidth: number, pitchLength: number, direction: number) => {
    context.beginPath()
    context.moveTo(centerX - creaseWidth/2, centerY + (direction * pitchLength/2))
    context.lineTo(centerX + creaseWidth/2, centerY + (direction * pitchLength/2))
    context.stroke()
  }

  const drawPoppingCrease = (context: CanvasRenderingContext2D, centerX: number, centerY: number, creaseWidth: number, pitchLength: number, offset: number, direction: number) => {
    context.beginPath()
    context.moveTo(centerX - creaseWidth/2, centerY + (direction * pitchLength/2) + (direction * offset))
    context.lineTo(centerX + creaseWidth/2, centerY + (direction * pitchLength/2) + (direction * offset))
    context.stroke()
  }

  // Position drawing functions
  const drawPositions = () => {
    if (!ctx.value || !canvasRef.value) return
    
    const context = ctx.value
    const centerX = FIELD_DIMENSIONS.CENTER_X
    const centerY = FIELD_DIMENSIONS.CENTER_Y
    
    // Draw only the active fielders
    positions.value.forEach(position => {
      const cartesian = polarToCartesian(position.polar, centerX, centerY)
      drawFielder(cartesian.x, cartesian.y, getPositionColor(position.type, position.side), position.id, position.name)
    })
  }

  const drawFielder = (x: number, y: number, color: string, id: string, name: string) => {
    if (!ctx.value) return
    
    const context = ctx.value
    const isSelected = selectedPosition.value?.id === id
    
    // Draw position name
    drawFielderLabel(context, x, y, name)
    
    // Draw fielder marker
    context.beginPath()
    context.arc(x, y, MARKER_RADIUS * (isSelected ? 1.2 : 1), 0, Math.PI * 2)
    context.fillStyle = color
    context.fill()
    
    if (isSelected) {
      context.strokeStyle = '#2c3e50'
      context.lineWidth = 2
      context.stroke()
    }
  }

  const drawFielderLabel = (context: CanvasRenderingContext2D, x: number, y: number, name: string) => {
    context.font = 'bold 28px Arial'
    context.textAlign = 'center'
    context.textBaseline = 'bottom'
    
    const textMetrics = context.measureText(name)
    const backgroundWidth = textMetrics.width + (TEXT_PADDING * 2)
    
    // Draw background
    context.fillStyle = 'rgba(255, 255, 255, 0.8)'
    context.fillRect(
      x - (backgroundWidth / 2),
      y - TEXT_OFFSET - BACKGROUND_HEIGHT,
      backgroundWidth,
      BACKGROUND_HEIGHT
    )
    
    // Draw text
    context.fillStyle = '#2c3e50'
    context.fillText(name, x, y - TEXT_OFFSET)
  }

  // Color management
  const getPositionColor = (type: FieldingPosition['type'], side: string) => {
    const sectionColors = {
      close: {
        off: '#e74c3c',
        leg: '#e67e22',
        neutral: '#f1c40f'
      },
      inner: {
        off: '#3498db',
        leg: '#2ecc71',
        neutral: '#9b59b6'
      },
      boundary: {
        off: '#1abc9c',
        leg: '#16a085',
        neutral: '#27ae60'
      }
    }

    const distance = type === 'mandatory' ? 15 : 30
    let section: keyof typeof sectionColors = 'inner'
    
    if (distance < 20) {
      section = 'close'
    } else if (distance > 60) {
      section = 'boundary'
    }

    return sectionColors[section][side as keyof typeof sectionColors['close']] || '#95a5a6'
  }

  // Mouse event handlers
  const getCanvasCoordinates = (event: MouseEvent) => {
    if (!canvasRef.value) return null
    
    const canvas = canvasRef.value
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    }
  }

  const handleMouseDown = (event: MouseEvent) => {
    const coords = getCanvasCoordinates(event)
    if (!coords) return
    
    const clickedPosition = findClickedPosition(coords.x, coords.y)
    if (clickedPosition) {
      isDragging.value = true
      isFielderDrag.value = true
      selectedPosition.value = clickedPosition
      
      const cartesian = polarToCartesian(clickedPosition.polar, FIELD_DIMENSIONS.CENTER_X, FIELD_DIMENSIONS.CENTER_Y)
      dragOffset.value = {
        x: coords.x - cartesian.x,
        y: coords.y - cartesian.y
      }
    } else {
      isFielderDrag.value = false
    }
    
    redraw()
  }

  const handleMouseMove = (event: MouseEvent) => {
    const coords = getCanvasCoordinates(event)
    if (!coords) return

    addPoint(coords.x, coords.y)
    
    if (isDragging.value && selectedPosition.value) {
      updateFielderPosition(coords)
    }
    
    redraw()
  }

  const updateFielderPosition = (coords: { x: number, y: number }) => {
    const adjustedX = coords.x - dragOffset.value.x
    const adjustedY = coords.y - dragOffset.value.y
    
    const centerX = FIELD_DIMENSIONS.CENTER_X
    const centerY = FIELD_DIMENSIONS.CENTER_Y
    
    const cartesian = {
      x: adjustedX - centerX,
      y: adjustedY - centerY
    }
    
    const distanceFromCenter = Math.sqrt(cartesian.x * cartesian.x + cartesian.y * cartesian.y)
    const maxDistance = FIELD_DIMENSIONS.BOUNDARY_RADIUS * FIELD_DIMENSIONS.PIXELS_PER_YARD
    
    if (distanceFromCenter > maxDistance) {
      const scale = maxDistance / distanceFromCenter
      cartesian.x *= scale
      cartesian.y *= scale
    }
    
    const polar = cartesianToPolar(cartesian, 0, 0)
    const closestPosition = findClosestPosition(polar)
    
    const positionIndex = positions.value.findIndex(p => p.id === selectedPosition.value?.id)
    if (positionIndex !== -1) {
      positions.value[positionIndex] = {
        ...positions.value[positionIndex],
        polar,
        name: closestPosition?.name || positions.value[positionIndex].name
      }
    }
  }

  const handleMouseUp = () => {
    isDragging.value = false
    isFielderDrag.value = false
    selectedPosition.value = null
    dragOffset.value = { x: 0, y: 0 }
    clearTrail()
    redraw()
  }

  const findClickedPosition = (x: number, y: number): FieldingPosition | null => {
    if (!ctx.value) return null
    
    const centerX = FIELD_DIMENSIONS.CENTER_X
    const centerY = FIELD_DIMENSIONS.CENTER_Y
    
    for (const position of positions.value) {
      const cartesian = polarToCartesian(position.polar, centerX, centerY)
      const distance = Math.sqrt(
        Math.pow(x - cartesian.x, 2) + Math.pow(y - cartesian.y, 2)
      )
      
      if (distance <= CLICK_RADIUS) {
        return position
      }
    }
    
    return null
  }

  // Lifecycle hooks
  onMounted(() => {
    initCanvas()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    canvasRef,
    ctx,
    positions,
    currentPhase,
    setFieldPhase,
    initCanvas,
    showDebugBoundaries,
    getCanvasCoordinates,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    redraw
  }
} 