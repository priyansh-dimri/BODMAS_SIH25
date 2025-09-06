import apiClient from "./client";

const pairDeviceWithQrCode = (qrCodeData) => {
  return apiClient.post("/auth/pair", { qrCodeData });
};

const requestOtp = (mobileNumber) => {
  return apiClient.post("/auth/otp/request", { mobileNumber });
};

const verifyOtp = (mobileNumber, otp) => {
  return apiClient.post("/auth/otp/verify", { mobileNumber, otp });
};

export const authApi = {
  pairDeviceWithQrCode,
  requestOtp,
  verifyOtp,
};
