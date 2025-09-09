import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { createLocalListStorage } from '@/utils/storage'

const storage = createLocalListStorage('gmj.transactions')

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    items: storage.load(),
  }),
  getters: {
    incomes: (s) => s.items.filter(i => i.type === 'income'),
    expenses: (s) => s.items.filter(i => i.type === 'expense'),
  },
  actions: {
    persist() { storage.save(this.items) },
    upsert(txn) {
      // 兼容新增字段的默认值
      txn.tags = Array.isArray(txn.tags) ? txn.tags : []
      txn.region = txn.region || ''
      txn.counterparty = txn.counterparty || ''
      if (!txn.id) {
        txn.id = uuidv4()
        this.items.unshift({ ...txn })
      } else {
        const idx = this.items.findIndex(i => i.id === txn.id)
        if (idx >= 0) this.items[idx] = { ...txn }
      }
      this.persist()
    },
    remove(id) {
      this.items = this.items.filter(i => i.id !== id)
      this.persist()
    },
    clearAll() {
      this.items = []
      this.persist()
    }
  }
})



