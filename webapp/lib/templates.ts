export const templates = [
  {
    id: "research-template",
    name: "Research Template",
    description: "A template for research with AI-powered analysis",
    columns: ["First name", "Last name", "Major", "isEngineer"],
    columnTypes: {
      "First name": "regular",
      "Last name": "regular",
      Major: "regular",
      isEngineer: "ai-trigger",
    },
    initialData: [
      {
        "First name": "John",
        "Last name": "Doe",
        Major: "Computer Science",
        isEngineer: "Yes",
      },
      {
        "First name": "Jane",
        "Last name": "Smith",
        Major: "Biology",
        isEngineer: "No",
      },
      {
        "First name": "Michael",
        "Last name": "Johnson",
        Major: "Mechanical Engineering",
        isEngineer: "Yes",
      },
    ],
  },
]
