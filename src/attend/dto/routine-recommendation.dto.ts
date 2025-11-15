export class RoutineRecommendationResponseDto {
  date: string;
  stressLevel: string;
  position: {
    id: number;
    name: string;
    category: string;
  };
  routines: string[];
}
