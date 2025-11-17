/**
 * Thread Repository Interface
 *
 * Manages conversation threads grouping messages by sender and project.
 * A thread represents a conversation between a user and a bot/agent.
 */

/**
 * DTO para criar uma thread (omitindo campos gerados)
 */
export interface CreateThreadData {
  accountId: string;
  projectId: string;
  senderId: string;
  senderName?: string | null;
  senderPhone?: string | null;
  channel: string;
  provider: string;
  implementation?: string | null;
  status?: string;
  metadata?: Record<string, unknown> | null;
  externalId?: string | null; // Ticket UUID or external thread identifier
}

/**
 * DTO para atualizar uma thread
 */
export interface UpdateThreadData {
  senderName?: string | null;
  senderPhone?: string | null;
  status?: string;
  metadata?: Record<string, unknown> | null;
  lastMessageAt?: Date | null;
}

/**
 * Filtros para buscar threads
 */
export interface ThreadFilters {
  accountId?: string;
  projectId?: string;
  senderId?: string;
  channel?: string;
  provider?: string;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Thread entity (domain object)
 */
export interface Thread {
  id: string;
  accountId: string;
  projectId: string;
  senderId: string;
  senderName: string | null;
  senderPhone: string | null;
  channel: string;
  provider: string;
  implementation: string | null;
  externalId: string | null; // Ticket UUID or external thread identifier
  status: string;
  metadata: Record<string, unknown> | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository interface para Thread
 */
export interface IThreadRepository {
  /**
   * Cria uma nova thread
   */
  create(data: CreateThreadData): Promise<Thread>;

  /**
   * Busca uma thread por ID
   */
  findById(id: string, accountId: string): Promise<Thread | null>;

  /**
   * Busca ou cria uma thread para um sender específico em um projeto
   * (usado quando uma mensagem chega de um sender pela primeira vez)
   */
  findOrCreate(data: CreateThreadData): Promise<Thread>;

  /**
   * Busca threads por account_id com filtros opcionais
   */
  findByAccountId(accountId: string, filters?: Omit<ThreadFilters, 'accountId'>): Promise<Thread[]>;

  /**
   * Busca threads por project_id
   */
  findByProjectId(projectId: string, accountId: string): Promise<Thread[]>;

  /**
   * Atualiza uma thread
   */
  update(id: string, accountId: string, data: UpdateThreadData): Promise<Thread>;

  /**
   * Atualiza o timestamp da última mensagem
   */
  updateLastMessageAt(id: string, timestamp: Date): Promise<Thread>;

  /**
   * Busca threads por múltiplos filtros
   */
  findByFilters(filters: ThreadFilters): Promise<Thread[]>;

  /**
   * Deleta uma thread (hard delete)
   */
  delete(id: string, accountId: string): Promise<void>;
}
