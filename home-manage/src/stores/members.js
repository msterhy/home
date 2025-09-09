import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { createLocalListStorage } from '@/utils/storage'

const storage = createLocalListStorage('gmj.members')

export const useMembersStore = defineStore('members', {
  state: () => ({
    items: storage.load(),
  }),
  actions: {
    persist() { storage.save(this.items) },
    add(name) {
      const n = String(name || '').trim()
      if (!n) return
      this.items.push({ id: uuidv4(), name: n })
      this.persist()
    },
    remove(id) {
      this.items = this.items.filter(i => i.id !== id)
      this.persist()
    },
    clearAll() { this.items = []; this.persist() }
  }
})



