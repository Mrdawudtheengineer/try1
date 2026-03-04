import BotConnection from './connection.js';
import CommandRouter from './commandRouter.js';
import logger from './logger.js';
import config from './config.js';

// Import AI modules
import Brain from '../ai/brain.js';
import Perception from '../ai/perception.js';
import Memory from '../ai/memory.js';
import Planner from '../ai/planner.js';
import Learning from '../ai/learning.js';
import Conversation from '../ai/conversation.js';
import CityPlanner from '../ai/cityPlanner.js';

// Import system modules
import Movement from '../systems/movement.js';
import Combat from '../systems/combat.js';
import Mining from '../systems/mining.js';
import Farming from '../systems/farming.js';
import Inventory from '../systems/inventory.js';
import Crafting from '../systems/crafting.js';
import Survival from '../systems/survival.js';
import Builder from '../systems/builder.js';
import CityBuilder from '../systems/cityBuilder.js';
import { getSocket } from '../dashboard/socket.js';

let connection = null;
let bot = null;
let commandRouter = null;
let aiModules = {};

async function initializeBotSystems() {
  logger.info('Initializing bot systems...');

  // Initialize AI modules
  aiModules = {
    perception: new Perception(bot),
    memory: new Memory(),
    planner: new Planner(),
    learning: new Learning(),
    brain: new Brain(),
    conversation: new Conversation(),
    cityPlanner: new CityPlanner()
  };

  // Initialize system modules
  aiModules.movement = new Movement(bot);
  aiModules.combat = new Combat(bot);
  aiModules.mining = new Mining(bot);
  aiModules.farming = new Farming(bot);
  aiModules.inventory = new Inventory(bot);
  aiModules.crafting = new Crafting(bot);
  aiModules.survival = new Survival(bot);
  aiModules.builder = new Builder(bot);
  aiModules.cityBuilder = new CityBuilder(bot);

  // Initialize command router
  commandRouter = new CommandRouter(bot, aiModules);

  // Set up message listener
  bot.on('message', async (jsonMsg) => {
    const msg = jsonMsg.toString();
    
    // Check for chat commands
    if (msg.startsWith('!')) {
      await commandRouter.execute(msg);
    } else if (msg.includes('bot') || msg.includes('ai')) {
      // Potential question for AI
      if (aiModules.conversation && config.openai.apiKey) {
        try {
          const response = await aiModules.conversation.respond(msg);
          bot.chat(response);
        } catch (err) {
          logger.debug('Conversation error', { error: err.message });
        }
      }
    }
  });

  // Set up perception updates
  setInterval(async () => {
    try {
      const perception = await aiModules.perception.perceive();
      aiModules.memory.updateMemory(perception);
      
      // Let brain decide next action
      const action = await aiModules.brain.decideAction(
        perception,
        aiModules.memory.getMemory()
      );

      if (action) {
        await executeAction(action);
      }
    } catch (err) {
      logger.debug('Perception update error', { error: err.message });
    }
  }, config.ai.updateInterval);

  // Persist memory periodically
  setInterval(() => {
    aiModules.memory.persistMemory();
  }, config.ai.memoryPersistInterval);

  logger.info('Bot systems initialized');
}

async function executeAction(action) {
  try {
    switch (action.type) {
      case 'move':
        if (aiModules.movement) {
          await aiModules.movement.goTo(action.x, action.y, action.z);
        }
        break;
      case 'attack':
        if (aiModules.combat && action.target) {
          await aiModules.combat.attack(action.target);
        }
        break;
      case 'mine':
        if (aiModules.mining && action.oreType) {
          await aiModules.mining.mineOres(action.oreType, 10);
        }
        break;
      case 'eat':
        if (bot.food < 18 && aiModules.inventory) {
          await aiModules.inventory.eatFood();
        }
        break;
      case 'defend':
        if (aiModules.survival) {
          await aiModules.survival.seekShelter();
        }
        break;
      default:
        logger.debug('Unknown action type', { actionType: action.type });
    }
  } catch (err) {
    logger.debug('Action execution error', { error: err.message, action: action.type });
  }
}

async function startBot() {
  try {
    logger.info('Starting Minecraft AI Bot');
    connection = new BotConnection();
    bot = await connection.connect();

    logger.info('Connected to server');
    await initializeBotSystems();

    logger.info('Bot ready and operational');
    // Start wiring to dashboard socket when available
    wireDashboardIntegration();
  } catch (err) {
    logger.error('Failed to start bot', { error: err.message });
    process.exit(1);
  }
}

function wireDashboardIntegration() {
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    try {
      const io = getSocket();
      if (!io) {
        if (attempts > 30) {
          clearInterval(interval);
          logger.warn('Dashboard socket not available for wiring');
        }
        return;
      }

      io.on('connection', (socket) => {
        logger.info('Dashboard client connected (bot side)');

        socket.on('control', (data) => {
          try {
            if (!bot) return;
            const ctrl = data.control;
            const value = data.value;
            switch (ctrl) {
              case 'forward': bot.setControlState('forward', value); break;
              case 'back': bot.setControlState('back', value); break;
              case 'left': bot.setControlState('left', value); break;
              case 'right': bot.setControlState('right', value); break;
              case 'jump': bot.setControlState('jump', value); break;
              case 'sneak': bot.setControlState('sneak', value); break;
              default: break;
            }
          } catch (e) {
            logger.debug('Control event error', { error: e.message });
          }
        });

        socket.on('chat', (msg) => {
          try { if (bot) bot.chat(msg); } catch (e) { logger.debug('Chat relay error', { error: e.message }); }
        });

        socket.on('buildcity', async (type) => {
          try {
            if (aiModules.cityBuilder) {
              await aiModules.cityBuilder.buildCity(type);
            }
          } catch (e) {
            logger.error('City build via dashboard failed', { error: e.message });
          }
        });
      });

      // Emit periodic status
      setInterval(() => {
        try {
          if (!bot) return;
          const status = {
            health: bot.health,
            hunger: bot.food,
            xp: bot.experience.level,
            position: bot.entity.position,
            task: aiModules.brain ? aiModules.brain.getCurrentTask() : null,
            inventory: aiModules.inventory ? aiModules.inventory.getSummary() : null
          };
          io.emit('botStatus', status);
        } catch (e) {
          // ignore
        }
      }, 2000);

      clearInterval(interval);
      logger.info('Wired dashboard socket integration');
    } catch (err) {
      // keep retrying
    }
  }, 2000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down bot...');
  if (aiModules.memory) {
    aiModules.memory.persistMemory();
  }
  if (connection) {
    connection.disconnect();
  }
  process.exit(0);
});

// Start the bot
startBot();
