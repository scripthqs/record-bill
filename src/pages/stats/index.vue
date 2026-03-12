<script lang="ts" setup>
import type { BillType } from '@/store/bill'
import dayjs from 'dayjs'
import { useStatusBar } from '@/hooks/useStatusBar'
import { ALL_CATEGORIES, useBillStore } from '@/store/bill'

defineOptions({ name: 'StatsPage' })

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '%tabbar.stats%',
  },
})

const billStore = useBillStore()
const { statusBarStyle } = useStatusBar()
const currentMonth = ref(dayjs().format('YYYY-MM'))
const activeTab = ref<BillType>('expense')

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
const categoryStats = computed(() => billStore.getCategoryStats(currentMonth.value, activeTab.value))

function formatAmount(amount: number) {
  return amount.toFixed(2)
}

function getCategoryInfo(id: string) {
  return ALL_CATEGORIES.find(c => c.id === id)
}
</script>

<template>
  <view class="min-h-screen bg-[#F7F8FA]">
    <!-- 顶部安全区（小程序状态栏占位） -->
    <view class="bg-[#6366F1]" :style="statusBarStyle" />

    <!-- 顶部区域 -->
    <view class="bg-[#6366F1] px-4 pb-8 pt-2">
      <!-- 导航栏 -->
      <view class="mb-4 flex items-center justify-center gap-6">
        <view class="p-2 active:opacity-70" @click="prevMonth">
          <view class="i-carbon-chevron-left text-xl text-white" />
        </view>
        <text class="text-lg text-white font-bold">{{ displayMonth }}</text>
        <view class="p-2" :class="isCurrentMonth ? 'opacity-30' : 'active:opacity-70'" @click="nextMonth">
          <view class="i-carbon-chevron-right text-xl text-white" />
        </view>
      </view>

      <!-- 月度收支概览 -->
      <view class="flex gap-3">
        <view class="flex-1 rounded-2xl bg-white/20 px-4 py-3 text-white">
          <text class="text-xs opacity-80">支出</text>
          <view class="mt-1 text-xl font-bold">
            {{ formatAmount(monthStats.expense) }}
          </view>
        </view>
        <view class="flex-1 rounded-2xl bg-white/20 px-4 py-3 text-white">
          <text class="text-xs opacity-80">收入</text>
          <view class="mt-1 text-xl font-bold">
            {{ formatAmount(monthStats.income) }}
          </view>
        </view>
        <view class="flex-1 rounded-2xl bg-white/20 px-4 py-3 text-white">
          <text class="text-xs opacity-80">结余</text>
          <view class="mt-1 text-xl font-bold" :class="monthStats.balance < 0 ? 'text-red-200' : ''">
            {{ formatAmount(monthStats.balance) }}
          </view>
        </view>
      </view>
    </view>

    <!-- 分类统计 -->
    <view class="px-3 -mt-4">
      <view class="overflow-hidden rounded-2xl bg-white shadow-sm">
        <!-- Tab 切换 -->
        <view class="flex border-b border-gray-100">
          <view
            class="flex-1 py-3 text-center text-sm font-medium transition-all"
            :class="activeTab === 'expense' ? 'border-b-2 border-[#EF4444] text-[#EF4444]' : 'text-gray-400'"
            @click="activeTab = 'expense'"
          >
            支出分类
          </view>
          <view
            class="flex-1 py-3 text-center text-sm font-medium transition-all"
            :class="activeTab === 'income' ? 'border-b-2 border-[#07C160] text-[#07C160]' : 'text-gray-400'"
            @click="activeTab = 'income'"
          >
            收入分类
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="categoryStats.length === 0" class="flex flex-col items-center py-12 text-gray-300">
          <view class="i-carbon-chart-bar mb-3 text-5xl" />
          <text class="text-sm">本月暂无{{ activeTab === 'expense' ? '支出' : '收入' }}记录</text>
        </view>

        <!-- 分类详情列表 -->
        <view v-else class="px-4 py-2">
          <view
            v-for="item in categoryStats"
            :key="item.categoryId"
            class="mb-4"
          >
            <view class="mb-1.5 flex items-center justify-between">
              <view class="flex items-center gap-2">
                <!-- 图标 -->
                <view
                  class="h-8 w-8 flex items-center justify-center rounded-full"
                  :class="activeTab === 'expense' ? 'bg-red-50' : 'bg-green-50'"
                >
                  <view
                    class="text-lg"
                    :class="[
                      item.category?.icon,
                      activeTab === 'expense' ? 'text-[#EF4444]' : 'text-[#07C160]',
                    ]"
                  />
                </view>
                <text class="text-sm text-gray-700">{{ item.category?.name || '未知' }}</text>
              </view>
              <view class="flex items-baseline gap-2">
                <text class="text-xs text-gray-400">{{ item.percent }}%</text>
                <text
                  class="text-sm font-semibold"
                  :class="activeTab === 'expense' ? 'text-[#EF4444]' : 'text-[#07C160]'"
                >
                  ¥{{ formatAmount(item.amount) }}
                </text>
              </view>
            </view>

            <!-- 进度条 -->
            <view class="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <view
                class="h-full rounded-full transition-all"
                :class="activeTab === 'expense' ? 'bg-[#EF4444]' : 'bg-[#07C160]'"
                :style="{ width: `${item.percent}%` }"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 月度趋势提示 -->
      <view v-if="categoryStats.length > 0" class="mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <text class="text-xs text-gray-500 font-medium">本月概要</text>
        <view class="mt-2 flex items-center justify-between">
          <view class="text-center">
            <text class="block text-xs text-gray-400">账单笔数</text>
            <text class="mt-1 block text-base text-gray-700 font-bold">
              {{ billStore.getBillsByMonth(currentMonth).length }}
            </text>
          </view>
          <view class="text-center">
            <text class="block text-xs text-gray-400">日均支出</text>
            <text class="mt-1 block text-base text-[#EF4444] font-bold">
              ¥{{ formatAmount(monthStats.expense / dayjs(`${currentMonth}-01`).daysInMonth()) }}
            </text>
          </view>
          <view class="text-center">
            <text class="block text-xs text-gray-400">收支比</text>
            <text class="mt-1 block text-base text-gray-700 font-bold">
              {{ monthStats.income > 0 ? Math.round((monthStats.expense / monthStats.income) * 100) : 0 }}%
            </text>
          </view>
        </view>
      </view>

      <!-- 底部留白 -->
      <view class="h-6" />
    </view>

    <tabbar />
  </view>
</template>
