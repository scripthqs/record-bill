<script lang="ts" setup>
import type { BillType } from '@/store/bill'
import dayjs from 'dayjs'
import { useStatusBar } from '@/hooks/useStatusBar'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, useBillStore } from '@/store/bill'

definePage({
  style: {
    navigationBarTitleText: '记账',
    navigationStyle: 'custom',
  },
})

const billStore = useBillStore()
const { statusBarStyle } = useStatusBar()

// 账单类型
const billType = ref<BillType>('expense')
const currentCategories = computed(() =>
  billType.value === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES,
)

// 金额
const amountText = ref('')
const amountError = ref(false)

// 分类
const selectedCategoryId = ref(EXPENSE_CATEGORIES[0].id)

// 日期
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))

// 备注
const note = ref('')

// 获取路由参数（编辑模式）
const editId = ref('')
onLoad((options: any) => {
  if (options?.id) {
    editId.value = options.id
    const bill = billStore.getBillById(options.id)
    if (bill) {
      billType.value = bill.type
      amountText.value = bill.amount.toString()
      selectedCategoryId.value = bill.categoryId
      selectedDate.value = bill.date
      note.value = bill.note
    }
  }
})

const isEdit = computed(() => !!editId.value)

// 切换类型时重置分类
function switchType(type: BillType) {
  if (type === billType.value)
    return
  billType.value = type
  selectedCategoryId.value = currentCategories.value[0].id
}

// 金额
function onAmountInput(e: any) {
  let val = e.detail.value as string
  // 限制两位小数
  const parts = val.split('.')
  if (parts.length > 1 && parts[1].length > 2) {
    val = `${parts[0]}.${parts[1].slice(0, 2)}`
    amountText.value = val
  }
  amountError.value = false
}

function onDateChange(e: any) {
  selectedDate.value = e.detail.value
}

// 保存
function handleSave() {
  const amount = Number.parseFloat(amountText.value)
  if (!amountText.value || Number.isNaN(amount) || amount <= 0) {
    amountError.value = true
    uni.showToast({ title: '请输入正确的金额', icon: 'none' })
    return
  }
  if (!selectedCategoryId.value) {
    uni.showToast({ title: '请选择分类', icon: 'none' })
    return
  }

  const billData = {
    type: billType.value,
    amount,
    categoryId: selectedCategoryId.value,
    note: note.value.trim(),
    date: selectedDate.value,
  }

  if (isEdit.value) {
    billStore.updateBill(editId.value, billData)
    uni.showToast({ title: '修改成功', icon: 'success' })
  }
  else {
    billStore.addBill(billData)
    uni.showToast({ title: '记账成功', icon: 'success' })
  }

  setTimeout(() => uni.navigateBack(), 500)
}

// 删除（编辑模式）
function handleDelete() {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条记录吗？',
    confirmColor: '#EF4444',
    success: (res) => {
      if (res.confirm) {
        billStore.deleteBill(editId.value)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 500)
      }
    },
  })
}

function goBack() {
  uni.navigateBack()
}

// 格式化日期显示
const displayDate = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  if (selectedDate.value === today)
    return '今天'
  if (selectedDate.value === yesterday)
    return '昨天'
  return dayjs(selectedDate.value).format('YYYY年MM月DD日')
})
</script>

