<!-- components/CraftingEditor.vue -->
<template>
  <UModal v-model="isOpen" :ui="{ width: 'max-w-4xl' }">
    <div class="p-6">
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-2">
          Configure Crafting Cycle for {{ botName }}
        </h2>
        <p class="text-sm text-gray-600">
          Create or edit a crafting cycle to automate crafting tasks.
        </p>
      </div>
      <div class="mb-6">
        <UFormGroup label="Load Preset">
          <div class="flex gap-2">
            <USelect
              v-model="selectedPresetId"
              :options="CRAFTING_PRESETS"
              option-attribute="name"
              value-attribute="id"
              class="flex-1"
            />
            <UButton
              v-if="selectedPresetId"
              color="blue"
              @click="loadPreset(selectedPresetId)"
              :disabled="!selectedPresetId || status?.isRunning"
            >
              Load Preset
            </UButton>
          </div>
        </UFormGroup>
      </div>

      <!-- Cycle Selection -->
      <div class="mb-6">
        <UFormGroup label="Load Saved Cycle">
          <div class="flex gap-2">
            <USelect
              v-model="selectedCycleId"
              :options="savedCycles"
              option-attribute="name"
              value-attribute="id"
              class="flex-1"
            />
            <UButton
              v-if="selectedCycleId"
              color="blue"
              @click="loadSavedCycle"
              :disabled="!selectedCycleId"
            >
              Load
            </UButton>
          </div>
        </UFormGroup>
      </div>

      <!-- Cycle Editor -->
      <div class="border rounded-lg p-4 mb-6">
        <div class="mb-4">
          <UFormGroup label="Cycle Name" required>
            <UInput
              v-model="currentCycle.name"
              placeholder="Enter cycle name"
              :disabled="status?.isRunning"
            />
          </UFormGroup>
        </div>

        <!-- Steps Editor -->
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium">Steps</label>
            <UButton
              color="green"
              variant="soft"
              size="xs"
              icon="i-heroicons-plus"
              @click="addStep"
              :disabled="status?.isRunning"
            >
              Add Step
            </UButton>
          </div>

          <div class="space-y-3">
            <div
              v-for="(step, index) in currentCycle.steps"
              :key="index"
              class="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg relative group"
            >
              <UButton
                color="red"
                variant="ghost"
                size="xs"
                icon="i-heroicons-trash"
                class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                @click="removeStep(index)"
                :disabled="status?.isRunning"
              />

              <!-- Step Type -->
              <USelect
                v-model="step.type"
                :options="stepTypes"
                class="w-32"
                :disabled="status?.isRunning"
              />

              <!-- Step-specific inputs -->
              <template
                v-if="['withdraw', 'deposit', 'craft'].includes(step.type)"
              >
                <UInput
                  v-model="step.item"
                  placeholder="Item code"
                  class="w-40"
                  :disabled="status?.isRunning"
                />
                <UInput
                  v-model.number="step.quantity"
                  type="number"
                  placeholder="Quantity"
                  class="w-24"
                  min="1"
                  :disabled="status?.isRunning"
                />
              </template>

              <template v-if="step.type === 'move'">
                <USelect
                  v-model="step.location"
                  :options="locations"
                  class="w-40"
                  :disabled="status?.isRunning"
                />
              </template>
            </div>

            <div
              v-if="currentCycle.steps.length === 0"
              class="text-center py-4 text-gray-500"
            >
              No steps added yet. Click "Add Step" to begin.
            </div>
          </div>
        </div>

        <!-- Validation Errors -->
        <div v-if="validationErrors.length" class="mb-4">
          <div
            v-for="error in validationErrors"
            :key="error"
            class="text-sm text-red-600"
          >
            {{ error }}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-between">
          <div class="flex gap-2">
            <UButton
              color="blue"
              :disabled="!isValid || status?.isRunning"
              @click="saveCycle"
            >
              Save Cycle
            </UButton>
            <UButton
              color="gray"
              variant="soft"
              @click="resetEditor"
              :disabled="status?.isRunning"
            >
              Reset
            </UButton>
          </div>
          <div class="flex gap-2">
            <UButton
              color="green"
              :disabled="!isValid || status?.isRunning"
              @click="saveAndApply"
            >
              Apply to Bot
            </UButton>
            <UButton color="red" variant="soft" @click="closeEditor">
              Close
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { CraftingCycle, CraftingStep, BotStatus } from "~/types/bot";

const selectedPresetId = ref<string>("");

const props = defineProps<{
  modelValue: boolean;
  botName: string;
  status?: BotStatus;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "apply", cycle: CraftingCycle): void;
}>();

// Constants
const stepTypes = ["withdraw", "deposit", "craft", "move"];
const locations = ["bank", "woodcutting", "mining", "jewelry", "gearcrafting", "weaponcrafting", "cooking", "alchemy"];

