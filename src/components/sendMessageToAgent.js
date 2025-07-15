export async function sendMessageToAgent(message, history = []) {
  const API_URL =
    "https://your-api-id.execute-api.us-east-1.amazonaws.com/chat"; // Replace with your actual URL

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();

    return data.response || ""; // Adjust based on your Lambda output shape
  } catch (error) {
    console.error("Error calling Bedrock agent API:", error);
    return {
      error: true,
      message: error.message || "Unknown error occurred",
    };
  }
}
