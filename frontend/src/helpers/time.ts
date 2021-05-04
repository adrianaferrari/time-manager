export const sleep = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

export const animationFrame = (): Promise<void> => new Promise((res) => requestAnimationFrame(() => res()));
