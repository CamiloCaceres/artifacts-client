<!-- components/CraftingStats.vue -->
<template>
    <div class="space-y-4">
      <!-- Cycle Information -->
      <div class="p-3 bg-blue-50 rounded-lg">
        <div class="flex justify-between items-center mb-2">
          <h4 class="text-sm font-medium text-blue-900">Current Cycle</h4>
          <span
            class="px-2 py-1 text-xs rounded-full"
            :class="isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
          >
            {{ isRunning ? "Active" : "Inactive" }}
          </span>
        </div>
        <div class="text-sm text-blue-800">{{ cycleName }}</div>
      </div>
  
      <!-- Progress Section -->
      <div class="space-y-2">
        <div class="flex justify-between text-sm text-gray-600">
          <span>Cycle Progress</span>
          <span>{{ stats.cycleProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-500 rounded-full h-2 transition-all duration-500"
            :style="{ width: `${stats.cycleProgress}%` }"
          />
        </div>
      </div>
  
      <!-- Statistics Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div class="p-3 bg-gray-50 rounded-lg">
          <div class="text-xs text-gray-500 mb-1">Total Crafts</div>
          <div class="text-lg font-semibold">{{ stats.totalCrafts }}</div>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg">
          <div class="text-xs text-gray-500 mb-1">Failed Crafts</div>
          <div 
            class="text-lg font-semibold"
            :class="stats.failedCrafts > 0 ? 'text-red-600' : ''"
          >
            {{ stats.failedCrafts }}
          </div>
        </div>
      </div>
  
      <!-- Materials Section -->
      <div v-if="stats.materialsUsed.size > 0" class="space-y-2">
        <h4 class="text-sm font-medium text-gray-700">Materials Used</h4>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="[material, amount] in Array.from(stats.materialsUsed)"
            :key="material"
            class="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
          >
            <span class="text-gray-600">{{ formatItemName(material) }}</span>
            <span class="font-medium">{{ amount }}</span>
          </div>
        </div>
      </div>
  
      <!-- Items Crafted Section -->
      <div v-if="stats.itemsCrafted.size > 0" class="space-y-2">
        <h4 class="text-sm font-medium text-gray-700">Items Crafted</h4>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="[item, amount] in Array.from(stats.itemsCrafted)"
            :key="item"
            class="flex justify-between items-center p-2 bg-green-50 rounded text-sm"
          >
            <span class="text-gray-600">{{ formatItemName(item) }}</span>
            <span class="font-medium">{{ amount }}</span>
          </div>
        </div>
      </div>
  
      <!-- Success Rate -->
      <div class="p-3 bg-gray-50 rounded-lg">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Success Rate</span>
          <span
            class="text-sm font-medium"
            :class="successRateColor"
          >
            {{ successRate }}%
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            class="rounded-full h-2 transition-all duration-500"
            :class="successRateColor"
            :style="{ width: `${successRate}%` }"
          />
        </div>
      </div>
  
      <!-- Efficiency Metrics -->
      <div v-if="showEfficiencyMetrics" class="grid grid-cols-2 gap-4">
        <div class="p-3 bg-gray-50 rounded-lg">
          <div class="text-xs text-gray-500 mb-1">Crafts per Hour</div>
          <div class="text-lg font-semibold">{{ craftsPerHour }}</div>
        </div>
        <div class="p-3 bg-gray-50 rounded-lg">
          <div class="text-xs text-gray-500 mb-1">Time per Craft</div>
          <div class="text-lg font-semibold">{{ timePerCraft }}s</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import type { CraftingStats } from '~/types/bot';
  
  const props = defineProps<{
    stats: CraftingStats;
    cycleName: string;
    isRunning: boolean;
    startTime?: number;
  }>();
  
  // Format item names (convert from snake_case or camelCase to Title Case)
  const formatItemName = (name: string) => {
    return name
      .split(/[_-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Calculate success rate
  const successRate = computed(() => {
    if (props.stats.totalCrafts === 0) return 100;
    return Math.round(
      ((props.stats.totalCrafts - props.stats.failedCrafts) / props.stats.totalCrafts) * 100
    );
  });
  
  // Success rate color based on percentage
  const successRateColor = computed(() => {
    if (successRate.value >= 90) return 'text-green-600 bg-green-500';
    if (successRate.value >= 75) return 'text-yellow-600 bg-yellow-500';
    return 'text-red-600 bg-red-500';
  });
  
  // Efficiency metrics calculations
  const showEfficiencyMetrics = computed(() => props.startTime && props.stats.totalCrafts > 0);
  
  const craftsPerHour = computed(() => {
    if (!props.startTime || props.stats.totalCrafts === 0) return 0;
    const hoursSinceStart = (Date.now() - props.startTime) / (1000 * 60 * 60);
    return Math.round(props.stats.totalCrafts / hoursSinceStart);
  });
  
  const timePerCraft = computed(() => {
    if (!props.startTime || props.stats.totalCrafts === 0) return 0;
    const secondsSinceStart = (Date.now() - props.startTime) / 1000;
    return Math.round(secondsSinceStart / props.stats.totalCrafts);
  });
  
  // Expose metrics for parent components if needed
  defineExpose({
    successRate,
    craftsPerHour,
    timePerCraft
  });
  </script>
  
