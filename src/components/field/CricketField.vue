<template>
  <div class="cricket-field-container">
    <img src="/images/cric.png" class="background-image" alt="Cricket field background" />
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
    <div class="cricket-field-wrapper">
      <canvas
        ref="canvasRef"
        class="cricket-field"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useCanvas } from '../../composables/useCanvas'

type FieldPhase = 'test_attacking' | 'odi_powerplay' | 'death_overs'
const { 
  canvasRef, 
  handleMouseDown, 
  handleMouseMove, 
  handleMouseUp, 
  redraw, 
  setFieldPhase,
  showDebugBoundaries 
} = useCanvas()

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
  redraw()
}

watch(canvasRef, () => {
  if (canvasRef.value) {
    redraw()
  }
})

onMounted(() => {
  redraw()
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
  width: 100%;
  height: 100%;
  cursor: pointer;
  image-rendering: crisp-edges;
  background-color: transparent;
  mix-blend-mode: multiply;
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
</style> 