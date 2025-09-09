<template>
  <div class="layout">
    <aside class="sider">
      <h1 class="logo">管家婆</h1>
      <nav>
        <a :class="{active: is('/dashboard')}" href="/#/dashboard">仪表盘</a>
        <a :class="{active: is('/transactions')}" href="/#/transactions">收支流水</a>
        <a :class="{active: is('/categories')}" href="/#/categories">分类管理</a>
        <a :class="{active: is('/members')}" href="/#/members">家庭成员</a>
        <a :class="{active: is('/assets')}" href="/#/assets">资产管理</a>
        <a :class="{active: is('/analysis')}" href="/#/analysis">分析</a>
        <a :class="{active: is('/settings')}" href="/#/settings">预算设置</a>
      </nav>
    </aside>
    <main class="content">
      <header class="header">
        <div class="spacer"></div>
        <div class="actions">
          <button @click="exportData">导出数据</button>
          <button @click="importData">导入数据</button>
          <button @click="seedData">生成示例数据</button>
          <button @click="resetData">重置数据</button>
          <button @click="openEditor()">新增流水</button>
        </div>
      </header>
      <section class="body">
        <router-view />
      </section>

      <div v-if="editing" class="dialog">
        <div class="card">
          <h3>{{ current?.id ? '编辑' : '新增' }}流水</h3>
          <div class="dlg-grid">
            <label>日期 <input type="date" v-model="current.date" /></label>
            <label>类型
              <select v-model="current.type">
                <option value="income">收入</option>
                <option value="expense">支出</option>
              </select>
            </label>
            <label>分类 <CategorySelect v-model="current.categoryPath" /></label>
            <label>成员 <MemberSelect v-model="current.memberName" /></label>
            <label>金额 <MoneyInput v-model="current.amount" /></label>
            <label>商家 <input v-model="current.merchant" /></label>
            <label>备注 <input v-model="current.note" /></label>
          </div>
          <div class="dlg-actions">
            <button @click="save">保存</button>
            <button @click="cancel">取消</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useTransactionsStore } from '@/stores/transactions'
import { useMembersStore } from '@/stores/members'
import { useCategoriesStore } from '@/stores/categories'
import { useAssetsStore } from '@/stores/assets'
import CategorySelect from '@/components/common/CategorySelect.vue'
import MemberSelect from '@/components/common/MemberSelect.vue'
import MoneyInput from '@/components/common/MoneyInput.vue'

const route = useRoute()
function is(path) { return route.path.startsWith(path) }

function exportData() {
  const keys = ['gmj.transactions','gmj.categories','gmj.members','gmj.assets']
  const data = {}
  keys.forEach(k => { try { data[k] = JSON.parse(localStorage.getItem(k) || '[]') } catch { data[k] = [] } })
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'gmj-backup.json'
  a.click()
  URL.revokeObjectURL(url)
}

function importData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      if (data['gmj.transactions']) localStorage.setItem('gmj.transactions', JSON.stringify(data['gmj.transactions']))
      if (data['gmj.categories']) localStorage.setItem('gmj.categories', JSON.stringify(data['gmj.categories']))
      if (data['gmj.members']) localStorage.setItem('gmj.members', JSON.stringify(data['gmj.members']))
      if (data['gmj.assets']) localStorage.setItem('gmj.assets', JSON.stringify(data['gmj.assets']))
      location.reload()
    } catch (e) { alert('导入失败：文件格式不正确') }
  }
  input.click()
}

function resetData() {
  if (!confirm('确定重置所有数据？此操作不可撤销。')) return
  ['gmj.transactions','gmj.categories','gmj.members','gmj.assets'].forEach(k => localStorage.removeItem(k))
  location.reload()
}

