import { BadRequestException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseEntity } from '../databases/base.entity';
import { SortDirection } from '../dtos/page-pagination.dto';

export interface PaginateResponse<T> {
  total: number;
  limit: number;
  offset: number;
  docs: T[];
}

export interface CursorPaginateResponse<T> {
  docs: T[];
  nextCursor?: string | null;
}

export async function paginateByPage<T extends BaseEntity>(params: {
  repository: Repository<T>;
  alias: string;
  where?: (qb: SelectQueryBuilder<T>) => void;
  joins?: (qb: SelectQueryBuilder<T>) => void;
  limit: number;
  offset: number;
  orderBy?: { field: string; direction: SortDirection };
}): Promise<PaginateResponse<T>> {
  const { repository, alias, where, joins, limit, offset, orderBy } = params;

  const qb = repository.createQueryBuilder(alias);

  if (joins) {
    joins(qb);
  }

  if (where) {
    where(qb);
  }

  if (limit > 0) {
    qb.skip(offset).take(limit);
  }

  if (orderBy) {
    qb.orderBy(`${alias}.${orderBy.field}`, orderBy.direction);
  }

  const [docs, total] = await qb.getManyAndCount();

  return {
    total,
    limit,
    offset,
    docs,
  };
}

export async function paginateByCursor<T extends BaseEntity>(params: {
  repository: Repository<T>;
  alias: string;
  where?: (qb: SelectQueryBuilder<T>) => void;
  joins?: (qb: SelectQueryBuilder<T>) => void;
  cursor?: string;
  limit: number;
  orderBy?: { field: string; direction: SortDirection };
}): Promise<CursorPaginateResponse<T>> {
  const { repository, alias, where, joins, cursor, limit, orderBy } = params;

  const qb = repository.createQueryBuilder(alias);

  if (joins) {
    joins(qb);
  }

  if (where) {
    qb.where(where);
  }

  let sortField = orderBy?.field ?? 'id';
  let sortDirection = orderBy?.direction ?? SortDirection.ASC;

  if (cursor) {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const cursorObj = JSON.parse(decoded) as {
      values: Record<string, any>;
      orderBy: { field: string; direction: SortDirection };
    };

    sortField = cursorObj.orderBy.field;
    sortDirection = cursorObj.orderBy.direction;

    const comparisonOperator = sortDirection === SortDirection.DESC ? '>' : '<';

    qb.andWhere(`${alias}.${sortField} ${comparisonOperator} :cursorValue`, {
      cursorValue: cursorObj.values[sortField],
    });
  }

  if (
    sortDirection !== SortDirection.ASC &&
    sortDirection !== SortDirection.DESC
  ) {
    throw new BadRequestException('orderBy.direction must be ASC or DESC');
  }

  qb.orderBy(`${alias}.${sortField}`, sortDirection);
  qb.take(limit + 1); // 다음 페이지 여부 확인 위해 1개 더 가져옴

  const results = await qb.getMany();

  let nextCursor: string | null = null;
  if (results.length > limit) {
    const lastItem = results.pop()!;

    const values: Record<string, any> = {
      [sortField]: (lastItem as any)[sortField],
    };

    const cursorObj = {
      values,
      orderBy: { field: sortField, direction: sortDirection },
    };

    nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString('base64');
  }

  return {
    docs: results,
    nextCursor,
  };
}
