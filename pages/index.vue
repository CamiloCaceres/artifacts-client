<!-- pages/index.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Game Bot Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <GlobalControls />
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BotCard
          v-for="(status, name) in botsStatus"
          :key="name"
          :name="name"
          :status="status"
          :config="botsConfig[name]"
        />
      </div>

      <div class="mt-8 bg-white rounded-lg shadow">
        <LogViewer />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { botsStatus, botsConfig } = useGameSocket();
</script>