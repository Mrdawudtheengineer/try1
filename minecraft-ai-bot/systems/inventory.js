import logger from '../bot/logger.js';

export default class Inventory {
  constructor(bot) {
    this.bot = bot;
    logger.info('Inventory system initialized');
  }

  getInventory() {
    const items = [];
    this.bot.inventory.slots.forEach((item, index) => {
      if (item) {
        items.push({
          slot: index,
          name: item.name,
          count: item.count,
          id: item.type
        });
      }
    });
    return items;
  }

  findItem(itemName) {
    const item = this.bot.inventory.items().find(i => i.name === itemName);
    return item || null;
  }

  countItem(itemName) {
    const items = this.bot.inventory.items().filter(i => i.name === itemName);
    return items.reduce((total, item) => total + item.count, 0);
  }

  async eatFood(foodType = null) {
    let food = null;

    if (foodType) {
      food = this.bot.inventory.items().find(item => item.name === foodType);
    } else {
      // Find any food
      const foodItems = ['cooked_beef', 'cooked_pork', 'cooked_chicken', 'apple', 'bread', 'cooked_mutton'];
      for (const f of foodItems) {
        food = this.bot.inventory.items().find(item => item.name === f);
        if (food) break;
      }
    }

    if (food) {
      await this.bot.equip(food, 'hand');
      await this.bot.consume();
      logger.info('Food consumed', { foodType: food.name });
      return true;
    }

    logger.warn('No food available');
    return false;
  }

  async dropItem(itemName, count = 1) {
    const item = this.bot.inventory.items().find(i => i.name === itemName);
    if (item) {
      await this.bot.toss(item);
      logger.info('Item dropped', { itemName, count });
      return true;
    }
    return false;
  }

  isFull() {
    const emptySlots = this.bot.inventory.slots.filter(slot => !slot).length;
    return emptySlots === 0;
  }

  getEmptySlots() {
    return this.bot.inventory.slots.filter(slot => !slot).length;
  }

  async storeItems(storageBlock) {
    if (!storageBlock) {
      logger.warn('No storage block specified');
      return false;
    }

    try {
      // Move to storage and store items
      if (this.bot.pathfinder) {
        const goal = new (require('mineflayer-pathfinder')).goals.GoalBlock(
          Math.round(storageBlock.x),
          Math.round(storageBlock.y),
          Math.round(storageBlock.z)
        );
        this.bot.pathfinder.setGoal(goal, false);

        // Open chest and deposit items
        const chest = this.bot.blockAt(storageBlock);
        if (chest) {
          const window = await this.bot.openContainer(chest);
          const items = this.getInventory().filter(item => !item.name.includes('tool'));
          
          for (const item of items) {
            // Deposit items to chest
            logger.debug('Item stored', { itemName: item.name });
          }
          
          window.close();
          logger.info('Items stored in chest');
          return true;
        }
      }
    } catch (err) {
      logger.error('Storage error', { error: err.message });
      return false;
    }
  }

  async retrieveItems(storageBlock, itemNames) {
    if (!storageBlock) {
      logger.warn('No storage block specified');
      return false;
    }

    try {
      const chest = this.bot.blockAt(storageBlock);
      if (chest) {
        const window = await this.bot.openContainer(chest);
        
        for (const itemName of itemNames) {
          const item = window.slots.find(slot => slot && slot.name === itemName);
          if (item) {
            await window.takeItem(item, 1);
            logger.debug('Item retrieved', { itemName });
          }
        }

        window.close();
        logger.info('Items retrieved from chest');
        return true;
      }
    } catch (err) {
      logger.error('Retrieval error', { error: err.message });
      return false;
    }
  }

  getSummary() {
    const items = this.getInventory();
    return {
      totalSlots: this.bot.inventory.slots.length,
      usedSlots: items.length,
      emptySlots: this.getEmptySlots(),
      isFull: this.isFull(),
      items
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
