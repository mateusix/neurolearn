import { lessons } from './lessons';
export const firstSpeakingStage=lessons.findIndex(lesson=>lesson.exercises.some(exercise=>exercise.kind==='speak'));
export function canOpenStage(index:number,completed:number){
 return Number.isInteger(index)&&index>=0&&index<lessons.length&&Number.isInteger(completed)&&completed>=0&&completed<=lessons.length&&index<=completed;
}
