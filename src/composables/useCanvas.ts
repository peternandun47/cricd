import { ref, onMounted, onUnmounted } from 'vue'
import { FIELD_DIMENSIONS } from '../constants/dimensions'
import type { FieldingPosition } from '../types/FieldingPosition'
import { FIELDING_POSITIONS } from '../constants/fieldingPositions'
import { cartesianToPolar, polarToCartesian, findClosestPosition, getFieldSetting } from '../utils/fieldingUtils'

export function useCanvas() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const ctx = ref<CanvasRenderingContext2D | null>(null)
  const isDragging = ref(false)
  const selectedPosition = ref<FieldingPosition | null>(null)
  const positions = ref<FieldingPosition[]>(getFieldSetting('odi_powerplay'))
  const currentPhase = ref<'test_attacking' | 'odi_powerplay' | 'death_overs'>('odi_powerplay')
  const dragOffset = ref({ x: 0, y: 0 })

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

  const setFieldPhase = (phase: 'test_attacking' | 'odi_powerplay' | 'death_overs') => {
    currentPhase.value = phase
    positions.value = getFieldSetting(phase)
    redraw()
  }

  const redraw = () => {
    drawField()
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
    
    // Create radial gradient for the field
    const fieldGradient = context.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, boundaryRadius
    )
    // More natural grass look with multiple color stops
    fieldGradient.addColorStop(0, '#9ed16f')    // Lighter green in center
    fieldGradient.addColorStop(0.2, '#8fc966')  // Transition
    fieldGradient.addColorStop(0.4, '#7fb858')  // Mid green
    fieldGradient.addColorStop(0.7, '#6fa849')  // Darker transition
    fieldGradient.addColorStop(1, '#5c8c3c')    // Darkest at boundary
    
    // Draw field background
    context.beginPath()
    context.arc(centerX, centerY, boundaryRadius, 0, Math.PI * 2)
    context.fillStyle = fieldGradient
    context.fill()
    
    // Add subtle grass pattern
    const patternSize = 30
    context.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    context.lineWidth = 1
    
    // Draw alternating pattern
    for (let i = -boundaryRadius; i < boundaryRadius; i += patternSize) {
      context.beginPath()
      context.moveTo(centerX - boundaryRadius, centerY + i)
      context.lineTo(centerX + boundaryRadius, centerY + i)
      context.stroke()
    }
    
    // Draw boundary rope effect
    context.beginPath()
    context.arc(centerX, centerY, boundaryRadius - 2, 0, Math.PI * 2)
    context.strokeStyle = '#ffffff'
    context.lineWidth = 4
    context.stroke()
    
    // Draw 30-yard circle with enhanced style
    context.beginPath()
    context.arc(centerX, centerY, innerCircleRadius, 0, Math.PI * 2)
    context.strokeStyle = '#ffffff'
    context.setLineDash([10, 10])
    context.lineWidth = currentPhase.value === 'odi_powerplay' ? 3 : 2
    context.stroke()
    
    // Reset line dash
    context.setLineDash([])
    
    // Draw pitch with enhanced detail
    const pitchWidth = FIELD_DIMENSIONS.PITCH_WIDTH * FIELD_DIMENSIONS.PIXELS_PER_YARD
    const pitchLength = FIELD_DIMENSIONS.PITCH_LENGTH * FIELD_DIMENSIONS.PIXELS_PER_YARD
    
    // Pitch gradient
    const pitchGradient = context.createLinearGradient(
      centerX - pitchWidth / 2,
      centerY - pitchLength / 2,
      centerX + pitchWidth / 2,
      centerY + pitchLength / 2
    )
    pitchGradient.addColorStop(0, '#d4b590')
    pitchGradient.addColorStop(0.5, '#c4a484')
    pitchGradient.addColorStop(1, '#d4b590')
    
    // Draw main pitch area
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
    const creaseWidth = pitchWidth * 1.2 // Slightly wider than pitch
    const creaseLength = pitchWidth * 0.2 // Short perpendicular lines
    
    // Batting crease lines
    context.strokeStyle = '#ffffff'
    context.lineWidth = 2
    
    // Top crease
    context.beginPath()
    context.moveTo(centerX - creaseWidth/2, centerY - pitchLength/2)
    context.lineTo(centerX + creaseWidth/2, centerY - pitchLength/2)
    context.stroke()
    
    // Bottom crease
    context.beginPath()
    context.moveTo(centerX - creaseWidth/2, centerY + pitchLength/2)
    context.lineTo(centerX + creaseWidth/2, centerY + pitchLength/2)
    context.stroke()
    
    // Draw popping crease lines
    const poppingCreaseOffset = pitchWidth * 0.3
    
    // Top popping crease
    context.beginPath()
    context.moveTo(centerX - creaseWidth/2, centerY - pitchLength/2 + poppingCreaseOffset)
    context.lineTo(centerX + creaseWidth/2, centerY - pitchLength/2 + poppingCreaseOffset)
    context.stroke()
    
    // Bottom popping crease
    context.beginPath()
    context.moveTo(centerX - creaseWidth/2, centerY + pitchLength/2 - poppingCreaseOffset)
    context.lineTo(centerX + creaseWidth/2, centerY + pitchLength/2 - poppingCreaseOffset)
    context.stroke()
    
    context.restore()
  }

  const drawPositions = () => {
    if (!ctx.value || !canvasRef.value) return
    
    const context = ctx.value
    const centerX = FIELD_DIMENSIONS.CENTER_X
    const centerY = FIELD_DIMENSIONS.CENTER_Y
    
    // Draw all positions
    positions.value.forEach(position => {
      const cartesian = polarToCartesian(position.polar, centerX, centerY)
      drawFielder(cartesian.x, cartesian.y, getPositionColor(position.type), position.id, position.name)
    })
  }

  const drawFielder = (x: number, y: number, color: string, id: string, name: string) => {
    if (!ctx.value) return
    
    const context = ctx.value
    const isSelected = selectedPosition.value?.id === id
    const markerRadius = 10
    
    // Draw position name first (above the marker)
    context.font = 'bold 28px Arial'
    context.textAlign = 'center'
    context.textBaseline = 'bottom'  // Changed from 'top' to 'bottom'
    context.fillStyle = '#2c3e50'
    
    // Add background for better readability
    const text = name
    const textMetrics = context.measureText(text)
    const padding = 8
    const backgroundWidth = textMetrics.width + (padding * 2)
    const backgroundHeight = 40
    
    context.fillStyle = 'rgba(255, 255, 255, 0.8)'
    context.fillRect(
      x - (backgroundWidth / 2),
      y - 20 - backgroundHeight,  // Position above the marker
      backgroundWidth,
      backgroundHeight
    )
    
    // Draw the text
    context.fillStyle = '#2c3e50'
    context.fillText(text, x, y - 20)  // Position above the marker
    
    // Draw fielder marker
    context.beginPath()
    context.arc(x, y, markerRadius * (isSelected ? 1.2 : 1), 0, Math.PI * 2)
    context.fillStyle = color
    context.fill()
    if (isSelected) {
      context.strokeStyle = '#2c3e50'
      context.lineWidth = 2
      context.stroke()
    }
  }

  const getPositionColor = (type: FieldingPosition['type']) => {
    switch (type) {
      case 'mandatory':
        return '#2ecc71'
      case 'primary':
        return '#e74c3c'
      case 'variation':
        return '#f39c12'
      default:
        return '#3498db'
    }
  }

  const handleMouseDown = (event: MouseEvent) => {
    if (!canvasRef.value) return
    
    const canvas = canvasRef.value
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY
    
    const clickedPosition = findClickedPosition(x, y)
    if (clickedPosition) {
      isDragging.value = true
      selectedPosition.value = clickedPosition
      
      // Calculate drag offset
      const cartesian = polarToCartesian(clickedPosition.polar, FIELD_DIMENSIONS.CENTER_X, FIELD_DIMENSIONS.CENTER_Y)
      dragOffset.value = {
        x: x - cartesian.x,
        y: y - cartesian.y
      }
      
      redraw()
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.value || !selectedPosition.value || !canvasRef.value) return
    
    const canvas = canvasRef.value
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (event.clientX - rect.left) * scaleX - dragOffset.value.x
    const y = (event.clientY - rect.top) * scaleY - dragOffset.value.y
    
    const centerX = FIELD_DIMENSIONS.CENTER_X
    const centerY = FIELD_DIMENSIONS.CENTER_Y
    
    // Convert mouse position to coordinates relative to center
    const cartesian = {
      x: x - centerX,
      y: y - centerY
    }
    
    // Calculate distance from center
    const distanceFromCenter = Math.sqrt(cartesian.x * cartesian.x + cartesian.y * cartesian.y)
    const maxDistance = FIELD_DIMENSIONS.BOUNDARY_RADIUS * FIELD_DIMENSIONS.PIXELS_PER_YARD
    
    // If outside boundary, scale position to boundary
    if (distanceFromCenter > maxDistance) {
      const scale = maxDistance / distanceFromCenter
      cartesian.x *= scale
      cartesian.y *= scale
    }
    
    // Convert to polar coordinates
    const polar = cartesianToPolar(cartesian, 0, 0)
    
    // Find closest standard position to get the name
    const closestPosition = findClosestPosition(polar)
    
    // Update the position
    const positionIndex = positions.value.findIndex(p => p.id === selectedPosition.value?.id)
    if (positionIndex !== -1) {
      positions.value[positionIndex] = {
        ...positions.value[positionIndex],
        polar,
        name: closestPosition?.name || positions.value[positionIndex].name
      }
    }
    
    redraw()
  }

  const handleMouseUp = () => {
    isDragging.value = false
    selectedPosition.value = null
    dragOffset.value = { x: 0, y: 0 }
    redraw()
  }

  const findClickedPosition = (x: number, y: number): FieldingPosition | null => {
    if (!ctx.value) return null
    
    const centerX = FIELD_DIMENSIONS.CENTER_X
    const centerY = FIELD_DIMENSIONS.CENTER_Y
    
    // Check each position
    for (const position of positions.value) {
      const cartesian = polarToCartesian(position.polar, centerX, centerY)
      const distance = Math.sqrt(
        Math.pow(x - cartesian.x, 2) + Math.pow(y - cartesian.y, 2)
      )
      
      if (distance <= 15) { // Click radius
        return position
      }
    }
    
    return null
  }

  onMounted(() => {
    initCanvas()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    canvasRef,
    positions,
    currentPhase,
    setFieldPhase,
    initCanvas
  }
} 