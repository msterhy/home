<template>
  <div class="page">
    <h2>仪表盘</h2>
    <div class="cards">
      <div class="card">本月收入：{{ summary.currentMonth.income }} 元</div>
      <div class="card">本月支出：{{ summary.currentMonth.expense }} 元</div>
      <div class="card">本月净现金流：{{ summary.currentMonth.net }} 元</div>
    </div>
    <div id="chart" style="width:100%;height:320px"></div>
  </div>
    
</template>

<script setup>
import * as echarts from 'echarts'
import { onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import { useTransactionsStore } from '@/stores/transactions'
import { storeToRefs } from 'pinia'

const store = useTransactionsStore()
const { items } = storeToRefs(store)

const summary = computed(() => {
  const now = dayjs()
  const monthStr = now.format('YYYY-MM')
  let income = 0, expense = 0
  items.value.forEach(t => {
    if (!t.date?.startsWith(monthStr)) return
    if (t.type === 'income') income += Number(t.amount || 0)
    else if (t.type === 'expense') expense += Number(t.amount || 0)
  })
  return { currentMonth: { income, expense, net: income - expense } }
})

onMounted(() => {
  const el = document.getElementById('chart')
  if (!el) return
  const chart = echarts.init(el)
  const months = Array.from({ length: 6 }).map((_, i) => dayjs().subtract(5 - i, 'month').format('YYYY-MM'))
  const incomeData = months.map(m => items.value.filter(t => t.date?.startsWith(m) && t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0))
  const expenseData = months.map(m => items.value.filter(t => t.date?.startsWith(m) && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0))
  chart.setOption({
    title: { text: '近6个月收支概览' },
    tooltip: {},
    legend: { data: ['收入', '支出'] },
    xAxis: { data: months },
    yAxis: {},
    series: [
      { name: '收入', type: 'bar', data: incomeData },
      { name: '支出', type: 'bar', data: expenseData },
    ],
  })
})
</script>

<style scoped>
.page { padding: 16px; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
.card { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; }
</style>


