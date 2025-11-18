"use server";

export async function getSessionToken() {
  try {
    // Create an ephemeral client token using the correct endpoint
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-realtime',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    console.log("✅ Ephemeral token created:", {
      expires_at: data.expires_at,
    });

    // Return the ephemeral client key to the client
    return data.value;
  } catch (error) {
    console.error("❌ Failed to create ephemeral session:", error);
    console.error("Error details:", {
      message: error.message,
    });
    throw new Error(`Failed to generate session token: ${error.message}`);
  }
}