function seedData() {
  if (!confirm('生成示例数据将覆盖当前数据，确定继续？')) return
  const members = [
    { id: crypto.randomUUID(), name: '爸爸' },
    { id: crypto.randomUUID(), name: '妈妈' },
    { id: crypto.randomUUID(), name: '孩子' },
  ]
  const categories = [
    ['收入','工资'], ['收入','理财'], ['收入','其他'],
    ['餐饮','外卖'], ['餐饮','堂食'],
    ['购物','服饰'], ['购物','日用品'],
    ['出行','打车'], ['出行','公共交通'],
    ['教育','培训'], ['娱乐','电影'],
  ]
  const merchants = ['美团外卖','盒马','优衣库','京东','高德打车','地铁','新东方','万达影城']
  const regions = ['浦东新区','徐汇区','黄浦区','静安区']
  const counterparties = ['朋友A','公司B','同事C']
  const now = new Date()
  const monthStr = now.toISOString().slice(0,7)
  const prevMonth = new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString().slice(0,7)
  const tx = []
  function addTxn({ date, type, cat, member, amount, merchant, region, counterparty, tags, note }) {
    tx.push({ id: crypto.randomUUID(), date, type, categoryPath: cat, memberName: member, amount, merchant, region, counterparty, tags, note })
  }
  for (let i=0;i<20;i++) {
    const d = String(Math.min(28, Math.ceil(Math.random()*28))).padStart(2,'0')
    const m = i<10 ? prevMonth : monthStr
    const type = Math.random() < 0.25 ? 'income' : 'expense'
    const cat = type==='income' ? (Math.random()<0.7?['收入','工资']:['收入','理财']) : categories.filter(c=>c[0]!=='收入')[Math.floor(Math.random()* (categories.length-3))]
    const member = members[Math.floor(Math.random()*members.length)].name
    const amount = Number((Math.random()*(type==='income'?8000:300)+ (type==='income'?2000:20))).toFixed(2)
    const merchant = type==='income' ? '公司' : merchants[Math.floor(Math.random()*merchants.length)]
    const region = type==='income' ? '' : regions[Math.floor(Math.random()*regions.length)]
    const counterparty = type==='income' ? '公司B' : counterparties[Math.floor(Math.random()*counterparties.length)]
    const tags = type==='income' ? ['固定'] : ['日常','偶发','团建'][Math.floor(Math.random()*3)].split(',')
    const note = type==='income' ? '打卡发薪' : '消费'
    addTxn({ date: `${m}-${d}`, type, cat, member, amount: Number(amount), merchant, region, counterparty, tags, note })
  }
  localStorage.setItem('gmj.members', JSON.stringify(members))
  localStorage.setItem('gmj.categories', JSON.stringify(categories))
  localStorage.setItem('gmj.transactions', JSON.stringify(tx))
  localStorage.setItem('gmj.assets', JSON.stringify([
    { id: crypto.randomUUID(), type: 'house', name: '自住房', value: 2000000, debt: 800000, note: '商贷' },
    { id: crypto.randomUUID(), type: 'invest', name: '货币基金', value: 50000, debt: 0, note: '' },
    { id: crypto.randomUUID(), type: 'stock', name: '上证ETF', value: 30000, debt: 0, note: '' },
    { id: crypto.randomUUID(), type: 'loan', name: '车贷', value: 0, debt: 120000, note: '' },
  ]))
  location.reload()
}

const editing = ref(false)
const store = useTransactionsStore()
const current = ref({ id: '', date: '', type: 'expense', categoryPath: [], memberName: '', amount: 0, merchant: '', note: '' })

function openEditor(t) {
  if (t) {
    current.value = JSON.parse(JSON.stringify(t))
  } else {
    current.value = { id: '', date: '', type: 'expense', categoryPath: [], memberName: '', amount: 0, merchant: '', note: '' }
  }
  editing.value = true
}

function cancel() { editing.value = false }

function save() {
  store.upsert({ ...current.value })
  editing.value = false
}
</script>

<style scoped>
.layout { display: grid; grid-template-columns: 220px 1fr; height: 100vh; }
.sider { background: #0f172a; color: #fff; padding: 16px; }
.logo { font-size: 18px; margin-bottom: 12px; }
nav { display: flex; flex-direction: column; gap: 8px; }
nav a { color: #cbd5e1; text-decoration: none; padding: 8px; border-radius: 6px; }
nav a.active, nav a:hover { background: #1e293b; color: #fff; }
.content { display: grid; grid-template-rows: 56px 1fr; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid #e5e7eb; }
.body { overflow: auto; }
.actions { display: flex; gap: 8px; align-items: center; }
.dialog { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; }
.card { background: #fff; padding: 16px; width: 640px; max-width: 90vw; border-radius: 8px; }
.dlg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
.dlg-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>


