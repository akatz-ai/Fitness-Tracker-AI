export interface WorkoutTemplate {
  id: string
  name: string
  tag: string
  exercises: {
    name: string
    sets: number
    reps: number
    weight: number | null
  }[]
}

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'back-day',
    name: 'Back Day',
    tag: 'Lifting',
    exercises: [
      { name: 'Pull ups', sets: 3, reps: 8, weight: null },
      { name: 'Face pulls', sets: 3, reps: 12, weight: null },
      { name: 'Dumbbell curls', sets: 3, reps: 10, weight: null },
      { name: 'Rows', sets: 3, reps: 8, weight: null },
    ],
  },
  {
    id: 'chest-day',
    name: 'Chest Day',
    tag: 'Lifting',
    exercises: [
      { name: 'Bench press', sets: 3, reps: 8, weight: null },
      { name: 'Incline dumbbell press', sets: 3, reps: 10, weight: null },
      { name: 'Cable flyes', sets: 3, reps: 12, weight: null },
      { name: 'Dips', sets: 3, reps: 10, weight: null },
    ],
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    tag: 'Lifting',
    exercises: [
      { name: 'Squats', sets: 4, reps: 8, weight: null },
      { name: 'Romanian deadlifts', sets: 3, reps: 10, weight: null },
      { name: 'Leg press', sets: 3, reps: 12, weight: null },
      { name: 'Calf raises', sets: 4, reps: 15, weight: null },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    tag: 'Lifting',
    exercises: [],
  },
]

export const availableTags = ['Lifting', 'Cardio', 'HIIT', 'Stretching', 'Sports']
