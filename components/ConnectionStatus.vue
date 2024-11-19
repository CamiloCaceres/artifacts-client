<!-- components/ConnectionStatus.vue -->
<template>
  <div class="flex items-center space-x-2">
    <div
      class="w-3 h-3 rounded-full"
      :class="isConnected ? 'bg-green-500' : 'bg-red-500'"
    />
    <span class="text-sm text-gray-600 dark:text-gray-300">
      {{ isConnected ? "Connected" : "Disconnected" }}
    </span>
  </div>
</template>

<script setup lang="ts">
const { isConnected } = useGameSocket();
</script>
