import logger from '../bot/logger.js';

export default class Brain {
  constructor() {
    this.taskQueue = [];
    this.currentTask = null;
    this.priorities = {
      survival: 1,
      defense: 2,
      resourceGathering: 3,
      infrastructure: 4,
      exploration: 5
    };
    logger.info('Brain system initialized');
  }

  async decideAction(perception, memory) {
    // Analyze current situation
    const situation = this.analyzeSituation(perception, memory);

    // Decide action based on priorities
    let action = null;

    // Survival checks
    if (situation.hunger < 10) {
      action = { type: 'eat', priority: this.priorities.survival };
    } else if (situation.health < 5) {
      action = { type: 'defend', priority: this.priorities.survival };
    } else if (situation.isNight && !situation.hasShelter) {
      action = { type: 'defend', priority: this.priorities.defense };
    }

    // Defense checks
    if (!action && situation.hostileMobs.length > 0) {
      const nearestMob = situation.hostileMobs[0];
      action = {
        type: 'attack',
        target: nearestMob,
        priority: this.priorities.defense
      };
    }

    // Resource gathering
    if (!action && situation.hasNearbyOres) {
      action = {
        type: 'mine',
        oreType: situation.nearestOreType || 'coal',
        priority: this.priorities.resourceGathering
      };
    }

    // Exploration
    if (!action && Math.random() < 0.3) {
      // Random exploration
      const randomX = Math.random() * 1000 - 500;
      const randomZ = Math.random() * 1000 - 500;
      action = {
        type: 'move',
        x: randomX,
        y: 64,
        z: randomZ,
        priority: this.priorities.exploration
      };
    }

    // Default: idle
    if (!action) {
      action = { type: 'idle', priority: 999 };
    }

    this.currentTask = action;
    return action;
  }

  analyzeSituation(perception, memory) {
    return {
      health: perception.health || 10,
      hunger: perception.hunger || 20,
      isNight: perception.isNight || false,
      hasShelter: memory.hasShelterNearby || false,
      hostileMobs: perception.hostileMobs || [],
      passiveMobs: perception.passiveMobs || [],
      items: perception.items || [],
      hasNearbyOres: (perception.ores && perception.ores.length > 0) || false,
      nearestOreType: perception.ores && perception.ores.length > 0 ? perception.ores[0].type : null
    };
  }

  queueTask(task) {
    this.taskQueue.push(task);
    logger.debug('Task queued', { task });
  }

  getQueuedTasks() {
    return this.taskQueue;
  }

  clearQueue() {
    this.taskQueue = [];
  }

  getCurrentTask() {
    return this.currentTask;
  }
}
