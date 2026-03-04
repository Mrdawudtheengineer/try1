import fs from 'fs';
import logger from '../bot/logger.js';

export default class Learning {
  constructor() {
    this.learningData = {
      commandFrequency: {},
      playerPreferences: {},
      trustedPlayers: [],
      learnedStrategies: [],
      executedActions: []
    };

    this.learningFile = 'data/learningData.json';
    this.loadLearningData();
    logger.info('Learning system initialized');
  }

  loadLearningData() {
    if (fs.existsSync(this.learningFile)) {
      try {
        const data = fs.readFileSync(this.learningFile, 'utf8');
        this.learningData = JSON.parse(data);
        logger.info('Learning data loaded');
      } catch (err) {
        logger.warn('Failed to load learning data', { error: err.message });
      }
    }
  }

  trackCommand(command) {
    const key = command.toLowerCase();
    this.learningData.commandFrequency[key] =
      (this.learningData.commandFrequency[key] || 0) + 1;
    logger.debug('Command tracked', { command });
  }

  trackAction(action, result) {
    this.learningData.executedActions.push({
      action,
      result,
      timestamp: Date.now()
    });

    // Keep only last 1000 actions
    if (this.learningData.executedActions.length > 1000) {
      this.learningData.executedActions = this.learningData.executedActions.slice(-500);
    }
  }

  trackPlayerInteraction(playerName, interaction) {
    if (!this.learningData.playerPreferences[playerName]) {
      this.learningData.playerPreferences[playerName] = {
        interactions: 0,
        lastSeen: Date.now(),
        preferredActivities: []
      };
    }

    const preference = this.learningData.playerPreferences[playerName];
    preference.interactions++;
    preference.lastSeen = Date.now();

    if (!preference.preferredActivities.includes(interaction)) {
      preference.preferredActivities.push(interaction);
    }

    logger.debug('Player interaction tracked', { playerName, interaction });
  }

  addTrustedPlayer(playerName) {
    if (!this.learningData.trustedPlayers.includes(playerName)) {
      this.learningData.trustedPlayers.push(playerName);
      logger.info('Player trusted', { playerName });
    }
  }

  isTrustedPlayer(playerName) {
    return this.learningData.trustedPlayers.includes(playerName);
  }

  learnStrategy(name, strategy) {
    const existing = this.learningData.learnedStrategies.find(s => s.name === name);
    if (!existing) {
      this.learningData.learnedStrategies.push({
        name,
        strategy,
        learned: Date.now(),
        successRate: 0.5
      });
      logger.info('Strategy learned', { name });
    }
  }

  updateStrategySuccess(name, success) {
    const strategy = this.learningData.learnedStrategies.find(s => s.name === name);
    if (strategy) {
      const currentSuccess = strategy.successRate;
      const newSuccess = success ? 1 : 0;
      strategy.successRate = (currentSuccess + newSuccess) / 2;
      logger.debug('Strategy success updated', { name, successRate: strategy.successRate });
    }
  }

  getMostFrequentCommand() {
    let maxCommand = null;
    let maxCount = 0;

    for (const [cmd, count] of Object.entries(this.learningData.commandFrequency)) {
      if (count > maxCount) {
        maxCount = count;
        maxCommand = cmd;
      }
    }

    return maxCommand;
  }

  getPlayerPreferences(playerName) {
    return this.learningData.playerPreferences[playerName] || null;
  }

  persistLearningData() {
    try {
      fs.writeFileSync(this.learningFile, JSON.stringify(this.learningData, null, 2));
      logger.debug('Learning data persisted');
    } catch (err) {
      logger.error('Failed to persist learning data', { error: err.message });
    }
  }

  getSummary() {
    return {
      commandFrequency: this.learningData.commandFrequency,
      trustedPlayers: this.learningData.trustedPlayers,
      strategiesCounts: this.learningData.learnedStrategies.length,
      actionsTracked: this.learningData.executedActions.length,
      playersInteracted: Object.keys(this.learningData.playerPreferences).length
    };
  }
}
