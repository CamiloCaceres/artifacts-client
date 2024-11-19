// composables/useGameSocket.ts
import { io, Socket } from "socket.io-client";
import type { BotStatus, BotConfig, CraftingCycle, MonsterLocation } from "~/types/bot";

export const useGameSocket = () => {
  const config = useRuntimeConfig();
  const botsStatus = ref<Record<string, BotStatus>>({});
  const botsConfig = ref<Record<string, BotConfig>>({});
  const logs = ref<
    Array<{ characterName: string; message: string; timestamp: string }>
  >([]);
  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);
  const clientCount = ref(0);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;
  const monsters = ref<{ code: string; locations: MonsterLocation[] }[]>([]);

  onMounted(() => {
    if (!socket.value) {
      connect();
    }
  });

  onUnmounted(() => {
    socket.value?.disconnect();
  });

  const connect = () => {
    if (socket.value?.connected) return;

    socket.value = io(config.public.wsUrl || "http://localhost:3001", {
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.value.on("connect", () => {
      isConnected.value = true;
      reconnectAttempts.value = 0;
      console.log("Connected to game server");
    });

    socket.value.on("disconnect", () => {
      isConnected.value = false;
      console.log("Disconnected from game server");
    });

    socket.value.on("connect_error", (error) => {
      console.error("Connection error:", error);
      reconnectAttempts.value++;

      if (reconnectAttempts.value >= maxReconnectAttempts) {
        socket.value?.disconnect();
        console.error("Max reconnection attempts reached");
      }
    });

    // Initial state on connection
    socket.value.on(
      "initialState",
      ({ botsStatus: initialStatus, botsConfig: initialConfig, recentLogs, monsters: initialMonsters }) => {
        botsStatus.value = initialStatus;
        botsConfig.value = initialConfig;
        logs.value = recentLogs;
        monsters.value = initialMonsters;
      }
    );

    socket.value.on(
      "botStatus",
      ({
        characterName,
        status,
      }: {
        characterName: string;
        status: BotStatus;
      }) => {
        botsStatus.value = {
          ...botsStatus.value,
          [characterName]: status,
        };
      }
    );

    socket.value.on(
      "botConfigUpdate",
      ({
        characterName,
        config,
      }: {
        characterName: string;
        config: BotConfig;
      }) => {
        botsConfig.value = {
          ...botsConfig.value,
          [characterName]: config,
        };
      }
    );

    socket.value.on("botsStatus", (status: Record<string, BotStatus>) => {
      botsStatus.value = status;
    });

    socket.value.on(
      "botLog",
      (log: { characterName: string; message: string; timestamp: string }) => {
        logs.value.unshift(log);
        if (logs.value.length > 100) logs.value.pop();
      }
    );

    // Monster-related events
    socket.value.on("monsterLocations", (data: { code: string; locations: MonsterLocation[] }) => {
      const monsterIndex = monsters.value.findIndex(m => m.code === data.code);
      if (monsterIndex >= 0) {
        monsters.value[monsterIndex].locations = data.locations;
      } else {
        monsters.value.push(data);
      }
    });
  };

  // Add error handling to all actions
  const safeEmit = async (event: string, ...args: any[]) => {
    if (!isConnected.value) {
      console.warn("Not connected to server");
      return false;
    }

    try {
      socket.value?.emit(event, ...args);
      return true;
    } catch (error) {
      console.error(`Error emitting ${event}:`, error);
      return false;
    }
  };

  // Bot control methods
  const startBot = (characterName: string) => safeEmit("startBot", characterName);
  const stopBot = (characterName: string) => safeEmit("stopBot", characterName);
  const startAllBots = () => safeEmit("startAllBots");
  const stopAllBots = () => safeEmit("stopAllBots");

  // Configuration methods
  const updateBotConfig = (characterName: string, config: Partial<BotConfig>) =>
    safeEmit("updateBotConfig", { characterName, config });

  // Crafting methods
  const updateCraftingCycle = (characterName: string, cycle: CraftingCycle) =>
    safeEmit("updateCraftingCycle", { characterName, cycle });

  const removeCraftingCycle = (characterName: string) =>
    safeEmit("removeCraftingCycle", characterName);

  // Monster methods
  const getMonsterLocations = (monsterCode: string) =>
    safeEmit("getMonsterLocations", monsterCode);

  // Connect when component is mounted
  onMounted(() => {
    if (!socket.value) {
      connect();
    }
  });

  // Cleanup on unmount
  onUnmounted(() => {
    socket.value?.disconnect();
    socket.value = null;
  });

  return {
    isConnected,
    botsStatus,
    botsConfig,
    logs,
    clientCount,
    reconnectAttempts,
    monsters,
    startBot,
    stopBot,
    startAllBots,
    stopAllBots,
    updateBotConfig,
    updateCraftingCycle,
    removeCraftingCycle,
    getMonsterLocations,
  };
};