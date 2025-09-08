<template>
  <div class="range">
    <input type="date" :value="start" @input="update('start', $event.target.value)" />
    <span>—</span>
    <input type="date" :value="end" @input="update('end', $event.target.value)" />
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: Object, default: () => ({ start: '', end: '' }) } })
const emit = defineEmits(['update:modelValue'])

const start = computed(() => props.modelValue?.start || '')
const end = computed(() => props.modelValue?.end || '')

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<style scoped>
.range { display: inline-flex; align-items: center; gap: 6px; }
</style>


