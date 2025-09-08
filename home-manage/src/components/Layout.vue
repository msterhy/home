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
      </nav>
    </aside>
    <main class="content">
      <header class="header">
        <div class="spacer"></div>
        <div class="actions">
          <button @click="exportData">导出数据</button>
          <input type="file" @change="importData" />
        </div>
      </header>
      <section class="body">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

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

function importData(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result)
      Object.keys(json).forEach(k => localStorage.setItem(k, JSON.stringify(json[k] || [])))
      alert('导入成功，刷新页面后生效')
    } catch {
      alert('导入失败：文件格式错误')
    }
  }
  reader.readAsText(file)
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
</style>


