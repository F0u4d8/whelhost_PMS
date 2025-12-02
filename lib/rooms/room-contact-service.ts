// lib/rooms/room-contact-service.ts

export interface ContactRequest {
  hotelId: string;
  roomId: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export async function contactRoomOwner(contactData: ContactRequest): Promise<ContactResponse> {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Error contacting room owner:", error);
    return {
      success: false,
      message: "An error occurred while sending your message",
    };
  }
}