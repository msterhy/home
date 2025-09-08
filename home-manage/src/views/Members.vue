<template>
  <div class="page">
    <h2>家庭成员</h2>
    <div class="toolbar">
      <input v-model="name" placeholder="成员名称" />
      <button @click="add">添加</button>
    </div>
    <ul>
      <li v-for="m in list" :key="m.id">
        {{ m.name }}
        <button @click="remove(m.id)">删除</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMembersStore } from '@/stores/members'
import { storeToRefs } from 'pinia'

const name = ref('')
const store = useMembersStore()
const { items: list } = storeToRefs(store)

function add() { store.add(name.value); name.value = '' }
function remove(id) { store.remove(id) }
</script>

<style scoped>
.page { padding: 16px; }
.toolbar { display: flex; gap: 8px; margin: 12px 0; }
</style>


