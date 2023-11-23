<script setup lang="ts">
import { getCurrentInstance, inject, nextTick, ref } from "vue";
import { useStore } from "@/store/store.ts";
import _ from "lodash";
import modelList from "@/util/ModelList.ts";
import { ElForm, ElInput } from "element-plus";

const store = useStore();

const isEdit = ref(false);

const dialogVisible = ref(false);
const formData = ref({
  name: "机器人助手",
  prompt: "欢迎回来，我是你的日常小帮手",
  options: {
    enabled: false,
    apiUrl: "https://fits.ink/",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    context_max_message: 1,
    context_max_tokens: 2048,
    response_max_tokens: 0
  }
});

const formRules = ref({
  name: [
    {
      required: true,
      message: "请输入机器人的名字",
      trigger: "blur"
    }
  ],
  prompt: [
    {
      required: true,
      message: "请输入机器人的提示语",
      trigger: "blur"
    }
  ],
});

const robotIndex = ref<number | null>(null);

const rulesFormRef = ref<InstanceType<typeof ElForm> | null>(null);
const commit = async () => {
  if (!rulesFormRef.value) return;
  await rulesFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (isEdit.value) {
        updateRobot();
      } else {
        addRobot();
      }
      dialogVisible.value = false;
    } else {
      console.log('error', fields);
    }
  });
};

const updateRobot = () => {
  if (robotIndex.value == null) {
    return;
  }
  store.updateRobot(robotIndex.value, _.cloneDeep(formData.value));
};

const instance = getCurrentInstance();
const addRobot = () => {
  store.addRobot(_.cloneDeep(formData.value));
  if (!instance) return;
  instance.emit("commit", formData.value);
};

const robotNameInputRefs = ref<InstanceType<typeof ElInput> | null>(null);
const focusNameInput = () => {
  nextTick(() => {
    if (!robotNameInputRefs.value) return;
    robotNameInputRefs.value.focus();
  });
};

const show = (edit: boolean, index: number) => {
  isEdit.value = edit;
  if (isEdit.value) {
    robotIndex.value = index;
    formData.value = _.cloneDeep(store.robotList[index]);
  }
  dialogVisible.value = true;
  focusNameInput();
};

defineExpose({
  show
});

// 通过判断窗口宽度来设置对话框宽度
const dialogWidth = inject("dialogWidth");
</script>

<template>
  <div class="add-robot-dialog">
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑机器人信息' : '新增机器人信息'" :width="dialogWidth">
      <el-form ref="rulesFormRef" :model="formData" :rules="formRules" label-width="150px">
        <el-form-item label="机器人名字" prop="name">
          <el-input ref="robotNameInputRefs" v-model="formData.name" @pressEnter="commit" />
        </el-form-item>
        <el-form-item label="机器人提示语" prop="prompt">
          <el-input v-model="formData.prompt" @pressEnter="commit" />
        </el-form-item>
        <el-form-item label="高级设置">
          <el-switch v-model="formData.options.enabled" />
        </el-form-item>
        <el-form-item v-if="formData.options.enabled" label="Api Url" prop="apiUrl">
          <el-input v-model="formData.options.apiUrl" />
        </el-form-item>
        <el-form-item v-if="formData.options.enabled" label="Model" prop="model">
          <el-select v-model="formData.options.model">
            <el-option v-for="(item, index) in modelList" :key="index" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="formData.options.enabled" label="Temperature" prop="temperature">
          <el-slider class="ml-2" v-model="formData.options.temperature" :min="0" :max="1" :step="0.1" show-input />
        </el-form-item>
        <el-form-item v-if="formData.options.enabled" label="Context Msg" prop="context_max_message">
          <el-slider class="ml-2" v-model="formData.options.context_max_message" :min="0" :max="20" :step="2"
            show-input />
        </el-form-item>
        <el-form-item v-if="formData.options.enabled" label="Context Token" prop="context_max_tokens">
          <el-slider class="ml-2" v-model="formData.options.context_max_tokens" :min="0" :max="4000" :step="1"
            show-input />
        </el-form-item>
        <el-form-item v-if="formData.options.enabled" label="Res Token" prop="response_max_tokens">
          <el-slider class="ml-2" v-model="formData.options.response_max_tokens" :min="0" :max="4000" :step="1"
            show-input />
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
