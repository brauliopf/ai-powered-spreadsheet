export const templates = {
  'students-template': {
    name: 'Students',
    columns: {
      'First name': { type: 'regular' },
      'Last name': { type: 'regular' },
      Major: { type: 'regular' },
      isEngineer: {
        type: 'ai-trigger',
        prompt: 'Is the student from a major in @Major an engineer?',
      },
    },
    rows: [
      {
        'First name': 'John',
        'Last name': 'Doe',
        Major: 'Computer Science',
        isEngineer: '',
      },
      {
        'First name': 'Jane',
        'Last name': 'Smith',
        Major: 'Biology',
        isEngineer: '',
      },
      {
        'First name': 'Michael',
        'Last name': 'Johnson',
        Major: 'Mechanical Engineering',
        isEngineer: '',
      },
    ],
  },
};
