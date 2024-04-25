export const getEnumNumberValues = (data: Record<number | string, number | string>) => Object.values(data).filter((value) => typeof value === 'number') as number[];
export const getEnumStringValues = (data: Record<number | string, number | string>) => Object.values(data).filter((value) => typeof value === 'string') as string[];
