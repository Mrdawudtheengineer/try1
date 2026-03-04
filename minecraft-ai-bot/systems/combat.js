import logger from '../bot/logger.js';

export default class Combat {
  constructor(bot) {
    this.bot = bot;
    this.isInCombat = false;
    this.currentTarget = null;
    logger.info('Combat system initialized');
  }

  async attack(target) {
    if (!target || !this.bot) {
      logger.warn('Invalid combat target');
      return false;
    }

    this.isInCombat = true;
    this.currentTarget = target;

    try {
      logger.info('Attacking target', { targetType: target.name });

      // Use bot's PvP plugin if available
      if (this.bot.pvp) {
        this.bot.pvp.attack(target);
        
        // Continue attacking for a limited time
        return new Promise((resolve) => {
          const combatTimeout = setTimeout(() => {
            this.stopAttack();
            this.isInCombat = false;
            resolve(true);
          }, 10000); // Attack for up to 10 seconds
        });
      } else {
        // Fallback direct attack
        this.bot.attack(target);
        await this.sleep(500);
        this.bot.attack(target);
        
        this.isInCombat = false;
        return true;
      }
    } catch (err) {
      logger.error('Combat error', { error: err.message });
      this.isInCombat = false;
      return false;
    }
  }

  defendPlayers() {
    // Find nearby players and hostile mobs
    const hostileMobs = Object.values(this.bot.entities).filter(e =>
      e.type === 'mob' &&
      ['creeper', 'skeleton', 'zombie', 'spider'].includes(e.name) &&
      this.bot.entity.position.distanceTo(e.position) < 32
    );

    if (hostileMobs.length > 0) {
      logger.info('Defending against mobs', { count: hostileMobs.length });
      this.attack(hostileMobs[0]);
    }
  }

  stopAttack() {
    if (this.bot.pvp) {
      this.bot.pvp.stop();
    }
    this.isInCombat = false;
    this.currentTarget = null;
    logger.debug('Attack stopped');
  }

  strafe(direction, distance = 3) {
    // Strafe left or right during combat
    const angle = direction === 'left' ? Math.PI / 2 : -Math.PI / 2;
    const newYaw = this.bot.entity.yaw + angle;
    this.bot.look(newYaw, this.bot.entity.pitch, false);
  }

  useShield(active = true) {
    if (this.bot.heldItem && this.bot.heldItem.name === 'shield') {
      this.bot.setControlState('sneak', active);
    }
  }

  useBow() {
    const bow = this.bot.inventory.items().find(item => item.name === 'bow');
    if (bow) {
      this.bot.equip(bow, 'hand');
      this.bot.activateItem();
      return true;
    }
    return false;
  }

  retreat(distance = 20) {
    logger.warn('Retreating from combat');
    const direction = this.bot.entity.yaw;
    const retreatPos = {
      x: this.bot.entity.position.x - Math.cos(direction) * distance,
      y: this.bot.entity.position.y,
      z: this.bot.entity.position.z - Math.sin(direction) * distance
    };
    this.stopAttack();
    return retreatPos;
  }

  getCurrentTarget() {
    return this.currentTarget;
  }

  isInCombatMode() {
    return this.isInCombat;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async defendAgainstCreepers() {
    const creepers = Object.values(this.bot.entities).filter(e =>
      e.name === 'creeper' &&
      this.bot.entity.position.distanceTo(e.position) < 10
    );

    if (creepers.length > 0) {
      // Keep distance from creepers
      const creeper = creepers[0];
      const distance = this.bot.entity.position.distanceTo(creeper.position);
      
      if (distance < 6) {
        // Move away
        const retreatPos = this.retreat(10);
        logger.warn('Creeper nearby - retreating', { distance });
        return retreatPos;
      }
    }
    return null;
  }
}
