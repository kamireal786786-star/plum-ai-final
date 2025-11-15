export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

/**
 * Simulates sending a contact form message to a backend service.
 * In a real application, this would make an actual HTTP request.
 * @param formData The data from the contact form.
 * @returns A promise that resolves with a success message.
 */
export const sendMessage = async (formData: ContactFormData): Promise<{ success: boolean; message: string }> => {
  console.log("[Contact Service] Preparing to send message...");
  console.log("[Contact Service] Data received:", formData);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real implementation, you would have an API call here.
  // For now, we'll just assume it's always successful.
  if (formData.name && formData.email && formData.message) {
    console.log("[Contact Service] Message simulation successful.");
    return Promise.resolve({ success: true, message: "Your message has been sent successfully!" });
  } else {
    console.error("[Contact Service] Message simulation failed: Missing data.");
    return Promise.reject({ success: false, message: "Please fill out all fields." });
  }
};
