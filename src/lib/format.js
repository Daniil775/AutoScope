// форматы
export const fixingPrice = (value) =>
  `${Number(value || 0).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ₽`;

export const formatDate = (value) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("ru-RU");