// Component state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const selectedCycleId = ref<string>("");
const currentCycle = ref<CraftingCycle>({
  id: Date.now().toString(36) + Math.random().toString(36).slice(2),
  name: "",
  steps: [],
});

// Local storage key for saved cycles
const STORAGE_KEY = "crafting-cycles";

// Load saved cycles from localStorage
const savedCycles = ref<CraftingCycle[]>([]);

const loadSavedCycles = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    savedCycles.value = JSON.parse(stored);
  }
};

// Save cycles to localStorage
const saveCyclesToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCycles.value));
};

// Load a saved cycle
const loadSavedCycle = () => {
  const cycle = savedCycles.value.find((c) => c.id === selectedCycleId.value);
  if (cycle) {
    currentCycle.value = JSON.parse(JSON.stringify(cycle));
  }
};

// Add new step
const addStep = () => {
  currentCycle.value.steps.push({
    type: "withdraw",
    item: "",
    quantity: 1,
  });
};

// Remove step
const removeStep = (index: number) => {
  currentCycle.value.steps.splice(index, 1);
};

// Validation
const validationErrors = computed(() => {
  const errors: string[] = [];

  if (!currentCycle.value.name) {
    errors.push("Cycle name is required");
  }

  if (currentCycle.value.steps.length === 0) {
    errors.push("At least one step is required");
  }

  currentCycle.value.steps.forEach((step, index) => {
    if (["withdraw", "deposit", "craft"].includes(step.type)) {
      if (!step.item) {
        errors.push(`Step ${index + 1}: Item code is required`);
      }
      if (!step.quantity || step.quantity < 1) {
        errors.push(`Step ${index + 1}: Valid quantity is required`);
      }
    }
    if (step.type === "move" && !step.location) {
      errors.push(`Step ${index + 1}: Location is required`);
    }
  });

  return errors;
});

const isValid = computed(() => validationErrors.value.length === 0);

// Load a preset
const loadPreset = (presetId: string) => {
  const preset = CRAFTING_PRESETS.find((p) => p.id === presetId);
  if (preset) {
    currentCycle.value = {
      ...preset,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2), // Generate new ID for the cycle
    };
  }
};

// Save current cycle
const saveCycle = () => {
  if (!isValid.value) return;

  const index = savedCycles.value.findIndex(
    (c) => c.id === currentCycle.value.id
  );
  if (index >= 0) {
    savedCycles.value[index] = { ...currentCycle.value };
  } else {
    savedCycles.value.push({ ...currentCycle.value });
  }

  saveCyclesToStorage();
};

// Apply cycle to bot
const saveAndApply = () => {
  if (!isValid.value) return;

  saveCycle();
  emit("apply", { ...currentCycle.value });
  closeEditor();
};

// Reset editor
const resetEditor = () => {
  currentCycle.value = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    name: "",
    steps: [],
  };
  selectedCycleId.value = "";
};

// Close editor
const closeEditor = () => {
  isOpen.value = false;
  resetEditor();
};

// Initialize on mount
onMounted(() => {
  loadSavedCycles();
});

const CRAFTING_PRESETS = [
  {
    id: "iron-bar-crafting",
    name: "Iron Bar Production",
    description: "Basic iron ore to iron bar conversion, start in bank with 96 spaces in the inventory",
    steps: [
 
      {
        type: "withdraw",
        item: "iron_ore",
        quantity: 96,
      },
      {
        type: "move",
        location: "mining",
      },
      {
        type: "craft",
        item: "iron_bar",
        quantity: 12,
      },
      {
        type: "move",
        location: "bank",
      },
      {
        type: "deposit",
        item: "iron_bar",
        quantity: 12,
      },
    ],
  },
  {
    id: "planks-crafting",
    name: "Wood to Planks",
    description: "Convert logs to planks, start in bank with 100 spaces in the inventory",
    steps: [
      {
        type: "withdraw",
        item: "ash_log",
        quantity: 96,
      },
      {
        type: "move",
        location: "woodcutting",
      },
      {
        type: "craft",
        item: "ash_plank",
        quantity: 12,
      },
      {
        type: "move",
        location: "bank",
      },
      {
        type: "deposit",
        item: "ash_plank",
        quantity: 12,
      },
    ],
  },
  {
    id: "copper-bar-crafting",
    name: "Copper Bar Production",
    description: "Basic copper ore to copper bar conversion, start in bank with 100 spaces in the inventory",
    steps: [
      {
        type: "withdraw",
        item: "copper_ore",
        quantity: 96,
      },
      {
        type: "move",
        location: "mining",
      },
      {
        type: "craft",
        item: "copper_bar",
        quantity: 12,
      },
      {
        type: "move",
        location: "bank",
      },
      {
        type: "deposit",
        item: "copper_bar",
        quantity: 12,
      },
    ],
  },
];
</script>
