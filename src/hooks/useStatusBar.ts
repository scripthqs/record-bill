/**
 * 获取微信小程序状态栏高度
 * navigationStyle: 'custom' 时必须手动占位状态栏高度
 */
export function useStatusBar() {
  const statusBarHeight = ref(0)

  onMounted(() => {
    try {
      const info = uni.getSystemInfoSync()
      statusBarHeight.value = info.statusBarHeight || 0
    }
    catch {
      statusBarHeight.value = 0
    }
  })

  const statusBarStyle = computed(() => ({
    height: `${statusBarHeight.value}px`,
  }))

  return { statusBarHeight, statusBarStyle }
}
