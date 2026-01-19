export interface ClassSessionForm {
  id: number;
  courseId: number;
  lecturer: string;
  place: string;
  duration: string;
  startTime: string;
  endTime: string;
  latitude: number;
  longitude: number;
  isExpired: boolean;
}
