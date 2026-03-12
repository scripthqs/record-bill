<script lang="ts" setup>
import dayjs from 'dayjs'
import { useStatusBar } from '@/hooks/useStatusBar'
import { ALL_CATEGORIES, useBillStore } from '@/store/bill'

defineOptions({ name: 'BillList' })

definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '%tabbar.bills%',
  },
})

const billStore = useBillStore()
const { statusBarStyle } = useStatusBar()
const currentMonth = ref(dayjs().format('YYYY-MM'))

const displayMonth = computed(() => dayjs(`${currentMonth.value}-01`).format('YYYY年MM月'))
const isCurrentMonth = computed(() => currentMonth.value === dayjs().format('YYYY-MM'))

function prevMonth() {
  currentMonth.value = dayjs(`${currentMonth.value}-01`).subtract(1, 'month').format('YYYY-MM')
}
function nextMonth() {
  if (!isCurrentMonth.value) {
    currentMonth.value = dayjs(`${currentMonth.value}-01`).add(1, 'month').format('YYYY-MM')
  }
}

const monthStats = computed(() => billStore.getMonthStats(currentMonth.value))
const billsByDate = computed(() => billStore.getBillsByDateInMonth(currentMonth.value))

function formatDate(date: string) {
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  if (date === today)
    return '今天'
  if (date === yesterday)
    return '昨天'
  return dayjs(date).format('MM月DD日 ddd')
}

function formatAmount(amount: number) {
  return amount.toFixed(2)
}

function getCategoryInfo(categoryId: string) {
  return ALL_CATEGORIES.find(c => c.id === categoryId)
}

function getDayStats(items: any[]) {
  const income = items.filter(b => b.type === 'income').reduce((s: number, b: any) => s + b.amount, 0)
  const expense = items.filter(b => b.type === 'expense').reduce((s: number, b: any) => s + b.amount, 0)
  return { income, expense }
}

function goAddBill() {
  uni.navigateTo({ url: '/pages/bill/add' })
}

function editBill(id: string) {
  uni.navigateTo({ url: `/pages/bill/add?id=${id}` })
}

function deleteBill(id: string) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条记录吗？',
    confirmColor: '#EF4444',
    success: (res) => {
      if (res.confirm) {
        billStore.deleteBill(id)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    },
  })
}
</script>

<template>
  <view class="min-h-screen bg-[#F7F8FA]">
    <!-- 顶部安全区（小程序状态栏占位） -->
    <view class="bg-[#07C160]" :style="statusBarStyle" />

    <!-- 顶部卡片 -->
    <view class="bg-[#07C160] px-4 pb-8 pt-2">
      <!-- 月份导航 -->
      <view class="mb-4 flex items-center justify-center gap-6">
        <view class="p-2 active:opacity-70" @click="prevMonth">
          <view class="i-carbon-chevron-left text-xl text-white" />
        </view>
        <text class="text-lg text-white font-bold">{{ displayMonth }}</text>
        <view class="p-2" :class="isCurrentMonth ? 'opacity-30' : 'active:opacity-70'" @click="nextMonth">
          <view class="i-carbon-chevron-right text-xl text-white" />
        </view>
      </view>

      <!-- 收支概览卡片 -->
      <view class="rounded-2xl bg-white/20 px-4 py-3">
        <view class="flex justify-around text-center text-white">
          <view>
            <view class="text-xs opacity-80">
              收入
            </view>
            <view class="mt-1 text-xl font-bold">
              {{ formatAmount(monthStats.income) }}
            </view>
          </view>
          <view class="w-px bg-white/30" />
          <view>
            <view class="text-xs opacity-80">
              支出
            </view>
            <view class="mt-1 text-xl font-bold">
              {{ formatAmount(monthStats.expense) }}
            </view>
          </view>
          <view class="w-px bg-white/30" />
          <view>
            <view class="text-xs opacity-80">
              结余
            </view>
            <view class="mt-1 text-xl font-bold" :class="monthStats.balance < 0 ? 'text-red-200' : ''">
              {{ formatAmount(monthStats.balance) }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 账单列表 -->
    <view class="px-3 -mt-4">
      <!-- 空状态 -->
      <view v-if="billsByDate.length === 0" class="mt-8 flex flex-col items-center rounded-2xl bg-white py-12 text-gray-400">
        <view class="i-carbon-notebook mb-3 text-5xl text-gray-200" />
        <text class="text-sm">本月暂无账单记录</text>
        <text class="mt-1 text-xs text-gray-300">点击右下角 + 开始记账</text>
      </view>

      <!-- 日期分组 -->
      <view v-for="group in billsByDate" :key="group.date" class="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
        <!-- 日期标题 -->
        <view class="flex items-center justify-between border-b border-gray-50 bg-gray-50/80 px-4 py-2">
          <text class="text-sm text-gray-700 font-medium">{{ formatDate(group.date) }}</text>
          <view class="flex gap-3 text-xs">
            <text v-if="getDayStats(group.items).income > 0" class="text-[#07C160]">
              +{{ formatAmount(getDayStats(group.items).income) }}
            </text>
            <text v-if="getDayStats(group.items).expense > 0" class="text-red-400">
              -{{ formatAmount(getDayStats(group.items).expense) }}
            </text>
          </view>
        </view>

        <!-- 账单条目 -->
        <view
          v-for="bill in group.items"
          :key="bill.id"
          class="flex items-center border-b border-gray-50 px-4 py-3 last:border-0 active:bg-gray-50"
          @click="editBill(bill.id)"
          @longpress="deleteBill(bill.id)"
        >
          <!-- 分类图标 -->
          <view
            class="mr-3 h-10 w-10 flex items-center justify-center rounded-full"
            :class="bill.type === 'expense' ? 'bg-red-50' : 'bg-green-50'"
          >
            <view
              class="text-xl"
              :class="[
                getCategoryInfo(bill.categoryId)?.icon,
                bill.type === 'expense' ? 'text-red-400' : 'text-[#07C160]',
              ]"
            />
          </view>

          <!-- 名称/备注 -->
          <view class="flex-1 overflow-hidden">
            <text class="block text-sm text-gray-800">{{ getCategoryInfo(bill.categoryId)?.name || '未知' }}</text>
            <text v-if="bill.note" class="block truncate text-xs text-gray-400">{{ bill.note }}</text>
          </view>

          <!-- 金额 -->
          <text
            class="text-base font-semibold"
            :class="bill.type === 'expense' ? 'text-red-500' : 'text-[#07C160]'"
          >
            {{ bill.type === 'expense' ? '-' : '+' }}{{ formatAmount(bill.amount) }}
          </text>
        </view>
      </view>

      <!-- 底部留白 -->
      <view class="h-6" />
    </view>

    <!-- 悬浮添加按钮 -->
    <view
      class="fixed bottom-[70px] right-5 h-14 w-14 flex items-center justify-center rounded-full bg-[#07C160] shadow-lg active:opacity-80"
      @click="goAddBill"
    >
      <view class="i-carbon-add text-3xl text-white" />
    </view>

    <tabbar />
  </view>
</template>
