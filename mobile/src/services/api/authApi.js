import apiClient from "./client";

const pairDeviceWithQrCode = (qrCodeData) => {
  return apiClient.post("/auth/pair", { qrCodeData });
};

const verifyPin = (pin) => {
  return apiClient.post("/auth/verify-pin", { pin });
};

export const authApi = {
  pairDeviceWithQrCode,
  verifyPin,
};
