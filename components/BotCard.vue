<!-- components/BotCard.vue -->
<template>
  <div :class="['bg-white', 'dark:bg-gray-800', 'rounded-lg', 'shadow']">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div
            class="w-3 h-3 rounded-full transition-all duration-300"
            :class="status.isRunning 
              ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse' 
              : 'bg-gray-300'"
          />
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ name }}
          </h2>
          <div v-if="status.isRunning" class="flex items-center">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <UIcon name="i-heroicons-play" class="w-3 h-3 mr-1" />
              Active
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <UButton
            color="green"
            @click="startBot(name)"
            :disabled="status.isRunning"
          >
            Start
          </UButton>
          <UButton
            color="red"
            @click="stopBot(name)"
            :disabled="!status.isRunning"
          >
            Stop
          </UButton>
        </div>
      </div>

      <!-- Bot Running Status -->
      <div v-if="status.isRunning" class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div class="flex items-center space-x-3 mb-3">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {{ getActionDescription() }}
            </h3>
            <p v-if="status.lastAction" class="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {{ status.lastAction }}
            </p>
          </div>
        </div>

        <!-- Action-specific stats -->
        <div class="grid grid-cols-2 gap-3 text-sm">
          <!-- Fight Stats -->
          <template v-if="localConfig.actionType === 'fight'">
            <div class="bg-white/50 dark:bg-gray-800/50 rounded px-3 py-2">
              <div class="text-xs text-gray-600 dark:text-gray-400">Total XP</div>
              <div class="font-semibold text-gray-900 dark:text-white">{{ formatNumber(status.totalXp) }}</div>
            </div>
            <div class="bg-white/50 dark:bg-gray-800/50 rounded px-3 py-2">
              <div class="text-xs text-gray-600 dark:text-gray-400">Gold Earned</div>
              <div class="font-semibold text-gray-900 dark:text-white">{{ formatNumber(status.totalGold) }}</div>
            </div>
          </template>

          <!-- Gather Stats -->
          <template v-if="localConfig.actionType === 'gather'">
            <div class="bg-white/50 dark:bg-gray-800/50 rounded px-3 py-2">
              <div class="text-xs text-gray-600 dark:text-gray-400">Resources Gathered</div>
              <div class="font-semibold text-gray-900 dark:text-white">{{ getTotalItemsCollected() }}</div>
            </div>
            <div class="bg-white/50 dark:bg-gray-800/50 rounded px-3 py-2">
              <div class="text-xs text-gray-600 dark:text-gray-400">Total XP</div>
              <div class="font-semibold text-gray-900 dark:text-white">{{ formatNumber(status.totalXp) }}</div>
            </div>
          </template>

          <!-- Craft Stats -->
          <template v-if="localConfig.actionType === 'craft' && status.craftingStats">
            <div class="bg-white/50 dark:bg-gray-800/50 rounded px-3 py-2">
              <div class="text-xs text-gray-600 dark:text-gray-400">Items Crafted</div>
              <div class="font-semibold text-gray-900 dark:text-white">{{ status.craftingStats.totalCrafts }}</div>
            </div>
            <div class="bg-white/50 dark:bg-gray-800/50 rounded px-3 py-2">
              <div class="text-xs text-gray-600 dark:text-gray-400">Cycle Progress</div>
              <div class="font-semibold text-gray-900 dark:text-white">
                {{ status.craftingStats.cycleProgress }}%
              </div>
            </div>
          </template>

          <!-- Common Stats -->
          <div class="bg-white/50 dark:bg-gray-800/50 rounded px-3 py-2">
            <div class="text-xs text-gray-600 dark:text-gray-400">Total Actions</div>
            <div class="font-semibold text-gray-900 dark:text-white">{{ formatNumber(status.totalActions) }}</div>
          </div>
          <div v-if="status.lastError" class="bg-red-50 dark:bg-red-900/20 rounded px-3 py-2 col-span-2">
            <div class="text-xs text-red-800 dark:text-red-200">{{ status.lastError }}</div>
          </div>
        </div>
      </div>

      <!-- Bot Configuration (hidden when running) -->
      <div v-else class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="space-y-3">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Action Type
            </label>
            <select
              v-model="localConfig.actionType"
              @change="updateConfig"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 dark:bg-gray-600 dark:text-white"
              :disabled="status.isRunning"
            >
              <option value="fight">Fight</option>
              <option value="gather">Gather</option>
              <option value="craft">Craft</option>
            </select>
          </div>

          <!-- Monster Selection -->
          <div v-if="localConfig.actionType === 'fight'" class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Select Monster
            </label>
            <UInputMenu
              :model-value="selectedMonster"
              :options="monsterOptions"
              option-attribute="label"
              value-attribute="code"
              :disabled="status.isRunning"
              placeholder="Select a monster"
              @update:model-value="updateMonsterSelection"
            >
              <template #option="{ option: monster }">
                <div class="flex items-center gap-2">
                  <span class="truncate">{{
                    formatMonsterName(monster.code)
                  }}</span>
                  <span class="text-xs text-gray-500"
                    >({{ monster.locations.length }} locations)</span
                  >
                </div>
              </template>
            </UInputMenu>

            <!-- Monster Location Selection -->
            <div
              v-if="selectedMonster && monsterLocations.length > 1"
              class="mt-2"
            >
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Select Location
              </label>
              <USelect
                :model-value="selectedLocation"
                :options="locationOptions"
                :disabled="status.isRunning"
                @update:model-value="updateMonsterLocation"
                option-attribute="label"
                value-attribute="value"
                placeholder="Select location"
              >
                <template #option="{ option }">
                  <span>Position ({{ option.x }}, {{ option.y }})</span>
                </template>
              </USelect>
            </div>
          </div>

          <!-- Resource Selection -->
          <div v-if="localConfig.actionType === 'gather'" class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Select Resource
            </label>
            <UInputMenu
              :model-value="selectedResource"
              :options="resourceOptions"
              option-attribute="label"
              value-attribute="code"
              :disabled="status.isRunning"
              placeholder="Select a resource"
              @update:model-value="updateResourceSelection"
            >
              <template #option="{ option: resource }">
                <div class="flex items-center gap-2">
                  <span class="truncate">{{
                    formatResourceName(resource.code)
                  }}</span>
                  <span class="text-xs text-gray-500"
                    >({{ resource.locations.length }} locations)</span
                  >
                </div>
              </template>
            </UInputMenu>

            <!-- Resource Location Selection -->
            <div
              v-if="selectedResource && resourceLocations.length > 1"
              class="mt-2"
            >
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Select Location
              </label>
              <USelect
                :model-value="selectedResourceLocation"
                :options="resourceLocationOptions"
                :disabled="status.isRunning"
                @update:model-value="updateResourceLocation"
                option-attribute="label"
                value-attribute="value"
                placeholder="Select location"
              >
                <template #option="{ option }">
                  <span
                    >{{ option.name }} ({{ option.x }}, {{ option.y }})</span
                  >
                </template>
              </USelect>
            </div>
          </div>

          <!-- Crafting Section -->
          <div v-if="localConfig.actionType === 'craft'">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700">
                Crafting Cycle
              </label>
              <UButton
                color="blue"
                v-if="localConfig.craftingCycle"
                @click="openCraftingEditor"
                :disabled="status.isRunning"
              >
                Edit Cycle
              </UButton>
            </div>
            <div v-if="!localConfig.craftingCycle" class="text-center py-4">
              <UButton
                color="blue"
                variant="link"
                @click="openCraftingEditor"
                :disabled="status.isRunning"
              >
                Configure Crafting Cycle
              </UButton>
            </div>
            <div v-else class="text-sm">
              <div class="font-medium">
                {{ localConfig.craftingCycle.name }}
              </div>
              <div class="text-gray-600">
                {{ localConfig.craftingCycle.steps.length }} steps
              </div>
              <CraftingStats
                v-if="status.craftingStats"
                :stats="status.craftingStats"
                :cycleName="localConfig.craftingCycle.name"
                :isRunning="status.isRunning"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- HP Bar (always visible when we have HP data) -->
      <div
        v-if="status.currentHp !== undefined && status.maxHp !== undefined"
        :class="[
          'p-3 rounded-lg mb-4',
          status.isRunning 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-gray-50 dark:bg-gray-700'
        ]"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Health</span>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ status.currentHp }}/{{ status.maxHp }}
          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
          <div
            :class="[
              'rounded-full h-3 transition-all duration-500',
              getHpBarColor(status.currentHp, status.maxHp)
            ]"
            :style="{
              width: `${Math.max((status.currentHp / status.maxHp) * 100, 5)}%`,
            }"
          />
        </div>
        <div v-if="status.isRunning && getHpPercentage(status.currentHp, status.maxHp) < 20" 
             class="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
          ⚠️ Low health!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  BotStatus,
  BotConfig,
  Position,
  MonsterLocation,
  ResourceLocation,
} from "~/types/bot";

