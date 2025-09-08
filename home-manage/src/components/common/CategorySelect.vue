<template>
  <input
    :value="text"
    @input="onInput($event.target.value)"
    placeholder="如: 餐饮/外卖"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useCategoriesStore } from '@/stores/categories'

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

useCategoriesStore() // ensure store ready for suggestions if needed

const text = computed(() => (props.modelValue || []).join('/'))
function onInput(v) {
  const path = String(v || '').split('/').map(s => s.trim()).filter(Boolean)
  emit('update:modelValue', path)
}
</script>

<style scoped>
input { width: 100%; }
</style>


