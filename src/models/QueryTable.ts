export interface Aggregate {
  aggregate: {
    count: number
  }
}

export interface QueryTableOptions {
  offset?: number,
  limit?: number,
  orderBy?: Record<string, unknown>
  filter?: string,
  type?: string
}
