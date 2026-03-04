import fs from 'fs';
import path from 'path';
import logger from '../bot/logger.js';
import config from '../bot/config.js';

export default class Memory {
  constructor() {
    this.memory = {
      villages: [],
      farms: [],
      miningLocations: [],
      storageAreas: [],
      dangerZones: [],
      discoveredCaves: [],
      explorationMap: {},
      playerInteractions: [],
      resourceLocations: {},
      structures: []
    };

    this.memoryFile = 'data/worldMemory.json';
    this.loadMemory();
    logger.info('Memory system initialized');
  }

  loadMemory() {
    if (fs.existsSync(this.memoryFile)) {
      try {
        const data = fs.readFileSync(this.memoryFile, 'utf8');
        this.memory = JSON.parse(data);
        logger.info('World memory loaded', { entries: Object.keys(this.memory).length });
      } catch (err) {
        logger.warn('Failed to load world memory', { error: err.message });
        this.memory = this.getDefaultMemory();
      }
    }
  }

  getDefaultMemory() {
    return {
      villages: [],
      farms: [],
      miningLocations: [],
      storageAreas: [],
      dangerZones: [],
      discoveredCaves: [],
      explorationMap: {},
      playerInteractions: [],
      resourceLocations: {},
      structures: []
    };
  }

  updateMemory(perception) {
    if (!perception) return;

    // Update mining locations
    if (perception.ores && perception.ores.length > 0) {
      perception.ores.forEach(ore => {
        const exists = this.memory.miningLocations.some(loc =>
          Math.hypot(loc.position.x - ore.position.x, loc.position.z - ore.position.z) < 5
        );
        if (!exists) {
          this.memory.miningLocations.push({
            type: ore.type,
            position: ore.position,
            discovered: Date.now()
          });
        }
      });
    }

    // Update storage areas (chests)
    if (perception.blocks && perception.blocks.chests.length > 0) {
      perception.blocks.chests.forEach(chest => {
        const exists = this.memory.storageAreas.some(loc =>
          Math.hypot(loc.position.x - chest.position.x, loc.position.z - chest.position.z) < 5
        );
        if (!exists) {
          this.memory.storageAreas.push({
            position: chest.position,
            discovered: Date.now()
          });
        }
      });
    }

    // Update danger zones (lava)
    if (perception.blocks && perception.blocks.lava.length > 0) {
      perception.blocks.lava.forEach(lava => {
        const exists = this.memory.dangerZones.some(loc =>
          Math.hypot(loc.position.x - lava.position.x, loc.position.z - lava.position.z) < 10
        );
        if (!exists) {
          this.memory.dangerZones.push({
            type: 'lava',
            position: lava.position,
            discovered: Date.now()
          });
        }
      });
    }

    // Update player interactions
    if (perception.players && perception.players.length > 0) {
      perception.players.forEach(player => {
        const existing = this.memory.playerInteractions.find(p => p.name === player.name);
        if (existing) {
          existing.lastSeen = Date.now();
          existing.interactions++;
        } else {
          this.memory.playerInteractions.push({
            name: player.name,
            uuid: player.uuid,
            firstSeen: Date.now(),
            lastSeen: Date.now(),
            interactions: 1,
            trusted: false
          });
        }
      });
    }

    // Limit memory size
    if (this.memory.miningLocations.length > config.ai.maxMemorySize) {
      this.memory.miningLocations = this.memory.miningLocations.slice(-1000);
    }
  }

  persistMemory() {
    try {
      fs.writeFileSync(this.memoryFile, JSON.stringify(this.memory, null, 2));
      logger.debug('World memory persisted');
    } catch (err) {
      logger.error('Failed to persist world memory', { error: err.message });
    }
  }

  getMemory() {
    return this.memory;
  }

  addVillage(position) {
    const exists = this.memory.villages.some(v =>
      Math.hypot(v.position.x - position.x, v.position.z - position.z) < 20
    );
    if (!exists) {
      this.memory.villages.push({
        position,
        discovered: Date.now()
      });
      logger.info('Village discovered', { position });
    }
  }

  addFarm(position) {
    const exists = this.memory.farms.some(f =>
      Math.hypot(f.position.x - position.x, f.position.z - position.z) < 20
    );
    if (!exists) {
      this.memory.farms.push({
        position,
        discovered: Date.now()
      });
      logger.info('Farm discovered', { position });
    }
  }

  addCave(position) {
    const exists = this.memory.discoveredCaves.some(c =>
      Math.hypot(c.position.x - position.x, c.position.y - position.y, c.position.z - position.z) < 15
    );
    if (!exists) {
      this.memory.discoveredCaves.push({
        position,
        discovered: Date.now()
      });
      logger.info('Cave discovered', { position });
    }
  }

  getNearestStorageArea(position) {
    if (this.memory.storageAreas.length === 0) return null;
    return this.memory.storageAreas.reduce((nearest, current) => {
      const currentDist = Math.hypot(current.position.x - position.x, current.position.z - position.z);
      const nearestDist = Math.hypot(nearest.position.x - position.x, nearest.position.z - position.z);
      return currentDist < nearestDist ? current : nearest;
    });
  }

  getNearestMiningLocation(position, oreType = null) {
    let locations = this.memory.miningLocations;
    if (oreType) {
      locations = locations.filter(l => l.type === oreType);
    }
    if (locations.length === 0) return null;
    return locations.reduce((nearest, current) => {
      const currentDist = Math.hypot(current.position.x - position.x, current.position.z - position.z);
      const nearestDist = Math.hypot(nearest.position.x - position.x, nearest.position.z - position.z);
      return currentDist < nearestDist ? current : nearest;
    });
  }
}
