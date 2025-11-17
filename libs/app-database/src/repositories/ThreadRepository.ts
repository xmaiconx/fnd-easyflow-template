import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database } from '../types';
import {
  IThreadRepository,
  Thread,
  CreateThreadData,
  UpdateThreadData,
  ThreadFilters,
} from '../interfaces/IThreadRepository';

@Injectable()
export class ThreadRepository implements IThreadRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: CreateThreadData): Promise<Thread> {
    const now = new Date();
    const result = await this.db
      .insertInto('threads')
      .values({
        account_id: data.accountId,
        project_id: data.projectId,
        sender_id: data.senderId,
        sender_name: data.senderName ?? null,
        sender_phone: data.senderPhone ?? null,
        channel: data.channel,
        provider: data.provider,
        implementation: data.implementation ?? null,
        external_id: data.externalId ?? null,
        status: data.status ?? 'ACTIVE',
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        last_message_at: null,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToThread(result);
  }

  async findById(id: string, accountId: string): Promise<Thread | null> {
    const result = await this.db
      .selectFrom('threads')
      .selectAll()
      .where('id', '=', id)
      .where('account_id', '=', accountId)
      .executeTakeFirst();

    return result ? this.mapToThread(result) : null;
  }

  async findOrCreate(data: CreateThreadData): Promise<Thread> {
    // Try to find existing thread by externalId first (optimization)
    if (data.externalId) {
      const existingByExternalId = await this.db
        .selectFrom('threads')
        .selectAll()
        .where('account_id', '=', data.accountId)
        .where('external_id', '=', data.externalId)
        .executeTakeFirst();

      if (existingByExternalId) {
        return this.mapToThread(existingByExternalId);
      }
    }

    // Fallback: Try to find existing thread by composite key
    const existing = await this.db
      .selectFrom('threads')
      .selectAll()
      .where('account_id', '=', data.accountId)
      .where('project_id', '=', data.projectId)
      .where('sender_id', '=', data.senderId)
      .where('channel', '=', data.channel)
      .where('provider', '=', data.provider)
      .executeTakeFirst();

    if (existing) {
      return this.mapToThread(existing);
    }

    // Create new thread if not found
    return this.create(data);
  }

  async findByAccountId(
    accountId: string,
    filters?: Omit<ThreadFilters, 'accountId'>,
  ): Promise<Thread[]> {
    let query = this.db
      .selectFrom('threads')
      .selectAll()
      .where('account_id', '=', accountId);

    if (filters?.projectId) {
      query = query.where('project_id', '=', filters.projectId);
    }
    if (filters?.senderId) {
      query = query.where('sender_id', '=', filters.senderId);
    }
    if (filters?.channel) {
      query = query.where('channel', '=', filters.channel);
    }
    if (filters?.provider) {
      query = query.where('provider', '=', filters.provider);
    }
    if (filters?.status) {
      query = query.where('status', '=', filters.status);
    }
    if (filters?.fromDate) {
      query = query.where('created_at', '>=', filters.fromDate);
    }
    if (filters?.toDate) {
      query = query.where('created_at', '<=', filters.toDate);
    }

    const results = await query.orderBy('last_message_at', 'desc').execute();

    return results.map((row) => this.mapToThread(row));
  }

  async findByProjectId(projectId: string, accountId: string): Promise<Thread[]> {
    const results = await this.db
      .selectFrom('threads')
      .selectAll()
      .where('project_id', '=', projectId)
      .where('account_id', '=', accountId)
      .orderBy('last_message_at', 'desc')
      .execute();

    return results.map((row) => this.mapToThread(row));
  }

  async update(
    id: string,
    accountId: string,
    data: UpdateThreadData,
  ): Promise<Thread> {
    const now = new Date();
    const result = await this.db
      .updateTable('threads')
      .set({
        sender_name: data.senderName ?? undefined,
        sender_phone: data.senderPhone ?? undefined,
        status: data.status ?? undefined,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        last_message_at: data.lastMessageAt ?? undefined,
        updated_at: now,
      })
      .where('id', '=', id)
      .where('account_id', '=', accountId)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToThread(result);
  }

  async updateLastMessageAt(id: string, timestamp: Date): Promise<Thread> {
    const result = await this.db
      .updateTable('threads')
      .set({
        last_message_at: timestamp,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToThread(result);
  }

  async findByFilters(filters: ThreadFilters): Promise<Thread[]> {
    let query = this.db.selectFrom('threads').selectAll();

    if (filters.accountId) {
      query = query.where('account_id', '=', filters.accountId);
    }
    if (filters.projectId) {
      query = query.where('project_id', '=', filters.projectId);
    }
    if (filters.senderId) {
      query = query.where('sender_id', '=', filters.senderId);
    }
    if (filters.channel) {
      query = query.where('channel', '=', filters.channel);
    }
    if (filters.provider) {
      query = query.where('provider', '=', filters.provider);
    }
    if (filters.status) {
      query = query.where('status', '=', filters.status);
    }
    if (filters.fromDate) {
      query = query.where('created_at', '>=', filters.fromDate);
    }
    if (filters.toDate) {
      query = query.where('created_at', '<=', filters.toDate);
    }

    const results = await query.orderBy('last_message_at', 'desc').execute();

    return results.map((row) => this.mapToThread(row));
  }

  async delete(id: string, accountId: string): Promise<void> {
    await this.db
      .deleteFrom('threads')
      .where('id', '=', id)
      .where('account_id', '=', accountId)
      .execute();
  }

  /**
   * Maps database row to Thread entity (snake_case → camelCase)
   */
  private mapToThread(row: any): Thread {
    return {
      id: row.id,
      accountId: row.account_id,
      projectId: row.project_id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      senderPhone: row.sender_phone,
      channel: row.channel,
      provider: row.provider,
      implementation: row.implementation,
      externalId: row.external_id,
      status: row.status,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      lastMessageAt: row.last_message_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
