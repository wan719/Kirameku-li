<script setup lang="ts">
import { type CSSProperties, ref, computed } from "vue";
import { useUserStoreHook } from "@/store/modules/user";

defineOptions({
  name: "PermissionPage"
});

const elStyle = computed((): CSSProperties => {
  return {
    width: "85vw",
    justifyContent: "start"
  };
});

const username = ref(useUserStoreHook()?.username);
</script>

<template>
  <div>
    <p class="mb-2!">当前页面仅展示已认证身份，不提供模拟账号切换。</p>
    <el-card shadow="never" :style="elStyle">
      <template #header>
        <div class="card-header">
          <span>当前角色：{{ username }}</span>
        </div>
        <el-link
          class="mt-2"
          href="https://github.com/pure-admin/vue-pure-admin/blob/main/src/views/permission/page/index.vue"
          target="_blank"
        >
          代码位置 src/views/permission/page/index.vue
        </el-link>
      </template>
      <el-input :model-value="username" class="w-60!" disabled />
    </el-card>
  </div>
</template>
