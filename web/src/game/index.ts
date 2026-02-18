// Game Module Exports
export { KanbanGame, type TaskData } from './KanbanGame';
export { InteractionManager, detectRoomClick, type InteractionConfig } from './InteractionManager';
export { AnimationManager, detectStatusChanges } from './AnimationManager';
export type { Position } from './AnimationManager';
export type { StatusChange } from './AnimationManager';
export { SpriteManager, type SpriteType } from './SpriteManager';
export { SpritesheetManager, SpriteType as SpriteTypeEnum } from './SpritesheetManager';
export { PathfindingManager } from './PathfindingManager';
export type { Point, PathNode, Waypoint } from './PathfindingManager';
export { GameTestPage } from './GameTestPage';
export { GatherGame, type GatherTask, type GatherAgent } from './GatherGame';
export { GatherTestPage } from './GatherTestPage';
export { GatherOffice, type OfficeTask, type OfficeAgent } from './GatherOffice';
export { GatherOfficePage } from './GatherOfficePage';
