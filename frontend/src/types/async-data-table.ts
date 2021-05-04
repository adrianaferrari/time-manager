export interface AsyncDataTableResponse<T = Record<string, any>> {
	filtered: number,
	total: number,
	records: T[],
}

export interface AsyncDataTableRequest {
	pageIndex: number,
	recordsPerPage: number,
	orderBy: { key: string, direction: 'asc'|'desc' }[],
	query: string,
}
