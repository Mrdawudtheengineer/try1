import fs from 'fs';
import logger from '../bot/logger.js';

export default class CityPlanner {
  constructor() {
    this.cityBuildData = {
      cities: [],
      constructions: []
    };

    this.cityFile = 'data/cityBuild.json';
    this.loadCityData();
    logger.info('City Planner initialized');
  }

  loadCityData() {
    if (fs.existsSync(this.cityFile)) {
      try {
        const data = fs.readFileSync(this.cityFile, 'utf8');
        this.cityBuildData = JSON.parse(data);
        logger.info('City build data loaded');
      } catch (err) {
        logger.warn('Failed to load city data', { error: err.message });
      }
    }
  }

  planCity(cityType, centerPosition) {
    const cityLayout = this.generateLayout(cityType);

    const city = {
      id: `city_${Date.now()}`,
      type: cityType,
      centerPosition,
      layout: cityLayout,
      structures: [],
      status: 'planning',
      startTime: Date.now(),
      progress: 0
    };

    this.cityBuildData.cities.push(city);
    logger.info('City plan created', { cityType, centerPosition });
    return city;
  }

  generateLayout(cityType) {
    const layouts = {
      medieval: {
        roads: 4,
        houses: 12,
        farms: 2,
        marketplaces: 1,
        walls: true,
        towers: 4,
        castle: true
      },
      village: {
        roads: 2,
        houses: 6,
        farms: 3,
        marketplaces: 0,
        walls: false,
        towers: 0,
        castle: false
      },
      modern: {
        roads: 6,
        houses: 20,
        farms: 1,
        marketplaces: 2,
        walls: false,
        towers: 0,
        castle: false
      }
    };

    return layouts[cityType] || layouts.village;
  }

  getCurrentConstruction() {
    const constructions = this.cityBuildData.constructions.filter(c => c.status === 'in-progress');
    return constructions.length > 0 ? constructions[0] : null;
  }

  startConstruction(city, structureType, position) {
    const construction = {
      id: `construction_${Date.now()}`,
      cityId: city.id,
      structureType,
      position,
      status: 'in-progress',
      started: Date.now(),
      progress: 0,
      blocksPlaced: 0,
      totalBlocks: this.estimateBlocksNeeded(structureType)
    };

    this.cityBuildData.constructions.push(construction);
    logger.info('Construction started', { structureType, position });
    return construction;
  }

  estimateBlocksNeeded(structureType) {
    const estimates = {
      house: 200,
      farm: 100,
      road: 50,
      tower: 400,
      wall: 300,
      marketplace: 250,
      castle: 1000,
      storage: 150,
      workshop: 180
    };

    return estimates[structureType] || 100;
  }

  updateProgress(constructionId, blocksPlaced) {
    const construction = this.cityBuildData.constructions.find(c => c.id === constructionId);
    if (construction) {
      construction.blocksPlaced = blocksPlaced;
      construction.progress = (blocksPlaced / construction.totalBlocks) * 100;

      if (construction.progress >= 100) {
        construction.status = 'completed';
        construction.completed = Date.now();
        logger.info('Construction completed', { constructionId, structureType: construction.structureType });
      }
    }
  }

  persistCityData() {
    try {
      fs.writeFileSync(this.cityFile, JSON.stringify(this.cityBuildData, null, 2));
      logger.debug('City build data persisted');
    } catch (err) {
      logger.error('Failed to persist city data', { error: err.message });
    }
  }

  getCityStatus(cityId) {
    const city = this.cityBuildData.cities.find(c => c.id === cityId);
    if (!city) return null;

    const constructions = this.cityBuildData.constructions.filter(c => c.cityId === cityId);
    const completed = constructions.filter(c => c.status === 'completed').length;
    const inProgress = constructions.filter(c => c.status === 'in-progress').length;

    return {
      city,
      totalStructures: constructions.length,
      completed,
      inProgress,
      progress: (completed / constructions.length) * 100
    };
  }

  getSummary() {
    return {
      totalCities: this.cityBuildData.cities.length,
      totalConstructions: this.cityBuildData.constructions.length,
      inProgress: this.cityBuildData.constructions.filter(c => c.status === 'in-progress').length,
      completed: this.cityBuildData.constructions.filter(c => c.status === 'completed').length
    };
  }
}