const props = defineProps<{
  name: string;
  status: BotStatus;
  config: BotConfig;
  monsters?: { code: string; locations: MonsterLocation[] }[];
  resources?: { code: string; locations: ResourceLocation[] }[];
}>();

const emit = defineEmits<{
  (event: "openCraftingEditor", botName: string): void;
}>();

const { startBot, stopBot, updateBotConfig } = useGameSocket();

// Create a local copy of the config for editing
const localConfig = ref<BotConfig>({ ...props.config });
const selectedMonster = ref<string | null>(
  props.config.selectedMonster || null
);
const selectedLocation = ref<Position | null>(null);
const selectedResource = ref<string | null>(props.config.resource || null);
const selectedResourceLocation = ref<Position | null>(null);

// Transform monsters data for UInputMenu
const monsterOptions = computed(() => {
  if (!props.monsters) return [];
  return props.monsters.map((monster) => ({
    code: monster.code,
    label: formatMonsterName(monster.code),
    locations: monster.locations,
  }));
});

// Transform resources data for UInputMenu
const resourceOptions = computed(() => {
  if (!props.resources) return [];
  return props.resources.map((resource) => ({
    code: resource.code,
    label: formatResourceName(resource.code),
    locations: resource.locations,
  }));
});

// Get locations for selected monster
const monsterLocations = computed(() => {
  if (!selectedMonster.value || !props.monsters) return [];
  const monster = props.monsters.find((m) => m.code === selectedMonster.value);
  return monster
    ? monster.locations.map((l) => ({ x: l.position.x, y: l.position.y }))
    : [];
});

