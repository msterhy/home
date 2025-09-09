<template>
  <div class="wrap">
    <input
      :list="listId"
      :value="text"
      @input="onInput($event.target.value)"
      placeholder="如: 餐饮/外卖"
    />
    <datalist :id="listId">
      <option v-for="s in suggestions" :key="s" :value="s" />
    </datalist>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { storeToRefs } from 'pinia'

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

const catStore = useCategoriesStore()
const { flat } = storeToRefs(catStore)
const suggestions = computed(() => (flat.value || []).map(p => (p || []).join('/')).filter(Boolean))
const listId = `cat-list-${Math.random().toString(36).slice(2)}`

const text = computed(() => (props.modelValue || []).join('/'))
function onInput(v) {
  const path = String(v || '').split('/').map(s => s.trim()).filter(Boolean)
  emit('update:modelValue', path)
}
</script>

<style scoped>
.wrap { width: 100%; }
input { width: 100%; }
</style>