<template>
  <view class="min-h-screen flex flex-col bg-[#F7F8FA]">
    <!-- 顶部安全区（小程序状态栏占位） -->
    <view :class="billType === 'expense' ? 'bg-[#EF4444]' : 'bg-[#07C160]'" :style="statusBarStyle" />

    <!-- 自定义导航栏 -->
    <view
      class="flex items-center px-4 py-3"
      :class="billType === 'expense' ? 'bg-[#EF4444]' : 'bg-[#07C160]'"
    >
      <view class="p-1 active:opacity-70" @click="goBack">
        <view class="i-carbon-chevron-left text-2xl text-white" />
      </view>
      <text class="flex-1 text-center text-base text-white font-medium">
        {{ isEdit ? '编辑账单' : '记一笔' }}
      </text>
      <view class="w-8" />
    </view>

    <!-- 类型切换 + 金额区域 -->
    <view
      class="px-4 pb-6 pt-2"
      :class="billType === 'expense' ? 'bg-[#EF4444]' : 'bg-[#07C160]'"
    >
      <!-- 支出/收入切换 -->
      <view class="mb-4 flex justify-center">
        <view class="flex rounded-full bg-black/10 p-1">
          <view
            class="rounded-full px-8 py-1.5 text-sm font-medium transition-all"
            :class="billType === 'expense' ? 'bg-white text-[#EF4444]' : 'text-white/80'"
            @click="switchType('expense')"
          >
            支出
          </view>
          <view
            class="rounded-full px-8 py-1.5 text-sm font-medium transition-all"
            :class="billType === 'income' ? 'bg-white text-[#07C160]' : 'text-white/80'"
            @click="switchType('income')"
          >
            收入
          </view>
        </view>
      </view>

      <!-- 金额输入 -->
      <view class="flex items-baseline justify-center gap-2">
        <text class="text-2xl text-white/80">¥</text>
        <input
          v-model="amountText"
          type="digit"
          placeholder="0.00"
          placeholder-class="text-white/40"
          class="max-w-180px min-w-20 bg-transparent text-center text-4xl text-white font-bold outline-none"
          :class="amountError ? 'placeholder:text-red-300' : ''"
          @input="onAmountInput"
        >
      </view>
    </view>

    <!-- 表单区域 -->
    <view class="flex-1 rounded-t-3xl bg-white px-4 pt-5 shadow-sm -mt-4">
      <!-- 分类选择 -->
      <view class="mb-4">
        <text class="mb-3 block text-xs text-gray-400 font-medium">选择分类</text>
        <view class="grid grid-cols-4 gap-2">
          <view
            v-for="cat in currentCategories"
            :key="cat.id"
            class="flex flex-col items-center rounded-xl py-3 transition-all active:scale-95"
            :class="selectedCategoryId === cat.id
              ? (billType === 'expense' ? 'bg-red-50 ring-1 ring-[#EF4444]' : 'bg-green-50 ring-1 ring-[#07C160]')
              : 'bg-gray-50'"
            @click="selectedCategoryId = cat.id"
          >
            <view
              class="mb-1 text-2xl"
              :class="[
                cat.icon,
                selectedCategoryId === cat.id
                  ? (billType === 'expense' ? 'text-[#EF4444]' : 'text-[#07C160]')
                  : 'text-gray-400',
              ]"
            />
            <text
              class="text-xs"
              :class="selectedCategoryId === cat.id ? 'font-medium text-gray-700' : 'text-gray-400'"
            >
              {{ cat.name }}
            </text>
          </view>
        </view>
      </view>

      <!-- 分割线 -->
      <view class="my-4 border-t border-gray-100" />

      <!-- 日期 -->
      <picker mode="date" :value="selectedDate" :end="dayjs().format('YYYY-MM-DD')" @change="onDateChange">
        <view class="flex items-center justify-between py-3">
          <text class="text-sm text-gray-600">记账日期</text>
          <view class="flex items-center gap-2 text-sm text-gray-400">
            <text>{{ displayDate }}</text>
            <view class="i-carbon-chevron-right text-sm" />
          </view>
        </view>
      </picker>

      <view class="my-1 border-t border-gray-50" />

      <!-- 备注 -->
      <view class="flex items-center py-3">
        <text class="mr-3 text-sm text-gray-600">添加备注</text>
        <input
          v-model="note"
          type="text"
          placeholder="选填，最多30字"
          placeholder-class="text-gray-300"
          :maxlength="30"
          class="flex-1 text-right text-sm text-gray-700 outline-none"
        >
      </view>

      <!-- 保存按钮 -->
      <view class="mt-6">
        <view
          class="h-12 flex items-center justify-center rounded-full text-base text-white font-medium active:opacity-80"
          :class="billType === 'expense' ? 'bg-[#EF4444]' : 'bg-[#07C160]'"
          @click="handleSave"
        >
          {{ isEdit ? '保存修改' : '保存记账' }}
        </view>
      </view>

      <!-- 删除按钮（编辑模式） -->
      <view v-if="isEdit" class="mt-3">
        <view
          class="h-12 flex items-center justify-center border border-red-200 rounded-full text-base text-red-400 font-medium active:opacity-80"
          @click="handleDelete"
        >
          删除此记录
        </view>
      </view>

      <!-- 底部安全区 -->
      <view class="h-6 pb-safe" />
    </view>
  </view>
</template>
