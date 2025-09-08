export function createLocalListStorage(key) {
  function load() {
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
  }
  function save(list) {
    localStorage.setItem(key, JSON.stringify(list))
  }
  return { load, save }
}

export function createLocalObjectStorage(key, fallback = {}) {
  function load() {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return { ...fallback } }
  }
  function save(obj) {
    localStorage.setItem(key, JSON.stringify(obj))
  }
  return { load, save }
}


