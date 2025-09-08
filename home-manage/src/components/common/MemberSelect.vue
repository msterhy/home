<template>
  <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
    <option value="">未选择</option>
    <option v-for="m in list" :key="m.id" :value="m.name">{{ m.name }}</option>
  </select>
</template>

<script setup>
import { useMembersStore } from '@/stores/members'
import { storeToRefs } from 'pinia'

defineProps({ modelValue: { type: String, default: '' } })

const store = useMembersStore()
const { items: list } = storeToRefs(store)
</script>


