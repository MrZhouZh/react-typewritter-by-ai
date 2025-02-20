import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const message = searchParams.get('message');

    if (!message) {
      return new Response('Message parameter is required', { status: 400 });
    }

    // Set up SSE
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the response immediately
    const response = new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

    // Mock response generator
    const mockResponse = async () => {
      try {
        const response = `Thank you for your message: "${message}". This is a mock response that demonstrates the typewriter effect.`;

        // Send an initial message immediately
        const initialData = {
          type: 'token',
          content: response[0]
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));

        // Send the rest of the message
        for (let i = 1; i < response.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 30));
          const data = {
            type: 'token',
            content: response[i]
          };
          await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }

        // Send done event
        await writer.write(encoder.encode(`event: done\ndata: {}\n\n`));
      } catch (error) {
        console.error('Error in mockResponse:', error);
      } finally {
        await writer.close();
      }
    };

    // Start sending the response asynchronously
    mockResponse().catch(console.error);

    return response;
  } catch (error) {
    console.error('Error in GET handler:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
