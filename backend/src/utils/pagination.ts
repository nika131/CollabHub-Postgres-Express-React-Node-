
export function cursorPagination<T extends { id: number; rank?: number | string | null}> (
    data: T[],
    limit: number 
) {
    let nextCursor = null;
    let nextCursorRank = null;

    if (data.length > limit) {
        data.pop();

        const lastReturnedItem = data[data.length - 1];
        nextCursor = lastReturnedItem?.id || null;

        nextCursorRank = lastReturnedItem?.rank ?? null;
    }

    return {
        data,
        nextCursor
    };
}