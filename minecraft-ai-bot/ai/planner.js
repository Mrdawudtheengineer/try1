import logger from '../bot/logger.js';

export default class Planner {
  constructor() {
    this.goals = [];
    this.longTermGoals = [
      { goal: 'establish_base', priority: 1 },
      { goal: 'gather_resources', priority: 2 },
      { goal: 'build_defenses', priority: 3 },
      { goal: 'explore_world', priority: 4 },
      { goal: 'find_stronghold', priority: 5 }
    ];
    this.currentGoal = null;
    logger.info('Planner system initialized');
  }

  planActions(perception, memory) {
    const plan = [];

    // Survival priority
    if (perception.health < 5) {
      plan.push({
        action: 'find_shelter',
        priority: 1,
        reason: 'Critical health'
      });
    }

    if (perception.hunger < 10) {
      plan.push({
        action: 'find_food',
        priority: 2,
        reason: 'Hunger too low'
      });
    }

    // Defense priority
    if (perception.hostileMobs.length > 0) {
      plan.push({
        action: 'combat',
        priority: 3,
        targets: perception.hostileMobs,
        reason: 'Hostile mobs nearby'
      });
    }

    if (perception.isNight && !memory.hasShelterNearby) {
      plan.push({
        action: 'build_shelter',
        priority: 4,
        reason: 'Night safety'
      });
    }

    // Resource gathering
    if (memory.hasLowResources) {
      plan.push({
        action: 'gather_resources',
        priority: 5,
        resources: memory.neededResources,
        reason: 'Low on resources'
      });
    }

    // Exploration
    if (memory.unexploredAreas.length > 0) {
      plan.push({
        action: 'explore',
        priority: 6,
        area: memory.unexploredAreas[0],
        reason: 'Exploration needed'
      });
    }

    return plan.sort((a, b) => a.priority - b.priority);
  }

  setLongTermGoal(goal) {
    this.currentGoal = goal;
    logger.info('Long-term goal set', { goal });
  }

  getLongTermGoal() {
    return this.currentGoal;
  }

  executePlan(plan) {
    const actions = [];
    for (const task of plan) {
      actions.push(this.taskToAction(task));
    }
    return actions;
  }

  taskToAction(task) {
    switch (task.action) {
      case 'find_shelter':
        return {
          type: 'navigate',
          target: 'nearest_cave_or_structure',
          priority: task.priority
        };
      case 'find_food':
        return {
          type: 'hunt',
          priority: task.priority
        };
      case 'combat':
        return {
          type: 'attack',
          targets: task.targets,
          priority: task.priority
        };
      case 'build_shelter':
        return {
          type: 'build',
          structure: 'basic_shelter',
          priority: task.priority
        };
      case 'gather_resources':
        return {
          type: 'mine',
          resources: task.resources,
          priority: task.priority
        };
      case 'explore':
        return {
          type: 'navigate',
          target: task.area,
          priority: task.priority
        };
      default:
        return { type: 'idle', priority: 999 };
    }
  }
}
