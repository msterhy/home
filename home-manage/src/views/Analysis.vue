<template>
  <div class="page">
    <h2>分析</h2>
    <div class="grid">
      <div class="card">
        <h3>同比/环比</h3>
        <p>本月 vs 上月：净现金流 {{ mom.toFixed(2) }}%</p>
        <p>本月 vs 去年同月：净现金流 {{ yoy.toFixed(2) }}%</p>
      </div>
      <div class="card">
        <h3>预算偏差</h3>
        <p>支出超预算：{{ budgetDeviation.toFixed(2) }}%</p>
      </div>
      <div class="card">
        <h3>异常波动</h3>
        <ul>
          <li v-for="(w, i) in anomalies" :key="i">{{ w }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'

const store = useTransactionsStore()
const { items } = storeToRefs(store)

function monthNet(m) {
  const income = items.value.filter(t => t.date?.startsWith(m) && t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0)
  const expense = items.value.filter(t => t.date?.startsWith(m) && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0)
  return income - expense
}

const mom = computed(() => {
  const cur = dayjs().format('YYYY-MM')
  const prev = dayjs().subtract(1, 'month').format('YYYY-MM')
  const a = monthNet(prev)
  const b = monthNet(cur)
  if (a === 0) return b === 0 ? 0 : 100
  return ((b - a) / Math.abs(a)) * 100
})

const yoy = computed(() => {
  const cur = dayjs().format('YYYY-MM')
  const lastYear = dayjs().subtract(1, 'year').format('YYYY-MM')
  const a = monthNet(lastYear)
  const b = monthNet(cur)
  if (a === 0) return b === 0 ? 0 : 100
  return ((b - a) / Math.abs(a)) * 100
})

// 简易预算：取过去6个月平均支出作为预算
const budgetDeviation = computed(() => {
  const months = Array.from({ length: 6 }).map((_, i) => dayjs().subtract(i + 1, 'month').format('YYYY-MM'))
  const avgExpense = months.map(m => items.value.filter(t => t.date?.startsWith(m) && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0)).reduce((s, v) => s + v, 0) / (months.length || 1)
  const curExpense = items.value.filter(t => t.date?.startsWith(dayjs().format('YYYY-MM')) && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0)
  if (avgExpense === 0) return curExpense === 0 ? 0 : 100
  return ((curExpense - avgExpense) / avgExpense) * 100
})

const anomalies = computed(() => {
  const cur = dayjs().format('YYYY-MM')
  const curExpense = items.value.filter(t => t.date?.startsWith(cur) && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0)
  const months = Array.from({ length: 6 }).map((_, i) => dayjs().subtract(i + 1, 'month').format('YYYY-MM'))
  const hist = months.map(m => items.value.filter(t => t.date?.startsWith(m) && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0))
  const avg = hist.reduce((s, v) => s + v, 0) / (hist.length || 1)
  const msg = []
  if (avg > 0 && curExpense > avg * 1.3) msg.push('本月支出高于6个月均值30%以上')
  if (avg > 0 && curExpense < avg * 0.7) msg.push('本月支出低于6个月均值30%以上')
  return msg
})
</script>

<style scoped>
.page { padding: 16px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.card { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; }
</style>


