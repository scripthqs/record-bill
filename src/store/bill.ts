import { defineStore } from 'pinia'
import { ref } from 'vue'

export type BillType = 'expense' | 'income'

export interface IBillCategory {
  id: string
  name: string
  icon: string
  type: BillType
}

export interface IBill {
  id: string
  type: BillType
  amount: number
  categoryId: string
  note: string
  date: string // YYYY-MM-DD
  createTime: number
}

export const EXPENSE_CATEGORIES: IBillCategory[] = [
  { id: 'food', name: '餐饮', icon: 'i-carbon-restaurant', type: 'expense' },
  { id: 'transport', name: '交通', icon: 'i-carbon-car', type: 'expense' },
  { id: 'shopping', name: '购物', icon: 'i-carbon-shopping-cart', type: 'expense' },
  { id: 'entertainment', name: '娱乐', icon: 'i-carbon-game', type: 'expense' },
  { id: 'medical', name: '医疗', icon: 'i-carbon-hospital', type: 'expense' },
  { id: 'education', name: '教育', icon: 'i-carbon-education', type: 'expense' },
  { id: 'housing', name: '住房', icon: 'i-carbon-home', type: 'expense' },
  { id: 'other_expense', name: '其他', icon: 'i-carbon-overflow-menu-horizontal', type: 'expense' },
]

export const INCOME_CATEGORIES: IBillCategory[] = [
  { id: 'salary', name: '工资', icon: 'i-carbon-money', type: 'income' },
  { id: 'parttime', name: '兼职', icon: 'i-carbon-collaborate', type: 'income' },
  { id: 'investment', name: '理财', icon: 'i-carbon-chart-line', type: 'income' },
  { id: 'gift', name: '红包', icon: 'i-carbon-gift', type: 'income' },
  { id: 'other_income', name: '其他', icon: 'i-carbon-overflow-menu-horizontal', type: 'income' },
]

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

export const useBillStore = defineStore(
  'bill',
  () => {
    const bills = ref<IBill[]>([])

    function addBill(bill: Omit<IBill, 'id' | 'createTime'>) {
      bills.value.unshift({
        ...bill,
        id: Date.now().toString(),
        createTime: Date.now(),
      })
    }

    function updateBill(id: string, data: Partial<Omit<IBill, 'id' | 'createTime'>>) {
      const idx = bills.value.findIndex(b => b.id === id)
      if (idx !== -1) {
        bills.value[idx] = { ...bills.value[idx], ...data }
      }
    }

    function deleteBill(id: string) {
      bills.value = bills.value.filter(b => b.id !== id)
    }

    function getBillById(id: string) {
      return bills.value.find(b => b.id === id)
    }

    function getCategoryById(id: string) {
      return ALL_CATEGORIES.find(c => c.id === id)
    }

    function getBillsByMonth(yearMonth: string) {
      return bills.value.filter(b => b.date.startsWith(yearMonth))
    }

    function getMonthStats(yearMonth: string) {
      const monthBills = getBillsByMonth(yearMonth)
      const income = monthBills
        .filter(b => b.type === 'income')
        .reduce((sum, b) => sum + b.amount, 0)
      const expense = monthBills
        .filter(b => b.type === 'expense')
        .reduce((sum, b) => sum + b.amount, 0)
      return { income, expense, balance: income - expense }
    }

    function getBillsByDateInMonth(yearMonth: string) {
      const monthBills = getBillsByMonth(yearMonth)
      const map = new Map<string, IBill[]>()
      monthBills.forEach((bill) => {
        if (!map.has(bill.date))
          map.set(bill.date, [])
        map.get(bill.date)!.push(bill)
      })
      return Array.from(map.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([date, items]) => ({ date, items }))
    }

    function getCategoryStats(yearMonth: string, type: BillType) {
      const monthBills = getBillsByMonth(yearMonth).filter(b => b.type === type)
      const map = new Map<string, number>()
      monthBills.forEach((b) => {
        map.set(b.categoryId, (map.get(b.categoryId) || 0) + b.amount)
      })
      const total = Array.from(map.values()).reduce((s, v) => s + v, 0)
      return Array.from(map.entries())
        .map(([categoryId, amount]) => ({
          categoryId,
          amount,
          percent: total > 0 ? Math.round((amount / total) * 100) : 0,
          category: getCategoryById(categoryId),
        }))
        .sort((a, b) => b.amount - a.amount)
    }

    function getTotalStats() {
      const income = bills.value
        .filter(b => b.type === 'income')
        .reduce((sum, b) => sum + b.amount, 0)
      const expense = bills.value
        .filter(b => b.type === 'expense')
        .reduce((sum, b) => sum + b.amount, 0)
      return { income, expense, balance: income - expense, count: bills.value.length }
    }

    function clearAll() {
      bills.value = []
    }

    return {
      bills,
      addBill,
      updateBill,
      deleteBill,
      getBillById,
      getCategoryById,
      getBillsByMonth,
      getMonthStats,
      getBillsByDateInMonth,
      getCategoryStats,
      getTotalStats,
      clearAll,
    }
  },
  { persist: true },
)
