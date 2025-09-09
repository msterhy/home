<template>
  <div class="range">
    <input type="date" :value="modelValue.start" @input="onStart($event.target.value)" />
    <span class="sep">—</span>
    <input type="date" :value="modelValue.end" @input="onEnd($event.target.value)" />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, default: () => ({ start: '', end: '' }) }
})
const emit = defineEmits(['update:modelValue'])

function onStart(v) {
  emit('update:modelValue', { ...(props.modelValue || {}), start: v })
}
function onEnd(v) {
  emit('update:modelValue', { ...(props.modelValue || {}), end: v })
}
</script>

<style scoped>
.range { display: inline-flex; align-items: center; gap: 6px; }
.sep { color: #9ca3af; }
input { width: 140px; }
</style>


