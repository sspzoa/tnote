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

export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const cleaned = phone.replace(/[-\s]/g, "");
  const phoneRegex = /^01[0-9]{8,9}$/;
  return phoneRegex.test(cleaned);
};

export const isValidBirthYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear;
};
