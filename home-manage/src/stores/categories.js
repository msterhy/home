import { defineStore } from 'pinia'
import { createLocalListStorage } from '@/utils/storage'

const storage = createLocalListStorage('gmj.categories')

function buildTree(paths) {
  const root = {}
  for (const path of paths) {
    let cur = root
    for (const seg of path) {
      cur.children = cur.children || {}
      cur.children[seg] = cur.children[seg] || { name: seg, children: {} }
      cur = cur.children[seg]
    }
  }
  function toArray(node) {
    return Object.values(node.children || {}).map(child => ({
      name: child.name,
      path: [],
      children: toArray(child)
    }))
  }
  const arr = toArray({ children: root.children || {} })
  function fillPath(nodes, prefix = []) {
    nodes.forEach(n => {
      n.path = [...prefix, n.name]
      fillPath(n.children, n.path)
    })
  }
  fillPath(arr)
  return arr
}

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    flat: storage.load(), // array of string[]
  }),
  getters: {
    tree: (s) => buildTree(s.flat),
  },
  actions: {
    persist() { storage.save(this.flat) },
    add(path) {
      const parts = Array.isArray(path) ? path : String(path || '').split('/').map(s => s.trim()).filter(Boolean)
      if (!parts.length) return
      this.flat.push(parts)
      this.persist()
    },
    remove(path) {
      const key = (Array.isArray(path) ? path : String(path).split('/')).map(s => s.trim()).filter(Boolean).join('/')
      this.flat = this.flat.filter(p => {
        const k = p.join('/')
        return k !== key && !k.startsWith(key + '/')
      })
      this.persist()
    },
    clearAll() { this.flat = []; this.persist() }
  }
})


