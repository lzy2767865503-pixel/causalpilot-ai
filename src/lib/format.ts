export const formatPValue = (value: number) => {
  if (!Number.isFinite(value)) return "—";
  if (value < 0.001) return "< 0.001";
  return value.toFixed(3);
};

export const formatSigned = (value: number, digits = 1) => {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}`;
};

export const formatInteger = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const truncateHash = (value: string, visible = 14) => {
  if (value.length <= visible * 2 + 1) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
};
