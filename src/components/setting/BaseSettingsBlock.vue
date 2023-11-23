<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useStore } from "@/store/store.ts";
import _ from "lodash";
import modelList from "@/util/ModelList";
import { BaseConfig } from "@/types/State.ts";
import { ElForm } from "element-plus";

const store = useStore();

const baseConfig = ref<BaseConfig>({
  // openai api key
  apiKey: "",
  // 聊天输入框enter键发送消息
  enterSend: true,
  // ctrl+enter或者shift+enter发送消息/换行
  ctrlEnterSend: false,
  // api请求地址
  apiUrl: "https://fits.ink/",
  // 模型名称
  model: "gpt-3.5-turbo",
  // 温度
  temperature: 0.7,
  // 上下文消息数量
  context_max_message: 1,
  // 上下文最大token数量
  context_max_tokens: 2048,
  // 响应最大token数量
  response_max_tokens: 0
});
const formRules = ref({
  apiKey: [
    { required: true, message: "请输入 Open AI ApiKey", trigger: "blur" }
  ],
  enterSend: [
    { required: true, message: "Please select enterSend", trigger: "blur" }
  ]
});

onMounted(() => {
  initSettingsData();
});
const initSettingsData = () => {
  const config = _.cloneDeep(store.config.base);
  baseConfig.value = { ...baseConfig.value, ...config };
};

const rulesFormRef = ref<InstanceType<typeof ElForm> | null>(null);
const saveData = async () => {
  if (!rulesFormRef.value) return;
  await rulesFormRef.value.validate((valid, fields) => {
    if (valid) {
      store.saveBaseConfig(baseConfig.value);
    } else {
      console.log('error', fields);
      throw new Error("表单验证失败");
    }
  });
};
defineExpose({
  saveData
});
</script>

<template>
  <div class="base-setting-block">
    <el-form ref="rulesFormRef" :model="baseConfig" :rules="formRules" label-width="130px">
      <el-form-item label="ApiKey" prop="apiKey">
        <el-input v-model="baseConfig.apiKey" placeholder="请输入 Open AI ApiKey" />
      </el-form-item>
      <el-form-item label="Enter Key Send" prop="enterSend">
        <el-switch v-model="baseConfig.enterSend" />
        <span class="mx-3"><el-text style="color: #999;" size="small">聊天输入框enter键发送消息</el-text></span>

      </el-form-item>
      <el-form-item label="Ctrl+Enter Break" prop="ctrlEnterSend">
        <el-switch v-model="baseConfig.ctrlEnterSend" />
        <span class="mx-3"><el-text style="color: #999;" size="small">ctrl+enter或者shift+enter发送消息/换行</el-text></span>
      </el-form-item>
      <el-form-item label="Api Url" prop="apiUrl">
        <el-input v-model="baseConfig.apiUrl" />
        <el-alert title="'https://api.openai.com/' 这个Open AI官方域名,在中国访问异常，需要通过Cloudflare Workers服务进行反向代理" type="info"
          :closable="false" show-icon style="padding:0 10px" />
      </el-form-item>
      <el-form-item label="Model" prop="model">
        <el-select v-model="baseConfig.model">
          <el-option v-for="(item, index) in modelList" :key="index" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-space fill>
        <el-alert type="info" show-icon :closable="false">
          <p>"temperature(温度)" 参数是可以控制输出的确定性的，温度越低，输出结果越确定；反之温度越高，输出结果越具有多样性</p>
        </el-alert>
        <el-form-item label="temperature(温度)" prop="temperature">
          <el-slider class="ml-2" v-model="baseConfig.temperature" :min="0" :max="1" :step="0.1" show-input />
        </el-form-item>
      </el-space>
      <el-space fill>
        <el-alert type="info" show-icon :closable="false">
          <p style="width: 590px">控制上下文消息数量</p>
        </el-alert>
        <el-form-item label="Context Msg" prop="context_max_message">
          <el-slider class="ml-2" v-model="baseConfig.context_max_message" :min="0" :max="20" :step="2" show-input />
        </el-form-item>
      </el-space>
      <el-space fill>
        <el-alert type="info" show-icon :closable="false">
          <p> 控制上下文最大token数量，一个token通常对应大约 4 个字符，而1个汉字大致是2~2.5个token。</p>
        </el-alert>
        <el-form-item label="Context Token" prop="context_max_tokens">
          <el-slider class="ml-2" v-model="baseConfig.context_max_tokens" :min="0" :max="4000" :step="1" show-input />
        </el-form-item>
      </el-space>
      <el-space fill>
        <el-alert type="info" show-icon :closable="false">
          <p> 控制响应消息最大token数量，一个token通常对应大约 4 个字符，而1个汉字大致是2~2.5个token。</p>
        </el-alert>
        <el-form-item label="Res Token" prop="response_max_tokens">
          <el-slider class="ml-2" v-model="baseConfig.response_max_tokens" :min="0" :max="4000" :step="1" show-input />
        </el-form-item>
      </el-space>
    </el-form>
  </div>
</template>
