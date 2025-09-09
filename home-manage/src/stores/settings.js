import { defineStore } from 'pinia'
import { createLocalObjectStorage } from '@/utils/storage'

const storage = createLocalObjectStorage('gmj.settings', { monthlyBudget: 0, categoryBudgets: [] })

export const useSettingsStore = defineStore('settings', {
  state: () => ({ data: storage.load() }),
  getters: {
    monthlyBudget: (s) => Number(s.data.monthlyBudget || 0),
    categoryBudgets: (s) => Array.isArray(s.data.categoryBudgets) ? s.data.categoryBudgets : [],
  },
  actions: {
    persist() { storage.save(this.data) },
    setMonthlyBudget(v) { this.data.monthlyBudget = Number(v || 0); this.persist() },
    upsertCategoryBudget(entry) {
      const key = (entry.path || []).join('/')
      const list = this.categoryBudgets.slice()
      const idx = list.findIndex(e => (e.path||[]).join('/') === key)
      const normalized = { path: Array.isArray(entry.path) ? entry.path : [], amount: Number(entry.amount || 0) }
      if (idx >= 0) list[idx] = normalized
      else list.unshift(normalized)
      this.data.categoryBudgets = list
      this.persist()
    },
    removeCategoryBudget(path) {
      const key = (Array.isArray(path) ? path : String(path).split('/')).map(s=>s.trim()).filter(Boolean).join('/')
      this.data.categoryBudgets = this.categoryBudgets.filter(e => (e.path||[]).join('/') !== key)
      this.persist()
    }
  }
})




