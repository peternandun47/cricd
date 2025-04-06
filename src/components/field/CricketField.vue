<template>
  <div class="cricket-field-container">
    <img src="/images/cric.png" class="background-image" alt="Cricket field background" />
    <DrawingTools ref="drawingToolsRef" @reset="clearDrawing" />
    <div class="phase-selector">
      <button 
        v-for="phase in phases" 
        :key="phase.value"
        :class="{ active: currentPhase === phase.value }"
        @click="setPhase(phase.value)"
      >
        {{ phase.label }}
      </button>
      <button 
        class="debug-toggle"
        :class="{ active: showDebugBoundaries }"
        @click="toggleDebugBoundaries"
      >
        {{ showDebugBoundaries ? 'Hide Boundaries' : 'Show Boundaries' }}
      </button>
    </div>
    <div class="cricket-field-wrapper" :data-mode="currentMode">
      <!-- Base canvas for cricket field -->
      <canvas
        ref="canvasRef"
        class="cricket-field"
        @mousedown="handleFieldingInteractionDown"
        @mousemove="handleFieldingInteractionMove"
        @mouseup="handleFieldingInteractionUp"
        @mouseleave="handleFieldingInteractionUp"
      />
      <!-- Overlay canvas for drawing -->
      <canvas
        ref="drawingCanvasRef"
        :class="['drawing-canvas', { 'drawing-active': isDrawMode }]"
        @mousedown="handleDrawingMouseDown"
        @mousemove="handleDrawingMouseMove"
        @mouseup="handleDrawingMouseUp"
        @mouseleave="handleDrawingMouseUp"
      />
      <!-- Mode indicator -->
      <div class="mode-indicator" @click="toggleMode">
        {{ currentMode === 'drawing' ? 'Drawing Mode' : 'Fielding Mode' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, computed } from 'vue'
import { useCanvas } from '../../composables/useCanvas'
import { useDrawing } from '../../composables/useDrawing'
import DrawingTools from '../DrawingTools.vue'

type FieldPhase = 'test_attacking' | 'odi_powerplay' | 'death_overs'

// Cricket field canvas setup
const { 
  canvasRef, 
  redraw: redrawField, 
  setFieldPhase,
  showDebugBoundaries,
  handleMouseDown: handleFieldingMouseDown,
  handleMouseMove: handleFieldingMouseMove,
  handleMouseUp: handleFieldingMouseUp,
} = useCanvas()

// Drawing canvas setup
const drawingCanvasRef = ref<HTMLCanvasElement | null>(null)
const drawingCtx = ref<CanvasRenderingContext2D | null>(null)
const drawingToolsRef = ref<InstanceType<typeof DrawingTools> | null>(null)

// Initialize drawing canvas
const initDrawingCanvas = () => {
  if (!drawingCanvasRef.value) return
  
  const canvas = drawingCanvasRef.value
  const context = canvas.getContext('2d')
  
  if (!context) return
  
  // Match canvas size with cricket field canvas
  canvas.width = 1500 // Match FIELD_DIMENSIONS.CANVAS_WIDTH
  canvas.height = 1500 // Match FIELD_DIMENSIONS.CANVAS_HEIGHT
  
  drawingCtx.value = context
}

// Drawing functionality
const { 
  currentTool, 
  startDrawing, 
  draw, 
  stopDrawing, 
  isDrawing,
  eraseShape,
  clearDrawing
} = useDrawing(drawingCtx)

// Mouse event handlers for drawing
const getDrawingCoordinates = (event: MouseEvent) => {
  if (!drawingCanvasRef.value) return null
  
  const canvas = drawingCanvasRef.value
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  }
}

