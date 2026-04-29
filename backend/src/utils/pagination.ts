
export function cursorPagination<T extends { id: number}> (
    data: T[],
    limit: number 
) {
    let nextCursor = null;

    if (data.length > limit) {
        data.pop();

        const lastReturnedItem = data[data.length - 1];
        nextCursor = lastReturnedItem?.id || null;
    }

    return {
        data,
        nextCursor
    };
}