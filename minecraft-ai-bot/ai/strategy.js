import logger from '../bot/logger.js';

export default class Strategy {
  constructor() {
    this.strategies = {
      combat: {
        aggressive: {
          retreatHealth: 3,
          shieldUsage: 0.3,
          attackSpeed: 'fast'
        },
        defensive: {
          retreatHealth: 8,
          shieldUsage: 0.8,
          attackSpeed: 'normal'
        },
        balanced: {
          retreatHealth: 5,
          shieldUsage: 0.5,
          attackSpeed: 'normal'
        }
      },
      resource: {
        aggressive: {
          timePerMine: 500,
          riskTolerance: 'high'
        },
        cautious: {
          timePerMine: 1000,
          riskTolerance: 'low'
        }
      },
      exploration: {
        mapped: {
          explorationChance: 0.2,
          maxDistance: 100
        },
        unmapped: {
          explorationChance: 0.5,
          maxDistance: 500
        }
      }
    };

    this.currentStrategies = {
      combat: 'balanced',
      resource: 'cautious',
      exploration: 'mapped'
    };

    logger.info('Strategy system initialized');
  }

  setStrategy(category, strategyName) {
    if (this.strategies[category] && this.strategies[category][strategyName]) {
      this.currentStrategies[category] = strategyName;
      logger.info('Strategy changed', { category, strategy: strategyName });
      return true;
    }
    return false;
  }

  getStrategy(category) {
    const strategy = this.currentStrategies[category];
    return this.strategies[category][strategy];
  }

  adjustStrategyBasedOnConditions(perception, memory) {
    // Adjust combat strategy based on health
    if (perception.health < 5) {
      this.setStrategy('combat', 'defensive');
    } else if (perception.health > 15) {
      this.setStrategy('combat', 'aggressive');
    } else {
      this.setStrategy('combat', 'balanced');
    }

    // Adjust resource strategy based on danger
    if (perception.hostileMobs.length > 3) {
      this.setStrategy('resource', 'cautious');
    }

    // Adjust exploration based on exploration progress
    if (memory.explorationMap && Object.keys(memory.explorationMap).length > 100) {
      this.setStrategy('exploration', 'unmapped');
    }

    logger.debug('Strategies adjusted', { strategies: this.currentStrategies });
  }

  getStrategyRecommendation(situation) {
    switch (situation) {
      case 'low_health':
        return this.setStrategy('combat', 'defensive');
      case 'high_health':
        return this.setStrategy('combat', 'aggressive');
      case 'night_time':
        return this.setStrategy('resource', 'cautious');
      case 'safe_area':
        return this.setStrategy('exploration', 'unmapped');
      default:
        return this.setStrategy('combat', 'balanced');
    }
  }

  getAllStrategies() {
    return this.strategies;
  }

  getCurrentConfig() {
    return {
      combat: this.getStrategy('combat'),
      resource: this.getStrategy('resource'),
      exploration: this.getStrategy('exploration')
    };
  }
}
