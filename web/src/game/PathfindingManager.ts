/**
 * Sistema de Pathfinding A* para movimento inteligente
 * Sprint 2: Movimento fluido entre salas
 */

export interface Point {
  x: number;
  y: number;
}

export interface PathNode {
  x: number;
  y: number;
  g: number; // Custo do início até este nó
  h: number; // Heurística (estimativa até o destino)
  f: number; // g + h
  parent: PathNode | null;
  walkable: boolean;
}

export interface Waypoint {
  id: string;
  x: number;
  y: number;
  connections: string[]; // IDs dos waypoints conectados
}

/**
 * Gerenciador de Pathfinding A*
 * Permite movimento inteligente entre salas usando waypoints
 */
export class PathfindingManager {
  private waypoints: Map<string, Waypoint> = new Map();
  private gridSize: number = 20; // Tamanho do grid para colisão
  private obstacles: Set<string> = new Set(); // Posições bloqueadas
  private roomCenters: Map<string, Point> = new Map();

  constructor() {
    this.initializeWaypoints();
  }

  /**
   * Inicializa waypoints padrão para o escritório
   */
  private initializeWaypoints() {
    // Waypoints principais (corredores entre salas)
    const defaultWaypoints: Waypoint[] = [
      // Centro de cada sala
      { id: 'todo-center', x: 150, y: 300, connections: ['hallway-1'] },
      { id: 'in-progress-center', x: 400, y: 300, connections: ['hallway-1', 'hallway-2'] },
      { id: 'blocked-center', x: 650, y: 300, connections: ['hallway-2', 'hallway-3'] },
      { id: 'done-center', x: 900, y: 300, connections: ['hallway-3'] },

      // Corredores (hallways)
      { id: 'hallway-1', x: 275, y: 300, connections: ['todo-center', 'in-progress-center'] },
      { id: 'hallway-2', x: 525, y: 300, connections: ['in-progress-center', 'blocked-center'] },
      { id: 'hallway-3', x: 775, y: 300, connections: ['blocked-center', 'done-center'] },

      // Waypoints extras para navegação vertical
      { id: 'todo-top', x: 150, y: 150, connections: ['todo-center'] },
      { id: 'todo-bottom', x: 150, y: 450, connections: ['todo-center'] },
      { id: 'in-progress-top', x: 400, y: 150, connections: ['in-progress-center'] },
      { id: 'in-progress-bottom', x: 400, y: 450, connections: ['in-progress-center'] },
      { id: 'blocked-top', x: 650, y: 150, connections: ['blocked-center'] },
      { id: 'blocked-bottom', x: 650, y: 450, connections: ['blocked-center'] },
      { id: 'done-top', x: 900, y: 150, connections: ['done-center'] },
      { id: 'done-bottom', x: 900, y: 450, connections: ['done-center'] },
    ];

    defaultWaypoints.forEach((wp) => {
      this.waypoints.set(wp.id, wp);
    });
  }

