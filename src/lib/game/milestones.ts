export const MILESTONES = [1000, 3000, 5000] as const;
export function crossedMilestone(previous: number, total: number): number | null {
 return [...MILESTONES].reverse().find(mark => previous < mark && total >= mark) ?? null;
}
