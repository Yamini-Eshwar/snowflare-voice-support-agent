import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("🎫 API Route: Creating ticket with body:", body);

    const response = await fetch(
      "http://54.241.251.193:4000/api/v1/tickets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AYWlnZW50aWNzLmFpIiwidGVuYW50SWQiOiJ0ZW5hbnRfYWlnZW50aWNzX2FpXzE3NjA1MjcwMTgwNzQiLCJpc0FkbWluIjp0cnVlLCJ1c2VyVHlwZSI6InRlbmFudF91c2VyIiwiaWF0IjoxNzYyMzMyMjc1LCJleHAiOjE3NjI0MTg2NzV9.2wqyE0w5jNVpexQ4oXH1OF-6SB7-FLC6S28KZ6l0yJg`,
          "Content-Type": "application/json",
          "x-tenant-id": "tenant_aigentics_ai_1760527018074",
        },
        body: JSON.stringify(body),
      }
    );

    console.log("🎫 API Route: Ticket API Response Status:", response.status);

    const data = await response.json();
    console.log("🎫 API Route: Ticket Response:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to create ticket: ${response.status}`, details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("🎫 API Route: Ticket Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create ticket", message: error.message },
      { status: 500 }
    );
  }
}
