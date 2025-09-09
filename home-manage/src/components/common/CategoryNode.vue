<template>
  <div class="node">
    <span>{{ node.name }}</span>
    <button @click="$emit('remove', node.path)">删除</button>
    <ul v-if="node.children && node.children.length">
      <li v-for="(c, i) in node.children" :key="i">
        <CategoryNode :node="c" @remove="$emit('remove', $event)" />
      </li>
    </ul>
  </div>
</template>

<script setup>
defineOptions({ name: 'CategoryNode' })
defineProps({ node: { type: Object, required: true } })
defineEmits(['remove'])
</script>

<style scoped>
.node { margin: 4px 0; }
.node > span { margin-right: 8px; }
</style>