  /**
   * Atualiza waypoints baseado nas dimensões reais das salas
   */
  updateWaypointsForRooms(rooms: {
    todo: { x: number; y: number; width: number; height: number };
    inProgress: { x: number; y: number; width: number; height: number };
    blocked: { x: number; y: number; width: number; height: number };
    done: { x: number; y: number; width: number; height: number };
  }) {
    // Calcular centros das salas
    const todoCenter = {
      x: rooms.todo.x + rooms.todo.width / 2,
      y: rooms.todo.y + rooms.todo.height / 2,
    };
    const inProgressCenter = {
      x: rooms.inProgress.x + rooms.inProgress.width / 2,
      y: rooms.inProgress.y + rooms.inProgress.height / 2,
    };
    const blockedCenter = {
      x: rooms.blocked.x + rooms.blocked.width / 2,
      y: rooms.blocked.y + rooms.blocked.height / 2,
    };
    const doneCenter = {
      x: rooms.done.x + rooms.done.width / 2,
      y: rooms.done.y + rooms.done.height / 2,
    };

    // Salvar centros das salas
    this.roomCenters.set('todo', todoCenter);
    this.roomCenters.set('in-progress', inProgressCenter);
    this.roomCenters.set('blocked', blockedCenter);
    this.roomCenters.set('done', doneCenter);

    // Atualizar waypoints
    this.waypoints.clear();

    // Centro de cada sala
    this.addWaypoint('todo-center', todoCenter.x, todoCenter.y, ['hallway-1']);
    this.addWaypoint('in-progress-center', inProgressCenter.x, inProgressCenter.y, [
      'hallway-1',
      'hallway-2',
    ]);
    this.addWaypoint('blocked-center', blockedCenter.x, blockedCenter.y, [
      'hallway-2',
      'hallway-3',
    ]);
    this.addWaypoint('done-center', doneCenter.x, doneCenter.y, ['hallway-3']);

    // Corredores entre salas (pontos médios)
    this.addWaypoint('hallway-1', (todoCenter.x + inProgressCenter.x) / 2, todoCenter.y, [
      'todo-center',
      'in-progress-center',
    ]);
    this.addWaypoint('hallway-2', (inProgressCenter.x + blockedCenter.x) / 2, inProgressCenter.y, [
      'in-progress-center',
      'blocked-center',
    ]);
    this.addWaypoint('hallway-3', (blockedCenter.x + doneCenter.x) / 2, blockedCenter.y, [
      'blocked-center',
      'done-center',
    ]);

    // Waypoints verticais para cada sala
    this.addWaypoint('todo-top', todoCenter.x, rooms.todo.y + 150, ['todo-center']);
    this.addWaypoint('todo-bottom', todoCenter.x, rooms.todo.y + rooms.todo.height - 80, [
      'todo-center',
    ]);
    this.addWaypoint('in-progress-top', inProgressCenter.x, rooms.inProgress.y + 150, [
      'in-progress-center',
    ]);
    this.addWaypoint(
      'in-progress-bottom',
      inProgressCenter.x,
      rooms.inProgress.y + rooms.inProgress.height - 80,
      ['in-progress-center']
    );
    this.addWaypoint('blocked-top', blockedCenter.x, rooms.blocked.y + 150, ['blocked-center']);
    this.addWaypoint(
      'blocked-bottom',
      blockedCenter.x,
      rooms.blocked.y + rooms.blocked.height - 80,
      ['blocked-center']
    );
    this.addWaypoint('done-top', doneCenter.x, rooms.done.y + 150, ['done-center']);
    this.addWaypoint('done-bottom', doneCenter.x, rooms.done.y + rooms.done.height - 80, [
      'done-center',
    ]);
  }

  /**
   * Adiciona um waypoint
   */
  addWaypoint(id: string, x: number, y: number, connections: string[]) {
    this.waypoints.set(id, { id, x, y, connections });
  }

  /**
   * Adiciona um obstáculo
   */
  addObstacle(x: number, y: number) {
    const key = `${Math.floor(x / this.gridSize)},${Math.floor(y / this.gridSize)}`;
    this.obstacles.add(key);
  }

  /**
   * Remove um obstáculo
   */
  removeObstacle(x: number, y: number) {
    const key = `${Math.floor(x / this.gridSize)},${Math.floor(y / this.gridSize)}`;
    this.obstacles.delete(key);
  }

  /**
   * Verifica se uma posição é caminhável
   */
  isWalkable(x: number, y: number): boolean {
    const key = `${Math.floor(x / this.gridSize)},${Math.floor(y / this.gridSize)}`;
    return !this.obstacles.has(key);
  }

  /**
   * Encontra o waypoint mais próximo de uma posição
   */
  findNearestWaypoint(x: number, y: number): Waypoint | null {
    let nearest: Waypoint | null = null;
    let minDistance = Infinity;

    this.waypoints.forEach((wp) => {
      const distance = Math.sqrt(Math.pow(wp.x - x, 2) + Math.pow(wp.y - y, 2));
      if (distance < minDistance) {
        minDistance = distance;
        nearest = wp;
      }
    });

    return nearest;
  }

  /**
   * Encontra o waypoint de uma sala específica mais próximo
   */
  findRoomWaypoint(room: string, _position?: Point): Waypoint | null {
    // Retornar o centro da sala
    const centerId = `${room}-center`;
    return this.waypoints.get(centerId) || null;
  }

