<!-- components/BotCard.vue -->
<template>
  <div :class="['bg-white', 'dark:bg-gray-800', 'rounded-lg', 'shadow']">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div
            class="w-3 h-3 rounded-full"
            :class="status.isRunning ? 'bg-green-500' : 'bg-gray-300'"
          />
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ name }}
          </h2>
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

      <!-- Bot Configuration -->
      <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
              v-model="selectedMonster"
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
                v-model="selectedLocation"
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

          <div v-if="localConfig.actionType === 'gather'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Resource
            </label>
            <USelect
              v-model="localConfig.resource"
              :options="resourceOptions"
              @update:model-value="updateConfig"
              :disabled="status.isRunning"
              placeholder="Select resource"
            />
          </div>

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
        <div
          v-if="status.currentHp !== undefined && status.maxHp !== undefined"
        >
          <div
            class="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1"
          >
            <span>HP</span>
            <span>{{ status.currentHp }}/{{ status.maxHp }}</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
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
import { BotStatus, BotConfig, Position, MonsterLocation } from "~/types/bot";

const props = defineProps<{
  name: string;
  status: BotStatus;
  config: BotConfig;
  monsters?: { code: string; locations: MonsterLocation[] }[];
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

// Transform monsters data for UInputMenu
const monsterOptions = computed(() => {
  if (!props.monsters) return [];
  return props.monsters.map((monster) => ({
    code: monster.code,
    label: formatMonsterName(monster.code),
    locations: monster.locations,
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

// Format monster name from snake_case to Title Case
function formatMonsterName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Transform locations into a format suitable for USelect
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
    selectedMonster.value = newConfig.selectedMonster || null;
  },
  { deep: true }
);

// Update monster selection
function updateMonsterSelection(monster: string) {
  const monsterData = props.monsters?.find((m) => m.code === monster);
  if (!monsterData) return;

  selectedMonster.value = monster;

  // If there's only one location, automatically select it
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
    // If there are multiple locations, clear the selected location
    selectedLocation.value = null;
    localConfig.value = {
      ...localConfig.value,
      selectedMonster: monster,
      fightLocation: undefined,
    };
  }

  updateConfig();
}

// Update monster location
function updateMonsterLocation(location: Position) {
  selectedLocation.value = location;

  // Find the skin for this location
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

// Update config when local changes are made
const updateConfig = () => {
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

// Add resource options
const resourceOptions = [
  { label: 'Copper', value: 'copper' },
  { label: 'Iron', value: 'iron' },
  { label: 'Ash Tree', value: 'ash_tree' },
  { label: 'Spruce Tree', value: 'spruce_tree' },
  { label: 'Sunflower', value: 'sunflower' },
  { label: 'Gudgeon', value: 'gudgeon' },
  { label: 'Shrimp', value: 'shrimp' },
  { label: 'Coal', value: 'coal' },
  { label: 'Birch Tree', value: 'birch' }
];
</script>