// Mouse event handlers for fielding
const getFieldingCoordinates = (event: MouseEvent) => {
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

// Drawing mode state
const isDrawMode = ref(false)

// Toggle between drawing and fielding modes
const toggleMode = () => {
  isDrawMode.value = !isDrawMode.value
  if (!isDrawMode.value) {
    // Reset drawing tool when switching to fielding mode
    if (drawingToolsRef.value) {
      drawingToolsRef.value.currentTool = 'none'
    }
  }
}

// Watch for tool changes
watch(() => drawingToolsRef.value?.currentTool, (newTool) => {
  if (newTool) {
    currentTool.value = newTool
    isDrawMode.value = newTool !== 'none'
  }
})

// Update the template to show current mode
const currentMode = computed(() => isDrawMode.value ? 'drawing' : 'fielding')

const handleDrawingMouseDown = (event: MouseEvent) => {
  if (!isDrawMode.value) return
  
  const coords = getDrawingCoordinates(event)
  if (!coords) return
  
  if (currentTool.value === 'erase') {
    eraseShape(coords.x, coords.y)
  } else {
    startDrawing(coords.x, coords.y)
  }
}

const handleDrawingMouseMove = (event: MouseEvent) => {
  if (!isDrawMode.value) return
  
  const coords = getDrawingCoordinates(event)
  if (!coords) return
  
  if (isDrawing.value) {
    draw(coords.x, coords.y)
  }
}

const handleDrawingMouseUp = () => {
  if (!isDrawMode.value) return
  stopDrawing()
}

// Fielding state
const isFieldingActive = ref(false)

const handleFieldingInteractionDown = (event: MouseEvent) => {
  if (isDrawMode.value) return
  handleFieldingMouseDown(event)
}

const handleFieldingInteractionMove = (event: MouseEvent) => {
  if (isDrawMode.value) return
  handleFieldingMouseMove(event)
}

const handleFieldingInteractionUp = () => {
  if (isDrawMode.value) return
  handleFieldingMouseUp()
}

// Setup and lifecycle
const currentPhase = ref<FieldPhase>('odi_powerplay')

const phases = [
  { value: 'test_attacking' as const, label: 'Test (Attacking)' },
  { value: 'odi_powerplay' as const, label: 'ODI Powerplay' },
  { value: 'death_overs' as const, label: 'Death Overs' }
]

const setPhase = (phase: FieldPhase) => {
  currentPhase.value = phase
  setFieldPhase(phase)
}

const toggleDebugBoundaries = () => {
  showDebugBoundaries.value = !showDebugBoundaries.value
  redrawField()
}

onMounted(() => {
  initDrawingCanvas()
  redrawField()
})
</script>

<style scoped>
.cricket-field-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  overflow: hidden;
  position: relative;
  background-color: black;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 1;
}

.phase-selector {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 0.75rem;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 180px;
}

.phase-selector button {
  padding: 0.75rem 1.25rem;
  border: 2px solid #2c3e50;
  border-radius: 6px;
  background-color: white;
  color: #2c3e50;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  text-align: left;
  width: 100%;
  letter-spacing: 0.5px;
}

.phase-selector button:hover {
  background-color: #2c3e50;
  color: white;
  transform: translateX(-4px);
}

.phase-selector button.active {
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.cricket-field-wrapper {
  width: 95vh;
  height: 95vh;
  max-width: 95vw;
  max-height: 95vw;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
}

.cricket-field {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  image-rendering: crisp-edges;
  background-color: transparent;
  mix-blend-mode: multiply;
}

.drawing-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  z-index: 2;
  pointer-events: none;
}

.drawing-canvas.drawing-active {
  pointer-events: auto;
}

.debug-toggle {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: 2px solid #e74c3c;
  border-radius: 6px;
  background-color: white;
  color: #e74c3c;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  text-align: center;
  width: 100%;
}

.debug-toggle:hover {
  background-color: #e74c3c;
  color: white;
  transform: translateX(-4px);
}

.debug-toggle.active {
  background-color: #e74c3c;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Update mode indicator styles */
.mode-indicator {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  z-index: 3;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.mode-indicator:hover {
  background-color: #2c3e50;
  color: white;
  transform: translateY(-2px);
}

/* Remove the old mode indicator styles */
.cricket-field-wrapper::after {
  display: none;
}

.cricket-field-wrapper[data-mode="drawing"]::after,
.cricket-field-wrapper[data-mode="fielding"]::after {
  display: none;
}
</style> 