import apiClient from "./client";

const sendSosAlert = (sosData) => {
  return apiClient.post("/events/sos", sosData);
};

export const eventApi = {
  sendSosAlert,
};
