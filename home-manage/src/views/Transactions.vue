<template>
  <div class="page">
    <h2>收支流水</h2>
    <div class="toolbar">
      <select v-model="filter.type">
        <option value="">全部</option>
        <option value="income">收入</option>
        <option value="expense">支出</option>
      </select>
      <MemberSelect v-model="filter.memberName" />
      <CategorySelect v-model="filter.categoryPath" />
      <DateRangePicker v-model="filter.range" />
      <input v-model="filter.keyword" placeholder="备注/分类/成员 关键字" />
      <button @click="openEditor()">新增</button>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>日期</th><th>类型</th><th>分类</th><th>成员</th><th>金额</th><th>商家</th><th>备注</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in filtered" :key="t.id">
          <td>{{ t.date }}</td>
          <td>{{ t.type === 'income' ? '收入' : '支出' }}</td>
          <td>{{ t.categoryPath?.join(' / ') }}</td>
          <td>{{ t.memberName }}</td>
          <td>{{ t.amount }}</td>
          <td>{{ t.merchant || '-' }}</td>
          <td>{{ t.note || '-' }}</td>
          <td>
            <button @click="openEditor(t)">编辑</button>
            <button @click="remove(t.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="editing" class="dialog">
      <div class="card">
        <h3>{{ current?.id ? '编辑' : '新增' }}流水</h3>
        <div class="grid">
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
        <div class="actions">
          <button @click="save">保存</button>
          <button @click="cancel">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import { storeToRefs } from 'pinia'
import CategorySelect from '@/components/common/CategorySelect.vue'
import MemberSelect from '@/components/common/MemberSelect.vue'
import MoneyInput from '@/components/common/MoneyInput.vue'
import DateRangePicker from '@/components/common/DateRangePicker.vue'

const editing = ref(false)
const store = useTransactionsStore()
const { items: list } = storeToRefs(store)
const filter = ref({ type: '', keyword: '', memberName: '', categoryPath: [], range: { start: '', end: '' } })
const current = ref({ id: '', date: '', type: 'expense', categoryPath: [], memberName: '', amount: 0, merchant: '', note: '' })
const categoryInput = ref('')

const filtered = computed(() => {
  return list.value.filter(t => {
    if (filter.value.type && t.type !== filter.value.type) return false
    const kw = filter.value.keyword?.trim().toLowerCase()
    if (!kw) return true
    const text = [t.note, t.merchant, t.memberName, (t.categoryPath||[]).join('/')].join(' ').toLowerCase()
    return text.includes(kw)
  })
})

function openEditor(t) {
  if (t) {
    current.value = JSON.parse(JSON.stringify(t))
  } else {
    current.value = { id: '', date: '', type: 'expense', categoryPath: [], memberName: '', amount: 0, merchant: '', note: '' }
  }
  editing.value = true
}

function remove(id) {
  store.remove(id)
}

function cancel() {
  editing.value = false
}

function save() {
  store.upsert({ ...current.value })
  editing.value = false
}
</script>

<style scoped>
.page { padding: 16px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #e5e5e5; padding: 8px; }
.dialog { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; }
.card { background: #fff; padding: 16px; width: 640px; max-width: 90vw; border-radius: 8px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
.actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>


