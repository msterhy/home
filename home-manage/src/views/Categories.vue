<template>
  <div class="page">
    <h2>分类管理</h2>
    <div class="toolbar">
      <input v-model="input" placeholder="输入分类路径，如：购物/服饰" />
      <button @click="add">添加</button>
    </div>
    <ul>
      <li v-for="(node, idx) in tree" :key="idx">
        <CategoryNode :node="node" @remove="remove" />
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCategoriesStore } from '@/stores/categories'

const input = ref('')
const store = useCategoriesStore()
const tree = computed(() => store.tree)

function add() { store.add(input.value); input.value = '' }
function remove(path) { store.remove(path) }
</script>

<script>
export default {
  components: {
    CategoryNode: {
      props: ['node'],
      emits: ['remove'],
      template: `
        <div class="node">
          <span>{{ node.name }}</span>
          <button @click="$emit('remove', node.path)">删除</button>
          <ul v-if="node.children && node.children.length">
            <li v-for="(c, i) in node.children" :key="i">
              <CategoryNode :node="c" @remove="$emit('remove', $event)" />
            </li>
          </ul>
        </div>
      `,
    }
  }
}
</script>

<style scoped>
.page { padding: 16px; }
.toolbar { display: flex; gap: 8px; margin: 12px 0; }
.node { margin: 4px 0; }
.node > span { margin-right: 8px; }
</style>


