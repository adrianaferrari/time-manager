export interface AsyncDataTableRequest {
	pageIndex: number,
	recordsPerPage: number,
	orderBy: { column: string, order: 'asc'|'desc' }[],
	query: string,
}

export interface AsyncDataTableResponse<T = Record<string, any>> {
	filtered: number,
	total: number,
	records: T[],
}