  /**
   * Algoritmo A* para encontrar caminho entre dois waypoints
   */
  findPath(startId: string, endId: string): Point[] {
    const start = this.waypoints.get(startId);
    const end = this.waypoints.get(endId);

    if (!start || !end) {
      console.warn(`Waypoint não encontrado: ${startId} -> ${endId}`);
      return [];
    }

    // Se for o mesmo waypoint, retornar posição
    if (startId === endId) {
      return [{ x: start.x, y: start.y }];
    }

    // A* no grafo de waypoints
    const openSet: Waypoint[] = [start];
    const closedSet: Set<string> = new Set();
    const gScore: Map<string, number> = new Map();
    const fScore: Map<string, number> = new Map();
    const cameFrom: Map<string, string> = new Map();

    gScore.set(startId, 0);
    fScore.set(startId, this.heuristic(start, end));

    while (openSet.length > 0) {
      // Encontrar nó com menor fScore
      openSet.sort((a, b) => (fScore.get(a.id) || Infinity) - (fScore.get(b.id) || Infinity));
      const current = openSet.shift()!;

      if (current.id === endId) {
        return this.reconstructPath(cameFrom, current);
      }

      closedSet.add(current.id);

      // Verificar vizinhos
      for (const neighborId of current.connections) {
        if (closedSet.has(neighborId)) continue;

        const neighbor = this.waypoints.get(neighborId);
        if (!neighbor) continue;

        const tentativeG = (gScore.get(current.id) || 0) + this.heuristic(current, neighbor);

        if (!openSet.find((n) => n.id === neighborId)) {
          openSet.push(neighbor);
        } else if (tentativeG >= (gScore.get(neighborId) || Infinity)) {
          continue;
        }

        cameFrom.set(neighborId, current.id);
        gScore.set(neighborId, tentativeG);
        fScore.set(neighborId, tentativeG + this.heuristic(neighbor, end));
      }
    }

    // Não encontrou caminho
    console.warn(`Caminho não encontrado: ${startId} -> ${endId}`);
    return [
      { x: start.x, y: start.y },
      { x: end.x, y: end.y },
    ];
  }

  /**
   * Heurística: distância Euclidiana
   */
  private heuristic(a: Waypoint | Point, b: Waypoint | Point): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  /**
   * Reconstrói o caminho a partir do mapa de predecessores
   */
  private reconstructPath(cameFrom: Map<string, string>, current: Waypoint): Point[] {
    const path: Point[] = [{ x: current.x, y: current.y }];
    let currentId: string | undefined = current.id;

    while (cameFrom.has(currentId!)) {
      currentId = cameFrom.get(currentId!);
      const wp = this.waypoints.get(currentId!);
      if (wp) {
        path.unshift({ x: wp.x, y: wp.y });
      }
    }

    return path;
  }

  /**
   * Encontra caminho entre duas posições arbitrárias
   */
  findPathBetweenPoints(start: Point, end: Point): Point[] {
    // Encontrar waypoints mais próximos
    const startWaypoint = this.findNearestWaypoint(start.x, start.y);
    const endWaypoint = this.findNearestWaypoint(end.x, end.y);

    if (!startWaypoint || !endWaypoint) {
      // Caminho direto se não houver waypoints
      return [start, end];
    }

    // Encontrar caminho entre waypoints
    const waypointPath = this.findPath(startWaypoint.id, endWaypoint.id);

    // Adicionar posições inicial e final
    const fullPath: Point[] = [start, ...waypointPath, end];

    // Otimizar: remover pontos desnecessários
    return this.simplifyPath(fullPath);
  }

  /**
   * Encontra caminho entre duas salas
   */
  findPathBetweenRooms(fromRoom: string, toRoom: string): Point[] {
    const fromCenter = this.roomCenters.get(fromRoom);
    const toCenter = this.roomCenters.get(toRoom);

    if (!fromCenter || !toCenter) {
      console.warn(`Sala não encontrada: ${fromRoom} -> ${toRoom}`);
      return [];
    }

    return this.findPathBetweenPoints(fromCenter, toCenter);
  }

  /**
   * Simplifica o caminho removendo pontos colineares
   */
  private simplifyPath(path: Point[]): Point[] {
    if (path.length <= 2) return path;

    const simplified: Point[] = [path[0]];

    for (let i = 1; i < path.length - 1; i++) {
      const prev = simplified[simplified.length - 1];
      const current = path[i];
      const next = path[i + 1];

      // Verificar se os três pontos são colineares
      const crossProduct =
        (current.x - prev.x) * (next.y - prev.y) - (current.y - prev.y) * (next.x - prev.x);

      // Se não forem colineares, adicionar ponto
      if (Math.abs(crossProduct) > 0.01) {
        simplified.push(current);
      }
    }

    simplified.push(path[path.length - 1]);
    return simplified;
  }

  /**
   * Retorna todos os waypoints (para debug/visualização)
   */
  getAllWaypoints(): Waypoint[] {
    return Array.from(this.waypoints.values());
  }

  /**
   * Retorna centros das salas
   */
  getRoomCenters(): Map<string, Point> {
    return this.roomCenters;
  }
}

export default PathfindingManager;
