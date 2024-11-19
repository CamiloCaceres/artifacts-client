export interface Character {
  name: string;
  hp: number;
  max_hp: number;
  x: number;
  y: number;
  inventory: InventorySlot[];
}

export interface InventorySlot {
  code: string | null;
  quantity: number;
}

export interface Item {
  code: string;
  quantity: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface BotConfig {
    apiToken: string;
    characterName: string;
    actionType: "fight" | "gather" | "craft";
    resource?: string;
    baseUrl?: string;
    craftingCycle?: CraftingCycle;
    fightLocation?: Position;
    selectedMonster?: string;
    monsterSkin?: string;
    resourceSkin?: string;
  }


export interface BotStatus {
  isRunning: boolean;
  lastAction: string;
  totalActions: number;
  totalXp: number;
  totalGold: number;
  itemsCollected: Map<string, number>;
  currentHp?: number;
  maxHp?: number;
  lastError?: string;
  craftingStats?: CraftingStats;
}


// API response types
export interface ActionResponse {
  data: {
    fight?: {
      xp: number;
      gold: number;
    };
    details?: {
      xp: number;
    };
    cooldown?: {
      expiration: string;
    };
    hp_restored?: number;
  };
}

export interface CraftingStep {
  type: "withdraw" | "deposit" | "craft" | "move";
  item?: string;
  quantity?: number;
  location?: "bank" | "woodcutting" | "mining" | "jewelry" | "gearcrafting" | "weaponcrafting" | "cooking" | "alchemy";
  position?: Position;
  materialsUsed?: Map<string, number>;
  itemsCrafted?: Map<string, number>;
}

export interface CharacterResponse {
  data: Character[];
}


export interface CraftingCycle {
  id: string;
  name: string;
  description?: string;
  steps: CraftingStep[];
  requiredItems?: Item[];
  expectedOutput?: Item[];
}

export interface CraftingStats {
  itemsCrafted: Map<string, number>;
  totalCrafts: number;
  failedCrafts: number;
  currentCycle: string | null;
  cycleProgress: number;
  materialsUsed: Map<string, number>;
}
export interface TradeStats {
  itemsTraded: Map<string, number>;
  totalTrades: number;
  failedTrades: number;
}
export interface Monster {
  name: string;
  skin: string;
  x: number;
  y: number;
  content: {
    type: "monster";
    code: string;
  };
}

export interface MonsterLocation {
  code: string;
  skin: string;
  position: Position;
}

// Resource-related interfaces
export interface Resource {
  name: string;
  skin: string;
  x: number;
  y: number;
  content: {
    type: "resource";
    code: string;
  };
}

export interface ResourceLocation {
  code: string;
  skin: string;
  position: Position;
  name: string;
}