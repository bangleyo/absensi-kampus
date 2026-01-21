import {Course} from './course.model';

export interface ClassSession {
  course: Course;
  id: number;
  lecturer: string;
  place: string;
  duration: string;
  timeRange: string;
  isExpired: boolean;
  qrToken: string;
  hasAttended: boolean;
}
