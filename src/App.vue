<script setup lang="ts">

import { useStore } from "@/store/store.ts";
import { computed, onMounted, Ref, watch } from "vue";

const store = useStore();

// 暗模式配置
const isDarkMode: Ref<boolean> = computed(() => store.config.isDarkMode);

onMounted(() => {
  // 初始化暗模式
  switchDarkMode(isDarkMode.value);
});

// 监听 isDarkMode
watch(isDarkMode, (newVal) => {
  // 给html标签添加dark类
  switchDarkMode(newVal);
});

const switchDarkMode = (isDark: boolean) => {
  let querySelector = document.querySelector("html");
  if (!querySelector) {
    return;
  }
  if (isDark) {
    querySelector.classList.add("dark");
  } else {
    querySelector.classList.remove("dark");
  }
}

</script>

<template>
  <div class="bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white flex-row w-full h-full">
    <router-view />
  </div>
</template>

<style lang="less">
@import "assets/fonts/harmonyos_fonts.css";
@import "assets/icons/iconfont.css";

body,
html {
  @apply p-0 m-0 h-screen w-full;
  font-family: "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
}



#app {
  @apply h-full w-full text-sm;
}

div::-webkit-scrollbar {
  @apply w-2 h-2 rounded-full;
}

div::-webkit-scrollbar-track {
  @apply bg-neutral-300 dark:bg-neutral-800 rounded-full;
}

div::-webkit-scrollbar-thumb {
  @apply bg-neutral-400 dark:bg-neutral-600 rounded-full;
}

div::-webkit-scrollbar-thumb:hover {
  @apply bg-neutral-500 dark:bg-neutral-700;
}
</style>