// Get locations for selected resource
const resourceLocations = computed(() => {
  if (!selectedResource.value || !props.resources) return [];
  const resource = props.resources.find(
    (r) => r.code === selectedResource.value
  );
  return resource ? resource.locations : [];
});

// Format monster name from snake_case to Title Case
function formatMonsterName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Format resource name from snake_case to Title Case
function formatResourceName(name: string): string {
  return name
    .split("_")
    .filter((word) => !["rocks", "fishing", "spot"].includes(word)) // Filter out common suffixes
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Transform locations into options for USelect
const locationOptions = computed(() => {
  if (!selectedMonster.value || !props.monsters) return [];
  const monster = props.monsters.find((m) => m.code === selectedMonster.value);
  if (!monster) return [];

  return monster.locations.map((loc) => ({
    label: `Position (${loc.position.x}, ${loc.position.y})`,
    value: { x: loc.position.x, y: loc.position.y },
    x: loc.position.x,
    y: loc.position.y,
    skin: loc.skin,
  }));
});

// Transform resource locations into options for USelect
const resourceLocationOptions = computed(() => {
  if (!selectedResource.value || !props.resources) return [];
  const resource = props.resources.find(
    (r) => r.code === selectedResource.value
  );
  if (!resource) return [];

  return resource.locations.map((loc) => ({
    label: `${loc.name}`,
    value: { x: loc.position.x, y: loc.position.y },
    name: loc.name,
    x: loc.position.x,
    y: loc.position.y,
    skin: loc.skin,
  }));
});

// Watch for external config changes
watch(
  () => props.config,
  (newConfig) => {
    localConfig.value = { ...newConfig };
    selectedMonster.value = newConfig.selectedMonster || null;
    selectedResource.value = newConfig.resource || null;
  },
  { deep: true }
);

// Update monster selection
function updateMonsterSelection(monster: string) {
  const monsterData = props.monsters?.find((m) => m.code === monster);
  if (!monsterData) return;

  selectedMonster.value = monster;

  if (monsterData.locations.length === 1) {
    const location = monsterData.locations[0];
    selectedLocation.value = {
      x: location.position.x,
      y: location.position.y,
    };
    localConfig.value = {
      ...localConfig.value,
      selectedMonster: monster,
      monsterSkin: location.skin,
      fightLocation: { x: location.position.x, y: location.position.y },
    };
  } else {
    selectedLocation.value = null;
    localConfig.value = {
      ...localConfig.value,
      selectedMonster: monster,
      fightLocation: undefined,
    };
  }

  updateConfig();
}

// Update resource selection
function updateResourceSelection(resource: string) {
  const resourceData = props.resources?.find((r) => r.code === resource);
  if (!resourceData) return;

  selectedResource.value = resource;

  if (resourceData.locations.length === 1) {
    const location = resourceData.locations[0];
    selectedResourceLocation.value = {
      x: location.position.x,
      y: location.position.y,
    };
    localConfig.value = {
      ...localConfig.value,
      resource: resource,
      resourceSkin: location.skin,
    };
  } else {
    selectedResourceLocation.value = null;
    localConfig.value = {
      ...localConfig.value,
      resource: resource,
      resourceSkin: undefined,
    };
  }

  updateConfig();
}

// Update monster location
function updateMonsterLocation(location: Position) {
  selectedLocation.value = location;

  const monster = props.monsters?.find((m) => m.code === selectedMonster.value);
  const locationData = monster?.locations.find(
    (loc) => loc.position.x === location.x && loc.position.y === location.y
  );

  localConfig.value = {
    ...localConfig.value,
    fightLocation: location,
    monsterSkin: locationData?.skin,
  };

  updateConfig();
}

// Update resource location
function updateResourceLocation(location: Position) {
  selectedResourceLocation.value = location;

  const resource = props.resources?.find(
    (r) => r.code === selectedResource.value
  );
  const locationData = resource?.locations.find(
    (loc) => loc.position.x === location.x && loc.position.y === location.y
  );

  localConfig.value = {
    ...localConfig.value,
    resourceSkin: locationData?.skin,
  };

  updateConfig();
}

// Update config when local changes are made
const updateConfig = () => {
  updateBotConfig(props.name, localConfig.value);
};

// Open crafting editor
const openCraftingEditor = () => {
  emit("openCraftingEditor", props.name);
};

// Helper functions for the running status display
function getActionDescription(): string {
  switch (localConfig.value.actionType) {
    case 'fight':
      const monsterName = localConfig.value.selectedMonster 
        ? formatMonsterName(localConfig.value.selectedMonster)
        : 'monsters';
      return `Fighting ${monsterName}`;
    case 'gather':
      const resourceName = localConfig.value.resource 
        ? formatResourceName(localConfig.value.resource)
        : 'resources';
      return `Gathering ${resourceName}`;
    case 'craft':
      const cycleName = localConfig.value.craftingCycle?.name || 'items';
      return `Crafting ${cycleName}`;
    default:
      return 'Running';
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function getTotalItemsCollected(): number {
  if (!props.status.itemsCollected) return 0;
  
  let total = 0;
  for (const [, quantity] of props.status.itemsCollected) {
    total += quantity;
  }
  return total;
}

function getHpPercentage(current: number, max: number): number {
  return Math.round((current / max) * 100);
}

function getHpBarColor(current: number, max: number): string {
  const percentage = getHpPercentage(current, max);
  if (percentage <= 20) return 'bg-red-500';
  if (percentage <= 50) return 'bg-yellow-500';
  return 'bg-green-500';
}
</script>
