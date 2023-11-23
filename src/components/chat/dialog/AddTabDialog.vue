<script setup lang="ts">
import { getCurrentInstance, inject, nextTick, ref } from "vue";
import { useStore } from "@/store/store.ts";
import { ElForm, ElInput, ElMessage } from "element-plus";

const store = useStore();

const props = defineProps({
  robotIndex: {
    type: Number,
    default: -1
  },
});

const dialogVisible = ref(false);
const formData = ref({
  name: ""
});
const namePlaceholder = ref("");
const formRules = ref({
  name: [
    {
      required: true,
      message: "请输入聊天窗口的名字",
      trigger: "change"
    }
  ]
});

const instance = getCurrentInstance();
const addTabFormRef = ref<InstanceType<typeof ElForm> | null>(null);
const commit = async () => {
  if (!addTabFormRef.value) return;
  if (props.robotIndex < 0) {
    ElMessage.warning("请先选择一个机器人助手");
    return;
  }
  if (!formData.value.name || formData.value.name.trim() === "") {
    formData.value.name = namePlaceholder.value;
  }
  await addTabFormRef.value.validate((valid, fields) => {
    if (valid) {
      store.addChatTab(props.robotIndex, formData.value.name);
      dialogVisible.value = false;
      if (!instance) return;
      instance.emit("addTabSuccess");
    } else {
      console.log('error', fields);
    }
  });
};

const show = (newTabIndex: number) => {
  dialogVisible.value = true;
  namePlaceholder.value = `新增第 ${newTabIndex} 个窗口`;
  focusNameInput();
};
const addTabInputRefs = ref<InstanceType<typeof ElInput> | null>(null);
const focusNameInput = () => {
  setTimeout(() => {
    nextTick(() => {
      if (!addTabInputRefs.value) return;
      addTabInputRefs.value.focus();
    });
  });
};

defineExpose({
  show
});

// 通过判断窗口宽度来设置对话框宽度
const dialogWidth = inject("dialogWidth");
</script>

<template>
  <div class="add-tab-dialog">
    <el-dialog v-model="dialogVisible" title="新增聊天窗口" :width="dialogWidth" @submit.native.prevent="commit">
      <el-form ref="addTabFormRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="名称" prop="name">
          <el-input ref="addTabInputRefs" v-model="formData.name" @pressEnter.stop="commit"
            :placeholder="namePlaceholder" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="commit">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
