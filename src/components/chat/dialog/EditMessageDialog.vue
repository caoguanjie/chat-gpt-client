<script setup lang="ts">
import { inject, ref } from "vue";
import { useStore } from "@/store/store.ts";
import _ from "lodash";
import { ElForm, ElMessage } from "element-plus";
import { ChatMessage } from "@/types/State.ts";

const store = useStore();
const dialogVisible = ref(false);

const formData = ref<ChatMessage>({
  role: "system",
  content: ""
});
const formRules = ref({
  role: [
    {
      required: true,
      message: "请输入角色",
      trigger: "blur"
    }
  ],
  content: [
    {
      required: true,
      message: "请输入message",
      trigger: "blur"
    }
  ]
});

const robotIndex = ref<number>(0);
const tabIndex = ref<number>(0);
const messageIndex = ref<number>(0);

const editMessageFormRef = ref<InstanceType<typeof ElForm> | null>(null);
const commit = async () => {
  if (!editMessageFormRef.value) return;
  if (!robotIndex.value || !tabIndex.value || !messageIndex.value) {
    ElMessage.warning("请先输入一条消息")
    return;
  }
  await editMessageFormRef.value.validate((valid, fields) => {
    if (valid) {
      store.updateMessage(robotIndex.value, tabIndex.value, messageIndex.value, formData.value);
      dialogVisible.value = false;
    } else {
      console.log('error', fields);
    }
  });
};

const show = (rIndex: number, tIndex: number, mIndex: number) => {
  robotIndex.value = rIndex;
  tabIndex.value = tIndex;
  messageIndex.value = mIndex;
  const message = store.chatHistory[rIndex][tIndex].chat[mIndex];
  formData.value = _.cloneDeep(message);
  dialogVisible.value = true;
};

defineExpose({
  show
});

// 通过判断窗口宽度来设置对话框宽度
const dialogWidth = inject("dialogWidth");
</script>

<template>
  <div class="edit-message-dialog">
    <el-dialog v-model="dialogVisible" title="编辑对话信息" @ok="commit" @cancel="dialogVisible = false" :width="dialogWidth">
      <el-form ref="editMessageFormRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option value="system">system</el-option>
            <el-option value="user">user</el-option>
            <el-option value="assistant">assistant</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Message" prop="content">
          <el-input type="textarea" v-model="formData.content" :auto-size="{ minRows: 3, maxRows: 6 }" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="commit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
