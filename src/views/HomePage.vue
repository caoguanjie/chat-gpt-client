<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import SideBarBlock from "@/components/sidebar/SideBarBlock.vue";

import ChatContentBlock from "@/components/chat/block/ChatContentBlock.vue";
import { useStore } from "@/store/store.ts";
import { Robot } from "@/types/State.ts";
import { isPlatform } from "@/util/platform";


const isElectron = ref(isPlatform('electron'))
/**
 * 监听窗口关闭事件，直接退出程序
 */
onMounted(() => {
  checkConfig();

});


/**
 * 检查配置项内容
 */
const store = useStore();
const checkConfig = () => {
  const oldVersion = store.version;
  const newVersion = import.meta.env.VITE_APP_VERSION;
  if (oldVersion !== newVersion) store.version = newVersion;
  console.log(`oldVersion: ${oldVersion}, newVersion: ${newVersion}`);
  // vuex -> pinia
  switchVuex2Pinia();
};

const switchVuex2Pinia = () => {
  let oldLocalData = localStorage.getItem("vuex");
  if (!oldLocalData || oldLocalData.length <= 0) return;
  const oldState = JSON.parse(oldLocalData);
  if (!oldState.version) return;
  console.log("vuex -> pinia");
  store.setAllData(oldState);
  localStorage.removeItem("vuex");
}

const chatContentBlockRefs = ref<InstanceType<typeof ChatContentBlock> | null>(null);
const changeRobotClick = (index: number, item: Robot) => {
  nextTick(() => {
    if (!chatContentBlockRefs.value) return;
    chatContentBlockRefs.value.changeRobot(index, item);
  });
};
</script>

<template>
  <div class="w-full h-full flex flex-row box-border layout" :class="{ web: !isElectron, electron: isElectron }">
    <SideBarBlock class="hidden lg:flex" @onClick="changeRobotClick" />
    <ChatContentBlock class="flex-1" ref="chatContentBlockRefs" />
  </div>
</template>

<style lang="scss">
#app,
#app>* {

  display: flex;
  justify-content: center;
  align-items: center;
}

.layout {
  min-width: 600px;
  min-height: 370px;
  max-width: 1400px;
  overflow: hidden;
}

// fix css style bug in open el-dialog
.web {
  border: 1px solid #dedede;
  border-radius: 20px;
  box-shadow: 50px 50px 100px 10px rgba(0, 0, 0, .1);
  width: 90vw;
  height: 90vh;
}

.electron {
  width: 100%;
  height: 100%;
}

@media screen and (max-width: 1024px) {

  .electron,
  .web {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
