export const templates = {
  'students-template': {
    name: 'Students Template',
    columns: {
      'First name': 'regular',
      'Last name': 'regular',
      Major: 'regular',
      isEngineer: 'ai-trigger',
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
