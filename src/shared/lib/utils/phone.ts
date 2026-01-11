/**
 * 전화번호에서 하이픈을 제거합니다.
 * @param phone - 포맷된 전화번호 (예: 010-1234-5678)
 * @returns 하이픈이 제거된 전화번호 (예: 01012345678)
 */
export const removePhoneHyphens = (phone: string): string => {
  return phone.replace(/-/g, "");
};

/**
 * 전화번호를 포맷팅합니다.
 * @param phone - 하이픈이 없는 전화번호 (예: 01012345678)
 * @returns 포맷된 전화번호 (예: 010-1234-5678)
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  // 하이픈 제거
  const cleaned = phone.replace(/-/g, "");

  // 숫자만 추출
  const numbers = cleaned.replace(/\D/g, "");

  // 길이에 따라 포맷팅
  if (numbers.length === 11) {
    // 010-1234-5678
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }
  if (numbers.length === 10) {
    // 02-1234-5678 또는 031-123-4567
    if (numbers.startsWith("02")) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  }

  // 기본값: 원본 반환
  return phone;
};
