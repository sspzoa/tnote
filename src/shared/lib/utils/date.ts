export const getTodayKST = (): string => {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
};

export const getTodayKorean = (): string => {
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${today.getMonth() + 1}/${today.getDate()}(${days[today.getDay()]})`;
};
