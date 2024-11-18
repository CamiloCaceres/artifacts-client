<!-- components/LogViewer.vue -->
<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Activity Log</h2>
      <button
        @click="clearLogs"
        class="text-sm text-gray-500 hover:text-gray-700"
      >
        Clear
      </button>
    </div>

    <div class="space-y-2 max-h-96 overflow-y-auto">
      <div
        v-for="(log, index) in logs"
        :key="index"
        class="text-sm p-2 rounded"
        :class="getLogClass(log.message)"
      >
        <span class="text-gray-400">{{ formatTime(log.timestamp) }}</span>
        <span class="font-medium">{{ log.characterName }}:</span>
        {{ log.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { logs } = useGameSocket();

const clearLogs = () => {
  logs.value = [];
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString();
};

const getLogClass = (message: string) => {
  if (message.includes("Error")) return "bg-red-50 text-red-700";
  if (message.includes("started")) return "bg-green-50 text-green-700";
  if (message.includes("stopped")) return "bg-yellow-50 text-yellow-700";
  return "bg-gray-50 text-gray-700";
};
</script>
