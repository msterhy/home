<template>
  <div class="tags">
    <div class="items">
      <span v-for="(t, i) in modelValue" :key="i" class="tag">
        {{ t }} <button class="x" @click="remove(i)">×</button>
      </span>
    </div>
    <input
      v-model="text"
      @keydown.enter.prevent="commit"
      placeholder="输入后回车添加标签"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

const text = ref('')

function commit() {
  const t = text.value.trim()
  if (!t) return
  const set = new Set([...(props.modelValue || []), t])
  emit('update:modelValue', Array.from(set))
  text.value = ''
}

function remove(index) {
  const list = [...(props.modelValue || [])]
  list.splice(index, 1)
  emit('update:modelValue', list)
}
</script>

<style scoped>
.tags { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.items { display: inline-flex; gap: 6px; flex-wrap: wrap; }
.tag { background: #eef2ff; border: 1px solid #c7d2fe; color: #3730a3; padding: 2px 6px; border-radius: 12px; font-size: 12px; }
.tag .x { border: none; background: transparent; color: #6b7280; cursor: pointer; }
input { min-width: 160px; flex: 1; }
</style>




