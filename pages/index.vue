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
            <ConnectionStatus />
            <GlobalControls />
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Summary -->
      <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-500">Total Actions</div>
          <div class="text-2xl font-bold">
            {{ totalActions.toLocaleString() }}
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-500">Total XP</div>
          <div class="text-2xl font-bold">
            {{ totalXp.toLocaleString() }}
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-500">Total Gold</div>
          <div class="text-2xl font-bold">
            {{ totalGold.toLocaleString() }}
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-500">Active Bots</div>
          <div class="text-2xl font-bold">
            {{ activeBotCount }}/{{ Object.keys(botsStatus).length }}
          </div>
        </div>
      </div>

      <!-- Bot Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BotCard
          v-for="(status, name) in botsStatus"
          :key="name"
          :name="name"
          :status="status"
          :config="botsConfig[name]"
          @openCraftingEditor="openCraftingEditor"
        />
      </div>

      <!-- Logs Section -->
      <div class="mt-8 bg-white rounded-lg shadow">
        <LogViewer />
      </div>

      <!-- Crafting Editor Modal -->
      <CraftingEditor
        v-model="showCraftingEditor"
        :bot-name="selectedBot"
        :status="selectedBot ? botsStatus[selectedBot] : undefined"
        @apply="applyCraftingCycle"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CraftingCycle } from '~/types/bot';

const { botsStatus, botsConfig, updateCraftingCycle } = useGameSocket();

// Crafting editor state
const showCraftingEditor = ref(false);
const selectedBot = ref('');

// Stats computations
const totalActions = computed(() => 
  Object.values(botsStatus.value).reduce((sum, status) => 
    sum + (status.totalActions || 0), 0
  )
);

const totalXp = computed(() => 
  Object.values(botsStatus.value).reduce((sum, status) => 
    sum + (status.totalXp || 0), 0
  )
);

const totalGold = computed(() => 
  Object.values(botsStatus.value).reduce((sum, status) => 
    sum + (status.totalGold || 0), 0
  )
);

const activeBotCount = computed(() => 
  Object.values(botsStatus.value).filter(status => 
    status.isRunning
  ).length
);

// Crafting editor handlers
const openCraftingEditor = (botName: string) => {
  selectedBot.value = botName;
  showCraftingEditor.value = true;
};

const applyCraftingCycle = (cycle: CraftingCycle) => {
  if (selectedBot.value) {
    updateCraftingCycle(selectedBot.value, cycle);
  }
};

// Watch for configuration changes to update bot cards
watch(botsConfig, (newConfig) => {
  // This watch is useful if you need to react to config changes
  // For example, you might want to update the UI or trigger some side effects
}, { deep: true });

// Initialize any required state on mount
onMounted(() => {
  // Add any initialization logic here
});

// Clean up on unmount
onUnmounted(() => {
  // Add any cleanup logic here
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>