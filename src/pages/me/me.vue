<script lang="ts" setup>
import { useStatusBar } from '@/hooks/useStatusBar'
import { useBillStore } from '@/store/bill'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '%tabbar.me%',
  },
})

const billStore = useBillStore()
const { statusBarStyle } = useStatusBar()
const totalStats = computed(() => billStore.getTotalStats())

function formatAmount(amount: number) {
  return amount.toFixed(2)
}

function handleClearData() {
  uni.showModal({
    title: '清空所有数据',
    content: '此操作将删除所有账单记录且不可恢复，确定继续吗？',
    confirmText: '确定清空',
    confirmColor: '#EF4444',
    success: (res) => {
      if (res.confirm) {
        billStore.clearAll()
        uni.showToast({ title: '已清空所有数据', icon: 'success' })
      }
    },
  })
}

function handleExportTip() {
  uni.showToast({ title: '功能开发中，敬请期待', icon: 'none' })
}
</script>

<template>
  <view class="min-h-screen bg-[#F7F8FA]">
    <!-- 顶部安全区 -->
    <view class="bg-[#374151] pt-safe" />

    <!-- 顶部头部区域 -->
    <view class="bg-[#374151] px-4 pb-8 pt-3">
      <text class="text-lg text-white font-bold">我的</text>
      <view class="mt-4 flex items-center gap-4">
        <view class="h-16 w-16 flex items-center justify-center rounded-full bg-white/20">
          <view class="i-carbon-user text-3xl text-white" />
        </view>
        <view>
          <text class="text-base text-white font-medium">记账本</text>
          <text class="mt-1 block text-xs text-white/60">轻松管理您的每一笔收支</text>
        </view>
      </view>
    </view>

    <!-- 统计总览 -->
    <view class="px-3 -mt-4">
      <view class="overflow-hidden rounded-2xl bg-white shadow-sm">
        <view class="border-b border-gray-50 px-4 py-3">
          <text class="text-sm text-gray-600 font-medium">累计统计</text>
        </view>
        <view class="flex px-4 py-4">
          <view class="flex-1 text-center">
            <text class="block text-xs text-gray-400">总收入</text>
            <text class="mt-1 block text-base text-[#07C160] font-bold">
              ¥{{ formatAmount(totalStats.income) }}
            </text>
          </view>
          <view class="w-px bg-gray-100" />
          <view class="flex-1 text-center">
            <text class="block text-xs text-gray-400">总支出</text>
            <text class="mt-1 block text-base text-[#EF4444] font-bold">
              ¥{{ formatAmount(totalStats.expense) }}
            </text>
          </view>
          <view class="w-px bg-gray-100" />
          <view class="flex-1 text-center">
            <text class="block text-xs text-gray-400">账单笔数</text>
            <text class="mt-1 block text-base text-gray-700 font-bold">
              {{ totalStats.count }}
            </text>
          </view>
        </view>
        <!-- 净资产 -->
        <view class="mx-4 mb-4 rounded-xl px-4 py-3" :class="totalStats.balance >= 0 ? 'bg-green-50' : 'bg-red-50'">
          <view class="flex items-center justify-between">
            <text class="text-sm text-gray-500">累计结余</text>
            <text
              class="text-lg font-bold"
              :class="totalStats.balance >= 0 ? 'text-[#07C160]' : 'text-[#EF4444]'"
            >
              {{ totalStats.balance >= 0 ? '+' : '' }}¥{{ formatAmount(totalStats.balance) }}
            </text>
          </view>
        </view>
      </view>

      <!-- 功能列表 -->
      <view class="mt-3 overflow-hidden rounded-2xl bg-white shadow-sm">
        <view class="border-b border-gray-50 px-4 py-3">
          <text class="text-sm text-gray-600 font-medium">数据管理</text>
        </view>

        <!-- 导出数据 -->
        <view
          class="flex items-center border-b border-gray-50 px-4 py-4 active:bg-gray-50"
          @click="handleExportTip"
        >
          <view class="mr-3 h-9 w-9 flex items-center justify-center rounded-xl bg-blue-50">
            <view class="i-carbon-information text-xl text-blue-400" />
          </view>
          <text class="flex-1 text-sm text-gray-700">导出账单</text>
          <view class="i-carbon-chevron-right text-sm text-gray-300" />
        </view>

        <!-- 清空数据 -->
        <view
          class="flex items-center px-4 py-4 active:bg-gray-50"
          @click="handleClearData"
        >
          <view class="mr-3 h-9 w-9 flex items-center justify-center rounded-xl bg-red-50">
            <view class="i-carbon-trash-can text-xl text-red-400" />
          </view>
          <text class="flex-1 text-sm text-gray-700">清空所有数据</text>
          <view class="i-carbon-chevron-right text-sm text-gray-300" />
        </view>
      </view>

      <!-- 关于 -->
      <view class="mt-3 overflow-hidden rounded-2xl bg-white shadow-sm">
        <view class="border-b border-gray-50 px-4 py-3">
          <text class="text-sm text-gray-600 font-medium">关于</text>
        </view>
        <view class="px-4 py-4">
          <view class="flex items-center justify-between">
            <text class="text-sm text-gray-500">版本</text>
            <text class="text-sm text-gray-400">v1.0.0</text>
          </view>
          <view class="mt-3 flex items-center justify-between">
            <text class="text-sm text-gray-500">技术栈</text>
            <text class="text-sm text-gray-400">uni-app + Vue3 + Pinia</text>
          </view>
        </view>
      </view>

      <!-- 底部留白 -->
      <view class="h-6 pb-safe" />
    </view>

    <tabbar />
  </view>
</template>
