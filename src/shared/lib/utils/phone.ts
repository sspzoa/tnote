export const removePhoneHyphens = (phone: string): string => {
  return phone.replace(/-/g, "");
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  const cleaned = phone.replace(/-/g, "");
  const numbers = cleaned.replace(/\D/g, "");

  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }
  if (numbers.length === 10) {
    if (numbers.startsWith("02")) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  }

  return phone;
};
