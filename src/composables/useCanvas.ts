import { ref, onMounted, onUnmounted } from 'vue'
import { FIELD_DIMENSIONS } from '../constants/dimensions'
import type { FieldingPosition } from '../types/FieldingPosition'
import { FIELDING_POSITIONS } from '../constants/fieldingPositions'
import { cartesianToPolar, polarToCartesian, findClosestPosition, getFieldSetting } from '../utils/fieldingUtils'
import { useMouseTrail } from './useMouseTrail'

export function useCanvas() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const ctx = ref<CanvasRenderingContext2D | null>(null)
  const isDragging = ref(false)
  const selectedPosition = ref<FieldingPosition | null>(null)
  const positions = ref<FieldingPosition[]>(getFieldSetting('odi_powerplay'))
  const currentPhase = ref<'test_attacking' | 'odi_powerplay' | 'death_overs'>('odi_powerplay')
  const dragOffset = ref({ x: 0, y: 0 })
  const showDebugBoundaries = ref(true)

  const { addPoint, clearTrail, drawTrail, isFielderDrag } = useMouseTrail(ctx)

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

  const getPositionColor = (type: FieldingPosition['type'], side: string) => {
    // Base colors for different field sections
    const sectionColors = {
      // Close-in positions (slips, gully, silly point)
      close: {
        off: '#e74c3c', // Red for off-side close positions
        leg: '#e67e22', // Orange for leg-side close positions
        neutral: '#f1c40f' // Yellow for neutral close positions
      },
      // Inner circle positions (point, cover, mid-off, etc.)
      inner: {
        off: '#3498db', // Blue for off-side inner positions
        leg: '#2ecc71', // Green for leg-side inner positions
        neutral: '#9b59b6' // Purple for neutral inner positions
      },
      // Boundary positions
      boundary: {
        off: '#1abc9c', // Teal for off-side boundary positions
        leg: '#16a085', // Darker teal for leg-side boundary positions
        neutral: '#27ae60' // Dark green for neutral boundary positions
      }
    }

    // Determine the section based on distance
    const distance = type === 'mandatory' ? 15 : 30 // Default distance for type-based coloring
    let section: keyof typeof sectionColors = 'inner'
    
    if (distance < 20) {
      section = 'close'
    } else if (distance > 60) {
      section = 'boundary'
    }

    return sectionColors[section][side as keyof typeof sectionColors['close']] || '#95a5a6'
  }

  const drawPositionBoundary = (position: FieldingPosition, centerX: number, centerY: number) => {
    if (!ctx.value) return
    
    const context = ctx.value
    const { distance, angle } = position.polar
    
    // Normalize angles to ensure proper boundary handling
    const normalizedMin = angle.min
    const normalizedMax = angle.max
    const isBoundaryCrossing = normalizedMin > normalizedMax
    
    // Calculate inner and outer radii in pixels
    const innerRadius = distance.min * FIELD_DIMENSIONS.PIXELS_PER_YARD
    const outerRadius = distance.max * FIELD_DIMENSIONS.PIXELS_PER_YARD
    
    // Get color based on position type and side
    const fillColor = getPositionColor(position.type, position.side)
    
    // Draw the arc sector
    if (isBoundaryCrossing) {
      // First arc: from min angle to 360
      context.beginPath()
      context.arc(centerX, centerY, innerRadius, (normalizedMin * Math.PI) / 180, 2 * Math.PI)
      context.arc(centerX, centerY, outerRadius, 2 * Math.PI, (normalizedMin * Math.PI) / 180, true)
      context.closePath()
      context.fillStyle = `${fillColor}20`
      context.fill()
      
      // Second arc: from 0 to max angle
      context.beginPath()
      context.arc(centerX, centerY, innerRadius, 0, (normalizedMax * Math.PI) / 180)
      context.arc(centerX, centerY, outerRadius, (normalizedMax * Math.PI) / 180, 0, true)
      context.closePath()
      context.fillStyle = `${fillColor}20`
      context.fill()
      
      // Draw boundary line at 0/360
      context.beginPath()
      context.moveTo(centerX, centerY - innerRadius)
      context.lineTo(centerX, centerY - outerRadius)
      context.strokeStyle = fillColor
      context.lineWidth = 2
      context.stroke()
    } else {
      context.beginPath()
      context.arc(centerX, centerY, innerRadius, (normalizedMin * Math.PI) / 180, (normalizedMax * Math.PI) / 180)
      context.arc(centerX, centerY, outerRadius, (normalizedMax * Math.PI) / 180, (normalizedMin * Math.PI) / 180, true)
      context.closePath()
      context.fillStyle = `${fillColor}20`
      context.fill()
    }
    
    // Draw boundary lines
    context.strokeStyle = fillColor
    context.lineWidth = 2
    
    // Draw inner and outer arcs
    if (isBoundaryCrossing) {
      // First segment
      context.beginPath()
      context.arc(centerX, centerY, innerRadius, (normalizedMin * Math.PI) / 180, 2 * Math.PI)
      context.stroke()
      context.beginPath()
      context.arc(centerX, centerY, outerRadius, (normalizedMin * Math.PI) / 180, 2 * Math.PI)
      context.stroke()
      
      // Second segment
      context.beginPath()
      context.arc(centerX, centerY, innerRadius, 0, (normalizedMax * Math.PI) / 180)
      context.stroke()
      context.beginPath()
      context.arc(centerX, centerY, outerRadius, 0, (normalizedMax * Math.PI) / 180)
      context.stroke()
    } else {
      context.beginPath()
      context.arc(centerX, centerY, innerRadius, (normalizedMin * Math.PI) / 180, (normalizedMax * Math.PI) / 180)
      context.stroke()
      context.beginPath()
      context.arc(centerX, centerY, outerRadius, (normalizedMin * Math.PI) / 180, (normalizedMax * Math.PI) / 180)
      context.stroke()
    }
    
    // Draw angle lines and labels
    const drawAngleLine = (angleRad: number, radius: number, label: string) => {
      const endX = centerX + radius * Math.sin(angleRad)
      const endY = centerY - radius * Math.cos(angleRad)
      
      context.beginPath()
      context.moveTo(centerX, centerY)
      context.lineTo(endX, endY)
      context.strokeStyle = fillColor
      context.lineWidth = 2
      context.stroke()
      
      // Draw angle label with background
      context.font = '30px Arial'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      
      // Position label beyond the line
      const labelX = endX + 45 * Math.sin(angleRad)
      const labelY = endY - 45 * Math.cos(angleRad)
      
      // Add background for angle label
      const labelText = `${label}°`
      const textMetrics = context.measureText(labelText)
      const padding = 8
      const bgWidth = textMetrics.width + (padding * 2)
      const bgHeight = 36
      
      context.fillStyle = 'rgba(255, 255, 255, 0.8)'
      context.fillRect(
        labelX - (bgWidth / 2),
        labelY - (bgHeight / 2),
        bgWidth,
        bgHeight
      )
      
      context.fillStyle = fillColor
      context.fillText(labelText, labelX, labelY)
    }
    
    // Draw angle lines with labels
    if (isBoundaryCrossing) {
      // Draw min angle line
      drawAngleLine((normalizedMin * Math.PI) / 180, outerRadius, normalizedMin.toString())
      // Draw max angle line
      drawAngleLine((normalizedMax * Math.PI) / 180, outerRadius, normalizedMax.toString())
      // Draw 0/360 line
      drawAngleLine(0, outerRadius, '0')
      drawAngleLine(2 * Math.PI, outerRadius, '360')
    } else {
      drawAngleLine((normalizedMin * Math.PI) / 180, outerRadius, normalizedMin.toString())
      drawAngleLine((normalizedMax * Math.PI) / 180, outerRadius, normalizedMax.toString())
    }
    
    // Calculate midpoint angle for labels
    let midAngleRad: number
    if (isBoundaryCrossing) {
      const totalAngle = (360 - normalizedMin) + normalizedMax
      const midAngle = (normalizedMin + (totalAngle / 2)) % 360
      midAngleRad = (midAngle * Math.PI) / 180
    } else {
      midAngleRad = ((normalizedMin + normalizedMax) / 2) * Math.PI / 180
    }
    
    // Draw position name and distance labels
    context.font = '30px Arial'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    
    // Draw distance labels
    const drawDistanceLabel = (radius: number, label: string) => {
      const x = centerX + radius * Math.sin(midAngleRad)
      const y = centerY - radius * Math.cos(midAngleRad)
      const metrics = context.measureText(label)
      
      context.fillStyle = 'rgba(255, 255, 255, 0.8)'
      context.fillRect(
        x - (metrics.width / 2) - 8,
        y - 18,
        metrics.width + 16,
        36
      )
      context.fillStyle = fillColor
      context.fillText(label, x, y)
    }
    
    drawDistanceLabel(innerRadius, `${distance.min}yd`)
    drawDistanceLabel(outerRadius, `${distance.max}yd`)
    
    // Draw position name
    const labelRadius = (innerRadius + outerRadius) / 2
    const labelX = centerX + labelRadius * Math.sin(midAngleRad)
    const labelY = centerY - labelRadius * Math.cos(midAngleRad)
    
    const text = position.name
    const textMetrics = context.measureText(text)
    const padding = 12
    const backgroundWidth = textMetrics.width + (padding * 2)
    const backgroundHeight = 48
    
    context.font = '36px Arial'
    context.fillStyle = 'rgba(255, 255, 255, 0.8)'
    context.fillRect(
      labelX - (backgroundWidth / 2),
      labelY - (backgroundHeight / 2),
      backgroundWidth,
      backgroundHeight
    )
    
    context.fillStyle = fillColor
    context.fillText(text, labelX, labelY)
  }

  const drawPositions = () => {
    if (!ctx.value || !canvasRef.value) return
    
    const context = ctx.value
    const centerX = FIELD_DIMENSIONS.CENTER_X
    const centerY = FIELD_DIMENSIONS.CENTER_Y
    
    // Draw boundaries for all positions if debug mode is enabled
    if (showDebugBoundaries.value) {
      FIELDING_POSITIONS.forEach(position => {
        drawPositionBoundary(position, centerX, centerY)
      })
    }
    
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
      
      // Calculate drag offset
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

    // Add point to trail
    addPoint(coords.x, coords.y)
    
    if (isDragging.value && selectedPosition.value) {
      const adjustedX = coords.x - dragOffset.value.x
      const adjustedY = coords.y - dragOffset.value.y
      
      const centerX = FIELD_DIMENSIONS.CENTER_X
      const centerY = FIELD_DIMENSIONS.CENTER_Y
      
      // Convert mouse position to coordinates relative to center
      const cartesian = {
        x: adjustedX - centerX,
        y: adjustedY - centerY
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
    }
    
    redraw()
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
    initCanvas,
    showDebugBoundaries
  }
} 