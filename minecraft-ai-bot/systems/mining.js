import logger from '../bot/logger.js';
import config from '../bot/config.js';

export default class Mining {
  constructor(bot) {
    this.bot = bot;
    this.isMining = false;
    this.miningTarget = null;
    logger.info('Mining system initialized');
  }

  async mineOres(oreType = 'iron', count = 5) {
    if (!this.bot) {
      logger.warn('Bot not available for mining');
      return false;
    }

    this.isMining = true;
    const positions = this.bot.inventory.slots;
    let minedCount = 0;

    try {
      const range = config.ai.perceptionRange;
      const botPos = this.bot.entity.position;

      logger.info(`Starting mining for ${oreType}`, { targetCount: count });

      // Find ore blocks around the bot
      for (let dx = -range; dx <= range && minedCount < count; dx++) {
        for (let dy = -range; dy <= range && minedCount < count; dy++) {
          for (let dz = -range; dz <= range && minedCount < count; dz++) {
            const block = this.bot.blockAt(botPos.offset(dx, dy, dz));

            if (block && block.name.includes(oreType)) {
              // Check if mining this block is safe
              if (!this.isSafeMiningLocation(block.position)) {
                continue;
              }

              await this.mineBlock(block);
              minedCount++;
              
              // Get the dropped item
              await this.sleep(500);
            }
          }
        }
      }

      this.isMining = false;
      logger.info('Mining completed', { mined: minedCount });
      return true;
    } catch (err) {
      logger.error('Mining error', { error: err.message });
      this.isMining = false;
      return false;
    }
  }

  async mineBlock(block) {
    if (!block || !this.bot.tool) {
      logger.warn('Cannot mine block');
      return false;
    }

    try {
      // Select best tool
      await this.selectBestTool(block);

      // Dig the block
      await this.bot.dig(block);
      this.miningTarget = block;

      logger.debug('Block mined', { blockName: block.name });
      return true;
    } catch (err) {
      logger.debug('Block mine attempt failed', { error: err.message });
      return false;
    }
  }

  async selectBestTool(block) {
    // Use the mineflayer-tool plugin if available
    if (this.bot.tool) {
      const tool = this.bot.tool.equipBestTool(block);
      if (tool) {
        await this.bot.equip(tool, 'hand');
      }
    }
  }

  isSafeMiningLocation(position) {
    // Check for lava nearby
    const range = 5;
    const lavaBlocks = [];

    for (let x = position.x - range; x <= position.x + range; x++) {
      for (let y = position.y - range; y <= position.y + range; y++) {
        for (let z = position.z - range; z <= position.z + range; z++) {
          const block = this.bot.blockAt({ x, y, z });
          if (block && (block.name === 'lava' || block.name === 'flowing_lava')) {
            lavaBlocks.push(block);
          }
        }
      }
    }

    // Too much lava nearby is unsafe
    if (lavaBlocks.length > 10) {
      logger.warn('Too much lava - unsafe mining location');
      return false;
    }

    return true;
  }

  async collectNearbyItems() {
    const items = Object.values(this.bot.entities).filter(e =>
      e.type === 'object' &&
      this.bot.entity.position.distanceTo(e.position) < 10
    );

    for (const item of items) {
      try {
        // Move towards item
        if (this.bot.pathfinder) {
          const goal = new (require('mineflayer-pathfinder')).goals.GoalBlock(
            Math.round(item.position.x),
            Math.round(item.position.y),
            Math.round(item.position.z)
          );
          this.bot.pathfinder.setGoal(goal, false);
          await this.sleep(1000);
        }
      } catch (err) {
        logger.debug('Item collection error', { error: err.message });
      }
    }
  }

  async mineDiamond(count = 3) {
    return this.mineOres('diamond', count);
  }

  async mineIron(count = 10) {
    return this.mineOres('iron_ore', count);
  }

  async mineCoal(count = 5) {
    return this.mineOres('coal', count);
  }

  stopMining() {
    this.isMining = false;
    this.miningTarget = null;
    logger.debug('Mining stopped');
  }

  isMiningActive() {
    return this.isMining;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
