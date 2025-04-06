import { ref } from 'vue'
import type { Ref } from 'vue'
import type { DrawingTool } from '../components/DrawingTools.vue'

interface Point {
  x: number
  y: number
}

interface Shape {
  type: DrawingTool
  startPoint: Point
  endPoint: Point
}

interface DrawingState {
  shapes: Shape[]
  currentShape: Shape | null
}

export function useDrawing(ctx: Ref<CanvasRenderingContext2D | null>) {
  const isDrawing = ref(false)
  const currentTool = ref<DrawingTool>('none')
  const drawingState = ref<DrawingState>({
    shapes: [],
    currentShape: null
  })

  const startDrawing = (x: number, y: number) => {
    if (currentTool.value === 'none' || currentTool.value === 'erase') return
    
    isDrawing.value = true
    drawingState.value.currentShape = {
      type: currentTool.value,
      startPoint: { x, y },
      endPoint: { x, y }
    }
  }

  const draw = (x: number, y: number) => {
    if (!isDrawing.value || !ctx.value || !drawingState.value.currentShape) return
    
    drawingState.value.currentShape.endPoint = { x, y }
    redrawAll()
  }

  const stopDrawing = () => {
    if (isDrawing.value && drawingState.value.currentShape) {
      drawingState.value.shapes.push(drawingState.value.currentShape)
      drawingState.value.currentShape = null
    }
    isDrawing.value = false
  }

  const redrawAll = () => {
    if (!ctx.value) return
    
    const context = ctx.value
    const canvas = context.canvas
    
    // Clear the drawing canvas
    context.clearRect(0, 0, canvas.width, canvas.height)
    
    context.save()
    context.strokeStyle = '#2c3e50'
    context.lineWidth = 4 // Double the line thickness
    
    // Draw all existing shapes
    drawingState.value.shapes.forEach(shape => {
      drawShape(context, shape)
    })
    
    // Draw the current shape being drawn
    if (drawingState.value.currentShape) {
      drawShape(context, drawingState.value.currentShape)
    }
    
    context.restore()
  }

  const drawShape = (context: CanvasRenderingContext2D, shape: Shape) => {
    const { startPoint, endPoint } = shape
    
    switch (shape.type) {
      case 'circle':
        drawCircle(context, startPoint, endPoint)
        break
      case 'line':
        drawLine(context, startPoint, endPoint)
        break
      case 'rectangle':
        drawRectangle(context, startPoint, endPoint)
        break
    }
  }

  const drawCircle = (context: CanvasRenderingContext2D, start: Point, end: Point) => {
    const radius = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    )
    
    context.beginPath()
    context.arc(start.x, start.y, radius, 0, Math.PI * 2)
    context.stroke()
  }

  const drawLine = (context: CanvasRenderingContext2D, start: Point, end: Point) => {
    context.beginPath()
    context.moveTo(start.x, start.y)
    context.lineTo(end.x, end.y)
    context.stroke()
  }

  const drawRectangle = (context: CanvasRenderingContext2D, start: Point, end: Point) => {
    const width = end.x - start.x
    const height = end.y - start.y
    
    context.beginPath()
    context.rect(
      start.x,
      start.y,
      width,
      height
    )
    context.stroke()
  }

  const eraseShape = (x: number, y: number) => {
    if (!ctx.value) return
    
    const context = ctx.value
    const shapes = drawingState.value.shapes
    
    // Find the shape that was clicked
    const clickedShapeIndex = shapes.findIndex(shape => {
      const { startPoint, endPoint } = shape
      
      if (shape.type === 'circle') {
        // For circles, check if point is within the radius
        const radius = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
        )
        const distance = Math.sqrt(
          Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2)
        )
        return distance <= radius
      } else {
        // For lines and rectangles, use bounding box
        const minX = Math.min(startPoint.x, endPoint.x)
        const maxX = Math.max(startPoint.x, endPoint.x)
        const minY = Math.min(startPoint.y, endPoint.y)
        const maxY = Math.max(startPoint.y, endPoint.y)
        
        return x >= minX && x <= maxX && y >= minY && y <= maxY
      }
    })
    
    if (clickedShapeIndex !== -1) {
      shapes.splice(clickedShapeIndex, 1)
      redrawAll()
    }
  }

  const clearDrawing = () => {
    if (!ctx.value) return
    const context = ctx.value
    const canvas = context.canvas
    context.clearRect(0, 0, canvas.width, canvas.height)
    drawingState.value = {
      shapes: [],
      currentShape: null
    }
  }

  return {
    currentTool,
    startDrawing,
    draw,
    stopDrawing,
    clearDrawing,
    eraseShape,
    isDrawing,
    drawingState
  }
} 