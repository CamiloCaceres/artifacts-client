<!-- components/GlobalControls.vue -->
<template>
    <div class="flex items-center space-x-4">
      <ConnectionStatus />
      <div class="flex items-center space-x-2">
        <button
          @click="startAllBots"
          class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          :disabled="!isConnected"
        >
          Start All
        </button>
        <button
          @click="stopAllBots"
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          :disabled="!isConnected"
        >
          Stop All
        </button>
      </div>
    </div>
  </template>
    
  <script setup lang="ts">
  const { startAllBots, stopAllBots, isConnected } = useGameSocket();
  </script>