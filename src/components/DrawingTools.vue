<template>
  <div class="drawing-tools-panel">
    <button 
      v-for="tool in drawingTools" 
      :key="tool.type"
      :class="{ active: currentTool === tool.type }"
      @click="selectTool(tool.type)"
    >
      {{ tool.label }}
    </button>
    <button 
      class="erase-button"
      :class="{ active: currentTool === 'erase' }"
      @click="selectTool('erase')"
    >
      Erase
    </button>
    <button 
      class="reset-button"
      @click="resetAll"
    >
      Reset All
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export type DrawingTool = 'circle' | 'line' | 'rectangle' | 'erase' | 'none'

const drawingTools = [
  { type: 'circle' as const, label: 'Circle' },
  { type: 'line' as const, label: 'Line' },
  { type: 'rectangle' as const, label: 'Rectangle' }
]

const currentTool = ref<DrawingTool>('none')

const selectTool = (tool: DrawingTool) => {
  currentTool.value = currentTool.value === tool ? 'none' : tool
}

const resetAll = () => {
  currentTool.value = 'none'
  emit('reset')
}

const emit = defineEmits<{
  (e: 'reset'): void
}>()

defineExpose({
  currentTool
})
</script>

<style scoped>
.drawing-tools-panel {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 0.75rem;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button {
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
  min-width: 120px;
}

button:hover {
  background-color: #2c3e50;
  color: white;
  transform: translateX(4px);
}

button.active {
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.erase-button {
  border-color: #e74c3c;
  color: #e74c3c;
}

.erase-button:hover,
.erase-button.active {
  background-color: #e74c3c;
  color: white;
}

.reset-button {
  border-color: #3498db;
  color: #3498db;
  margin-top: 0.5rem;
}

.reset-button:hover {
  background-color: #3498db;
  color: white;
}
</style> 