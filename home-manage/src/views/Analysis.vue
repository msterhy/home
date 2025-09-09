<template>
  <div class="page">
    <h2>分析</h2>
    <div class="toolbar">
      <select v-model="filter.type">
        <option value="">全部</option>
        <option value="income">收入</option>
        <option value="expense">支出</option>
      </select>
      <DateRangePicker v-model="filter.range" />
    </div>
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

    <div class="grid2">
      <div id="pie-cat" class="card" style="height:320px"></div>
      <div id="pie-merchant" class="card" style="height:320px"></div>
      <div id="pie-region" class="card" style="height:320px"></div>
      <div class="card">
        <h3>Top 支出分类/商家/区域</h3>
        <div class="tops">
          <div>
            <h4>分类</h4>
            <ol>
              <li v-for="(it, i) in topCats" :key="i">{{ it.name }}：{{ it.value }}</li>
            </ol>
          </div>
          <div>
            <h4>商家</h4>
            <ol>
              <li v-for="(it, i) in topMerchants" :key="i">{{ it.name }}：{{ it.value }}</li>
            </ol>
          </div>
          <div>
            <h4>区域</h4>
            <ol>
              <li v-for="(it, i) in topRegions" :key="i">{{ it.name }}：{{ it.value }}</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import DateRangePicker from '@/components/common/DateRangePicker.vue'
import { useSettingsStore } from '@/stores/settings'

const store = useTransactionsStore()
const { items } = storeToRefs(store)
const settings = useSettingsStore()
const filter = ref({ type: '', range: { start: '', end: '' } })

function monthNet(m) {
  const income = items.value.filter(t => t.date?.startsWith(m) && (!filter.value.type || filter.value.type==='income') && t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0)
  const expense = items.value.filter(t => t.date?.startsWith(m) && (!filter.value.type || filter.value.type==='expense') && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0)
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

// 预算偏差：优先使用设置中的月度总预算；若为0退化为历史均值预算
const budgetDeviation = computed(() => {
  const curMonth = dayjs().format('YYYY-MM')
  const curExpense = items.value.filter(t => t.date?.startsWith(curMonth) && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0)
  let budget = Number(settings.monthlyBudget || 0)
  if (!budget) {
    const months = Array.from({ length: 6 }).map((_, i) => dayjs().subtract(i + 1, 'month').format('YYYY-MM'))
    budget = months.map(m => items.value.filter(t => t.date?.startsWith(m) && t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0)).reduce((s, v) => s + v, 0) / (months.length || 1)
  }
  if (budget === 0) return curExpense === 0 ? 0 : 100
  return ((curExpense - budget) / budget) * 100
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

// 当月支出聚合：分类、商家、区域
function aggregateCurrentMonthExpenses() {
  const cur = dayjs().format('YYYY-MM')
  const cat = {}
  const merchant = {}
  const region = {}
  items.value.forEach(t => {
    if (t.type !== 'expense' || !t.date?.startsWith(cur)) return
    if (filter.value.type && t.type !== filter.value.type) return
    const { start, end } = filter.value.range || {}
    if (start && (!t.date || t.date < start)) return
    if (end && (!t.date || t.date > end)) return
    const amt = Number(t.amount || 0)
    const catKey = (t.categoryPath||[]).join('/') || '未分类'
    cat[catKey] = (cat[catKey] || 0) + amt
    const mKey = t.merchant || '未知商家'
    merchant[mKey] = (merchant[mKey] || 0) + amt
    const rKey = t.region || '未知区域'
    region[rKey] = (region[rKey] || 0) + amt
  })
  return { cat, merchant, region }
}

const topCats = computed(() => Object.entries(aggregateCurrentMonthExpenses().cat).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value).slice(0,5))
const topMerchants = computed(() => Object.entries(aggregateCurrentMonthExpenses().merchant).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value).slice(0,5))
const topRegions = computed(() => Object.entries(aggregateCurrentMonthExpenses().region).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value).slice(0,5))

function renderPies() {
  const { cat, merchant, region } = aggregateCurrentMonthExpenses()
  const catEl = document.getElementById('pie-cat')
  const mEl = document.getElementById('pie-merchant')
  const rEl = document.getElementById('pie-region')
  if (!catEl || !mEl || !rEl) return
  echarts.init(catEl).setOption({ title: { text: '当月支出-分类占比', left:'center' }, tooltip: { trigger:'item' }, series: [{ type:'pie', radius:'60%', data: Object.entries(cat).map(([name,value])=>({ name, value })) }] })
  echarts.init(mEl).setOption({ title: { text: '当月支出-商家占比', left:'center' }, tooltip: { trigger:'item' }, series: [{ type:'pie', radius:'60%', data: Object.entries(merchant).map(([name,value])=>({ name, value })) }] })
  echarts.init(rEl).setOption({ title: { text: '当月支出-区域占比', left:'center' }, tooltip: { trigger:'item' }, series: [{ type:'pie', radius:'60%', data: Object.entries(region).map(([name,value])=>({ name, value })) }] })
}

onMounted(renderPies)
watch(items, renderPies)
watch(filter, renderPies, { deep: true })
</script>

<style scoped>
.page { padding: 16px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.card { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
.tops { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
</style>



