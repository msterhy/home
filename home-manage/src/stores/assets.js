import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { createLocalListStorage } from '@/utils/storage'

const storage = createLocalListStorage('gmj.assets')

export const useAssetsStore = defineStore('assets', {
  state: () => ({ items: storage.load() }),
  getters: {
    totalValue: (s) => s.items.reduce((sum, i) => sum + Number(i.value || 0), 0),
    totalDebt: (s) => s.items.reduce((sum, i) => sum + Number(i.debt || 0), 0),
    netWorth() { return this.totalValue - this.totalDebt },
  },
  actions: {
    persist() { storage.save(this.items) },
    upsert(a) {
      if (!a.id) { a.id = uuidv4(); this.items.unshift({ ...a }) }
      else {
        const idx = this.items.findIndex(i => i.id === a.id)
        if (idx >= 0) this.items[idx] = { ...a }
      }
      this.persist()
    },
    remove(id) { this.items = this.items.filter(i => i.id !== id); this.persist() },
    clearAll() { this.items = []; this.persist() }
  }
})



