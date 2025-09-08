<template>
  <input type="number" :value="modelValue" @input="onInput($event.target.value)" step="0.01" />
</template>

<script setup>
const props = defineProps({ modelValue: { type: Number, default: 0 } })
const emit = defineEmits(['update:modelValue'])

function onInput(v) {
  const num = Number(v)
  emit('update:modelValue', isNaN(num) ? 0 : num)
}
</script>


