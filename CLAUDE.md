# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Nuxt 3** web application that serves as a management dashboard for controlling game bots in an MMORPG called "Artifacts". The dashboard allows real-time monitoring and control of multiple automated game characters via WebSocket connections.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start development server on http://localhost:3000
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Generate static site
pnpm run generate
```

## Architecture

### Technology Stack
- **Framework**: Nuxt 3 with Vue 3 Composition API
- **UI Components**: @nuxt/ui (includes Tailwind CSS)
- **Real-time Communication**: Socket.io-client
- **Type Safety**: TypeScript

### Key Architectural Patterns

1. **Composable Pattern**: All WebSocket logic is centralized in `composables/useGameSocket.ts`
   - Manages socket connections, bot states, and server communication
   - Provides reactive state using Vue refs
   - Handles auto-reconnection with exponential backoff

2. **Component Structure**:
   - `pages/index.vue`: Main dashboard that orchestrates all components
   - `components/BotCard.vue`: Individual bot control and status display
   - `components/CraftingEditor.vue`: Multi-step crafting configuration
   - `components/LogViewer.vue`: Real-time activity feed
   - `components/GlobalControls.vue`: Batch bot operations

3. **WebSocket Events**:
   - **Incoming**: `initialState`, `botStatus`, `botLog`, `monsterLocations`, `resourceLocations`
   - **Outgoing**: `startBot`, `stopBot`, `updateBotConfig`, `updateCraftingCycle`

### Environment Configuration

The WebSocket server URL can be configured via environment variable:
```bash
WS_URL=http://your-server:3001 pnpm run dev
```
Default: `http://localhost:3001`

## Important Implementation Details

1. **State Management**: No Vuex/Pinia - all state is managed through the `useGameSocket` composable
2. **Error Handling**: The `safeEmit` function wraps all socket emissions with connection checks
3. **Log Management**: Logs are capped at 100 entries (FIFO) to prevent memory issues
4. **Real-time Updates**: All bot status updates are reactive and automatically reflected in the UI

## Type Definitions

All game-related types are defined in `types/bot.ts`:
- `BotStatus`: Runtime bot state (position, HP, inventory, etc.)
- `BotConfig`: Bot behavior configuration (action type, location, etc.)
- `CraftingCycle`: Multi-step crafting recipes
- `MonsterLocation` & `ResourceLocation`: Game world locations