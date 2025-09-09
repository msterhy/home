<template>
  <div class="page">
    <h2>预算设置</h2>
    <div class="card">
      <h3>全家月度总预算</h3>
      <div class="row">
        <label>金额(元) <input type="number" v-model.number="monthly" /></label>
        <button @click="saveMonthly">保存</button>
      </div>
    </div>

    <div class="card">
      <h3>按分类月度预算</h3>
      <div class="row">
        <label style="flex:1">分类 <CategorySelect v-model="entry.path" /></label>
        <label>金额(元) <input type="number" v-model.number="entry.amount" /></label>
        <button @click="addOrUpdate">添加/更新</button>
      </div>
      <table class="table">
        <thead>
          <tr><th>分类</th><th>金额(元)</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="(e, i) in budgets" :key="i">
            <td>{{ (e.path||[]).join(' / ') }}</td>
            <td>{{ e.amount }}</td>
            <td><button @click="remove(e.path)">删除</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'
import CategorySelect from '@/components/common/CategorySelect.vue'

const store = useSettingsStore()
const { monthlyBudget, categoryBudgets } = storeToRefs(store)

const monthly = ref(monthlyBudget.value)
const entry = ref({ path: [], amount: 0 })
const budgets = categoryBudgets

function saveMonthly() { store.setMonthlyBudget(monthly.value) }
function addOrUpdate() { store.upsertCategoryBudget({ ...entry.value }) ; entry.value = { path: [], amount: 0 } }
function remove(path) { store.removeCategoryBudget(path) }
</script>

<style scoped>
.page { padding: 16px; }
.card { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; margin-bottom: 12px; }
.row { display: flex; gap: 8px; align-items: center; }
.table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.table th, .table td { border: 1px solid #e5e5e5; padding: 8px; }
</style>




