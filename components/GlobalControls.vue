<!-- components/GlobalControls.vue -->
<template>
    <div class="flex items-center space-x-4">
      <ConnectionStatus />
      <div class="flex items-center space-x-2">
        <UButton
          color="green"
          @click="startAllBots"
          :disabled="!isConnected"
        >
          Start All
        </UButton>
        <UButton
          color="red"
          @click="stopAllBots"
          :disabled="!isConnected"
        >
          Stop All
        </UButton>
        <DarkModeButton />

      </div>
    </div>
  </template>
    
  <script setup lang="ts">
  const { startAllBots, stopAllBots, isConnected } = useGameSocket();
  </script>