'use server';

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = body.prompt;
  const API_URL = 'https://ai-powered-spreadsheet.onrender.com';
  const response = await fetch(`${API_URL}/check-engineer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  return Response.json(data);
}
