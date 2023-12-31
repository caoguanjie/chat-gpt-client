<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref, watch } from "vue";
import ChatMsgListBlock from "./ChatMsgListBlock.vue";
import { useStore } from "@/store/store.ts";
import AddTabDialog from "../dialog/AddTabDialog.vue";
import { useMagicKeys, whenever } from "@vueuse/core";
import CTabs from "@/components/base/CTabs.vue";
import CTabPane from "@/components/base/CTabPane.vue";
import { ElMessageBox } from "element-plus";
import SlideSideBarBlock from "@/components/sidebar/SlideSideBarBlock.vue";
import { Robot, RobotTabChatInfo } from "@/types/State.ts";

/**
 * 注册操作tab的快捷键
 */
const store = useStore();
const shortcut = computed(() => store.config.shortcut);
const keys = useMagicKeys();
const addTabKey = keys[shortcut.value.addTab];
const addTabDialogRefs = ref<InstanceType<typeof AddTabDialog> | null>(null);
whenever(addTabKey, () => {
  if (!addTabDialogRefs.value) return;
  addTabDialogRefs.value.show();
});
const removeTabKey = keys[shortcut.value.removeTab];
whenever(removeTabKey, () => {
  confirmRemoveTab(activeTabIndex.value);
});
const prevTabKey = keys[shortcut.value.prevTab];
whenever(prevTabKey, () => {
  const targetIndex = activeTabIndex.value - 1;
  if (targetIndex >= 0) {
    activeTabIndex.value = targetIndex;
  }
});
const nextTabKey = keys[shortcut.value.nextTab];
whenever(nextTabKey, () => {
  const targetIndex = activeTabIndex.value + 1;
  if (targetIndex < chatTabNameList.value.length) {
    activeTabIndex.value = targetIndex;
  }
});
const cleanTabChatKey = keys[shortcut.value.cleanTabChat];
whenever(cleanTabChatKey, () => {
  cleanTabChat();
});

const props = defineProps({
  robotIndex: {
    type: Number,
    default: 0
  },
  tabIndex: {
    type: Number,
    default: 0
  }
});

const cleanTabChat = () => {
  store.cleanTabChat(props.robotIndex, activeTabIndex.value);
};

const activeTabIndex = ref<number>(0);
watch(
  () => activeTabIndex.value,
  () => {
    scrollToBottom();
    // 更新props.tabIndex
    if (!instance) return;
    instance.emit('update:tabIndex', activeTabIndex.value)
  }
);
const confirmRemoveTab = (targetKey: number) => {
  removeTab(targetKey);
};

const addTab = () => {
  if (!addTabDialogRefs.value) return;
  let tabsSize = chatTabNameList.value.length;
  addTabDialogRefs.value.show(tabsSize + 1);
}

const removeTab = (targetKey: number) => {
  if (activeTabIndex.value === targetKey) {
    // 切换tab
    if (targetKey === chatTabNameList.value.length - 1) {
      activeTabIndex.value = targetKey - 1;
    } else {
      activeTabIndex.value = targetKey;
    }
  }
  store.removeChatTab(props.robotIndex, targetKey);
  // 检查当前tab是否是最后一个tab
  if (chatTabNameList.value.length === 0) {
    store.addChatTab(props.robotIndex, "default");
    activeTabIndex.value = 0;
  }
};

const chatTabNameList = computed(() => {
  return store.chatHistory[props.robotIndex]
    .map((item: RobotTabChatInfo) => item.name);
});
const robotOptions = computed(() => store.robotList[props.robotIndex].options);
const removeTabClick = (index: number) => {
  ElMessageBox.confirm("是否确认删除当前聊天窗口?", "Warning", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    removeTab(index);
  }).catch(() => {
  });
};

const slideSideBarBlockRefs = ref<InstanceType<typeof SlideSideBarBlock> | null>(null);
const showSlideSideBar = () => {
  if (!slideSideBarBlockRefs.value) return;
  slideSideBarBlockRefs.value.show();
};

const instance = getCurrentInstance();
const changeRobotClick = (index: number, item: Robot) => {
  if (!instance) return;
  instance.emit('changeRobotClick', index, item);
};

const getTabIndex = () => {
  return activeTabIndex.value;
};
const scrollContainerRefs = ref();
const scrollToBottom = () => {
  // 滚动到底部
  nextTick(() => {
    scrollContainerRefs.value.scrollTop = scrollContainerRefs.value.scrollHeight;
  });
};
defineExpose({
  getTabIndex,
  scrollToBottom,
});
</script>

<template>
  <div ref="scrollContainerRefs" class="overflow-hidden overflow-y-auto box-border scroll-container"
    :class="robotOptions.enabled ? 'mt-28' : 'mt-16'">
    <CTabs v-model:activeKey="activeTabIndex" :tabNames="chatTabNameList" :robotOptions="robotOptions"
      @addTabClick="addTab" @removeTabClick="removeTabClick" @showSlideSideBarClick="showSlideSideBar">
      <CTabPane v-for="(_number, index) in chatTabNameList.length" :key="index">
        <ChatMsgListBlock :robotIndex="props.robotIndex" :tabIndex="index" />
      </CTabPane>
    </CTabs>
    <AddTabDialog ref="addTabDialogRefs" :robotIndex="props.robotIndex" />
    <SlideSideBarBlock ref="slideSideBarBlockRefs" @onClick="changeRobotClick" />
  </div>
</template>
