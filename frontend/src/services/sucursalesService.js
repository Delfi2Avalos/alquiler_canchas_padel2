import api from "../api";

export const getSucursales = async () => {
  const res = await api.get("/sucursales");
  return res.data;
};
