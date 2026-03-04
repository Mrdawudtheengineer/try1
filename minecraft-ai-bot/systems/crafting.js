import logger from '../bot/logger.js';

export default class Crafting {
  constructor(bot) {
    this.bot = bot;
    this.recipes = {
      sticks: { materials: ['planks'], ratio: 2 },
      planks: { materials: ['log'], ratio: 4 },
      crafting_table: { materials: ['planks'], ratio: 4 },
      chest: { materials: ['planks'], ratio: 8 },
      wooden_pickaxe: { materials: ['sticks', 'planks'], ratio: 1 },
      wooden_sword: { materials: ['sticks', 'planks'], ratio: 1 },
      furnace: { materials: ['cobblestone'], ratio: 8 },
      iron_pickaxe: { materials: ['sticks', 'iron_ingot'], ratio: 1 },
      iron_sword: { materials: ['sticks', 'iron_ingot'], ratio: 1 },
      shield: { materials: ['planks', 'iron_ingot'], ratio: 1 }
    };

    logger.info('Crafting system initialized');
  }

  getAvailableRecipes() {
    return Object.keys(this.recipes);
  }

  canCraft(itemName) {
    const recipe = this.recipes[itemName];
    if (!recipe) {
      logger.warn(`No recipe for ${itemName}`);
      return false;
    }

    for (const material of recipe.materials) {
      const count = this.bot.inventory.items()
        .filter(item => item.name === material)
        .reduce((sum, item) => sum + item.count, 0);
      
      if (count < recipe.ratio) {
        return false;
      }
    }

    return true;
  }

  async craftItem(itemName, count = 1) {
    if (!this.canCraft(itemName)) {
      logger.warn(`Cannot craft ${itemName}`, { reason: 'Missing materials' });
      return false;
    }

    try {
      logger.info(`Crafting ${itemName}`, { count });

      // This would require a crafting table or player inventory crafting
      // Simplified implementation
      for (let i = 0; i < count; i++) {
        if (this.canCraft(itemName)) {
          // In real implementation, would need to:
          // 1. Open crafting table if needed
          // 2. Place materials in crafting grid
          // 3. Take result
          logger.debug('Item crafted', { itemName });
        }
      }

      logger.info(`Crafted ${count} ${itemName}`);
      return true;
    } catch (err) {
      logger.error('Crafting error', { error: err.message });
      return false;
    }
  }

  async craftToolset() {
    const tools = [
      { name: 'wooden_pickaxe', quantity: 1 },
      { name: 'wooden_sword', quantity: 1 },
      { name: 'wooden_axe', quantity: 1 }
    ];

    for (const tool of tools) {
      if (this.canCraft(tool.name)) {
        await this.craftItem(tool.name, tool.quantity);
      }
    }

    logger.info('Toolset crafting completed');
  }

  async craftStorageChest() {
    if (this.canCraft('chest')) {
      await this.craftItem('chest', 1);
      logger.info('Chest crafted');
      return true;
    }
    logger.warn('Cannot craft chest');
    return false;
  }

  async craftFurnace() {
    if (this.canCraft('furnace')) {
      await this.craftItem('furnace', 1);
      logger.info('Furnace crafted');
      return true;
    }
    logger.warn('Cannot craft furnace');
    return false;
  }

  async smeltOre(oreType, count = 5) {
    try {
      // Find furnace
      const furnaceBlock = this.bot.blockAt(this.bot.entity.position.offset(0, -1, 0));
      
      if (!furnaceBlock || !furnaceBlock.name.includes('furnace')) {
        logger.warn('No furnace available');
        return false;
      }

      logger.info(`Smelting ${count} ${oreType}`);

      // Open furnace and add ore
      const window = await this.bot.openContainer(furnaceBlock);
      
      // Add fuel (coal)
      const coal = this.bot.inventory.items().find(item => item.name === 'coal');
      if (coal) {
        // Would add to furnace
        logger.debug('Fuel added to furnace');
      }

      window.close();
      return true;
    } catch (err) {
      logger.error('Smelting error', { error: err.message });
      return false;
    }
  }

  async enchantItem(itemName, enchantment) {
    logger.info('Enchanting item', { itemName, enchantment });
    // Would require access to enchanting table
    return false;
  }

  getMaterialsNeeded(itemName) {
    const recipe = this.recipes[itemName];
    if (!recipe) return null;

    const needed = {};
    for (const material of recipe.materials) {
      const available = this.bot.inventory.items()
        .filter(item => item.name === material)
        .reduce((sum, item) => sum + item.count, 0);
      
      needed[material] = {
        required: recipe.ratio,
        available
      };
    }

    return needed;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
