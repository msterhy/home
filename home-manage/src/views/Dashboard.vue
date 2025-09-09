<template>
  <div class="page">
    <h2>仪表盘</h2>
    <div class="cards">
      <div class="card">本月收入：{{ summary.currentMonth.income }} 元</div>
      <div class="card">本月支出：{{ summary.currentMonth.expense }} 元</div>
      <div class="card">本月净现金流：{{ summary.currentMonth.net }} 元</div>
    </div>
    <div id="chart" style="width:100%;height:320px"></div>
    <div class="grid2">
      <div id="pie-income" class="card" style="height:320px"></div>
      <div id="pie-expense" class="card" style="height:320px"></div>
    </div>
  </div>
    
</template>

<script setup>
import * as echarts from 'echarts'
import { onMounted, computed, watch } from 'vue'
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

function renderBar() {
  const el = document.getElementById('chart')
  if (!el) return
  const chart = echarts.init(el)
  const months = Array.from({ length: 6 }).map((_, i) => dayjs().subtract(5 - i, 'month').format('YYYY-MM'))
  const incomeData = months.map(m => items.value.filter(t => t.date?.startsWith(m) && t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0))
  const expenseData = months.map(m => items.value.filter(t => t.date?.startsWith(m) && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0))
  echarts.init(el).setOption({
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
}

function renderMemberPies() {
  const now = dayjs().format('YYYY-MM')
  const inByMember = {}
  const exByMember = {}
  items.value.forEach(t => {
    if (!t.date?.startsWith(now)) return
    const key = t.memberName || '未分配'
    const amt = Number(t.amount || 0)
    if (t.type === 'income') inByMember[key] = (inByMember[key] || 0) + amt
    if (t.type === 'expense') exByMember[key] = (exByMember[key] || 0) + amt
  })
  const inEl = document.getElementById('pie-income')
  const exEl = document.getElementById('pie-expense')
  if (!inEl || !exEl) return
  echarts.init(inEl).setOption({
    title: { text: '本月各成员收入占比', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{ name: '收入', type: 'pie', radius: '60%', data: Object.entries(inByMember).map(([name, value]) => ({ name, value })) }]
  })
  echarts.init(exEl).setOption({
    title: { text: '本月各成员支出占比', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{ name: '支出', type: 'pie', radius: '60%', data: Object.entries(exByMember).map(([name, value]) => ({ name, value })) }]
  })
}

onMounted(() => { renderBar(); renderMemberPies() })
watch(items, () => { renderBar(); renderMemberPies() })
</script>

<style scoped>
.page { padding: 16px; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
.card { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
</style>


