<!-- components/BotCard.vue -->
<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div
            class="w-3 h-3 rounded-full"
            :class="status.isRunning ? 'bg-green-500' : 'bg-gray-300'"
          />
          <h2 class="text-lg font-semibold text-gray-900">{{ name }}</h2>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="startBot(name)"
            :disabled="status.isRunning"
            class="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start
          </button>
          <button
            @click="stopBot(name)"
            :disabled="!status.isRunning"
            class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Stop
          </button>
        </div>
      </div>

      <!-- Bot Configuration -->
      <div class="mb-4 p-3 bg-gray-50 rounded-lg">
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              v-model="localConfig.actionType"
              @change="updateConfig"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              :disabled="status.isRunning"
            >
              <option value="fight">Fight</option>
              <option value="gather">Gather</option>
              <option value="craft">Craft</option>
            </select>
          </div>

          <div v-if="localConfig.actionType === 'gather'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Resource
            </label>
            <select
              v-model="localConfig.resource"
              @change="updateConfig"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              :disabled="status.isRunning"
            >
              <option value="copper">Copper</option>
              <option value="iron">Iron</option>
              <option value="ash_tree">Ash Tree</option>
              <option value="spruce_tree">Spruce Tree</option>
              <option value="sunflower">Sunflower</option>
              <option value="gudgeon">Gudgeon</option>
              <option value="shrimp">Shrimp</option>
            </select>
          </div>

          <div v-if="localConfig.actionType === 'craft'">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700">
                Crafting Cycle
              </label>
              <button
                v-if="localConfig.craftingCycle"
                @click="openCraftingEditor"
                class="text-sm text-blue-500 hover:text-blue-600"
                :disabled="status.isRunning"
              >
                Edit Cycle
              </button>
            </div>
            <div v-if="!localConfig.craftingCycle" class="text-center py-4">
              <button
                @click="openCraftingEditor"
                class="text-sm text-blue-500 hover:text-blue-600"
                :disabled="status.isRunning"
              >
                Configure Crafting Cycle
              </button>
            </div>
            <div v-else class="text-sm">
              <div class="font-medium">{{ localConfig.craftingCycle.name }}</div>
              <div class="text-gray-600">
                {{ localConfig.craftingCycle.steps.length }} steps
              </div>
              <div v-if="status.craftingStats" class="mt-2">
                <div class="flex justify-between">
                  <span>Progress:</span>
                  <span>{{ status.craftingStats.cycleProgress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    class="bg-blue-500 rounded-full h-2 transition-all duration-500"
                    :style="{
                      width: `${status.craftingStats.cycleProgress}%`,
                    }"
                  ></div>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <div class="text-xs text-gray-500">Total Crafts</div>
                    <div class="font-medium">
                      {{ status.craftingStats.totalCrafts }}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">Failed Crafts</div>
                    <div class="font-medium">
                      {{ status.craftingStats.failedCrafts }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="space-y-3">
        <!-- HP Bar -->
        <div v-if="status.currentHp !== undefined && status.maxHp !== undefined">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>HP</span>
            <span>{{ status.currentHp }}/{{ status.maxHp }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-green-500 rounded-full h-2 transition-all duration-500"
              :style="{
                width: `${(status.currentHp / status.maxHp) * 100}%`,
              }"
            />
          </div>
        </div>

        <!-- Basic Stats -->
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-sm text-gray-500">Actions</div>
            <div class="font-semibold">{{ status.totalActions }}</div>
          </div>
          <div class="text-center">
            <div class="text-sm text-gray-500">XP</div>
            <div class="font-semibold">{{ status.totalXp }}</div>
          </div>
          <div class="text-center">
            <div class="text-sm text-gray-500">Gold</div>
            <div class="font-semibold">{{ status.totalGold }}</div>
          </div>
        </div>

        <!-- Items -->
        <div v-if="hasItems">
          <h3 class="text-sm font-medium text-gray-700 mb-2">Items</h3>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <template v-if="status.itemsCollected.size > 0">
              <div
                v-for="[item, quantity] in Array.from(status.itemsCollected)"
                :key="item"
                class="flex justify-between px-2 py-1 bg-gray-50 rounded"
              >
                <span>{{ item }}</span>
                <span class="font-medium">{{ quantity }}</span>
              </div>
            </template>
            <template v-if="status.craftingStats?.itemsCrafted.size > 0">
              <div
                v-for="[item, quantity] in Array.from(
                  status.craftingStats.itemsCrafted
                )"
                :key="item"
                class="flex justify-between px-2 py-1 bg-blue-50 rounded"
              >
                <span>{{ item }} (Crafted)</span>
                <span class="font-medium">{{ quantity }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Last Action -->
        <div v-if="status.lastAction" class="text-sm text-gray-600">
          <div class="font-medium">Last Action:</div>
          <div class="truncate">{{ status.lastAction }}</div>
        </div>

        <!-- Error Message -->
        <div
          v-if="status.lastError"
          class="p-2 bg-red-50 text-red-700 text-sm rounded"
        >
          {{ status.lastError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BotStatus, BotConfig } from "~/types/bot";

const props = defineProps<{
  name: string;
  status: BotStatus;
  config: BotConfig;
}>();

const emit = defineEmits<{
  (event: "openCraftingEditor", botName: string): void;
}>();

const { startBot, stopBot, updateBotConfig } = useGameSocket();

// Create a local copy of the config for editing
const localConfig = ref<BotConfig>({ ...props.config });

// Computed property to check if there are any items to display
const hasItems = computed(() => {
  return (
    props.status.itemsCollected.size > 0 ||
    props.status.craftingStats?.itemsCrafted.size > 0
  );
});

// Watch for external config changes
watch(
  () => props.config,
  (newConfig) => {
    localConfig.value = { ...newConfig };
  },
  { deep: true }
);

// Update config when local changes are made
const updateConfig = () => {
  // If switching away from crafting, remove the crafting cycle
  if (
    localConfig.value.actionType !== "craft" &&
    localConfig.value.craftingCycle
  ) {
    const { craftingCycle, ...configWithoutCycle } = localConfig.value;
    updateBotConfig(props.name, configWithoutCycle);
  } else {
    updateBotConfig(props.name, localConfig.value);
  }
};

// Open crafting editor
const openCraftingEditor = () => {
  emit("openCraftingEditor", props.name);
};
</script>