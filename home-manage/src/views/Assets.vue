<template>
  <div class="page">
    <h2>资产管理</h2>
    <p>示例字段：类型、名称、估值、负债、备注。</p>
    <div class="toolbar">
      <select v-model="current.type">
        <option value="house">房产</option>
        <option value="invest">投资</option>
        <option value="stock">股票</option>
        <option value="loan">贷款</option>
      </select>
      <input v-model="current.name" placeholder="名称" />
      <input type="number" v-model.number="current.value" placeholder="估值(元)" />
      <input type="number" v-model.number="current.debt" placeholder="负债(元)" />
      <input v-model="current.note" placeholder="备注" />
      <button @click="save">保存</button>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>类型</th><th>名称</th><th>估值</th><th>负债</th><th>净值</th><th>备注</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in list" :key="a.id">
          <td>{{ map[a.type] }}</td>
          <td>{{ a.name }}</td>
          <td>{{ a.value }}</td>
          <td>{{ a.debt }}</td>
          <td>{{ a.value - a.debt }}</td>
          <td>{{ a.note || '-' }}</td>
          <td>
            <button @click="edit(a)">编辑</button>
            <button @click="remove(a.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAssetsStore } from '@/stores/assets'
import { storeToRefs } from 'pinia'

const store = useAssetsStore()
const { items: list } = storeToRefs(store)
const current = ref({ id: '', type: 'house', name: '', value: 0, debt: 0, note: '' })
const map = { house: '房产', invest: '投资', stock: '股票', loan: '贷款' }

function save() {
  store.upsert({ ...current.value })
  current.value = { id: '', type: 'house', name: '', value: 0, debt: 0, note: '' }
}
function edit(a) { current.value = { ...a } }
function remove(id) { store.remove(id) }
</script>

<style scoped>
.page { padding: 16px; }
.toolbar { display: flex; gap: 8px; margin: 12px 0; flex-wrap: wrap; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #e5e5e5; padding: 8px; }
</style>


