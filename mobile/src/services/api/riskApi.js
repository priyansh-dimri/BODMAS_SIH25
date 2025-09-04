import apiClient from "./client";

const getRiskHeatmap = ({ latitude, longitude, radius }) => {
  return apiClient.get("/risk/heatmap", {
    params: { latitude, longitude, radius },
  });
};

export const riskApi = {
  getRiskHeatmap,
};
