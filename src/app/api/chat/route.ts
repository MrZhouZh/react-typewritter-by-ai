import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const message = searchParams.get('message');

  // Set up SSE headers
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Mock response generator - replace this with your actual AI/chat service
  const mockResponse = async () => {
    const response = `Thank you for your message: "${message}". This is a mock response that demonstrates the typewriter effect.`;

    for (const char of response) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const data = {
        type: 'token',
        content: char
      };
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    }

    // Send done event
    await writer.write(encoder.encode(`event: done\ndata: {}\n\n`));
    await writer.close();
  };

  // Start sending the response
  mockResponse();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
