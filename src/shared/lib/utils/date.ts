export const getTodayKST = (): string => {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
};

export const getTodayKorean = (): string => {
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${today.getMonth() + 1}/${today.getDate()}(${days[today.getDay()]})`;
};

export const getGreetingByTime = (): string => {
  const now = new Date();
  const time = now.getHours() * 60 + now.getMinutes();

  // 오전 수업 (08:40 ~ 12:10)
  if (time >= 8 * 60 + 40 && time < 12 * 60 + 10) return "오전 수업 중이네요. 오늘도 무난하게 흘러가길 🙏";

  // 점심시간 (12:10 ~ 13:30)
  if (time >= 12 * 60 + 10 && time < 13 * 60 + 30) return "점심시간이에요. 지금 아니면 또 못 쉬어요 🍚";

  // 오후 수업 (13:30 ~ 17:00)
  if (time >= 13 * 60 + 30 && time < 17 * 60) return "오후 수업 타임… 집중력 관리가 관건이죠 😵‍💫";

  // 저녁 준비/휴식 (17:00 ~ 18:30)
  if (time >= 17 * 60 && time < 18 * 60 + 30) return "잠깐 숨 돌리는 시간이네요. 커피 한 잔 어떠세요 ☕";

  // 저녁 수업 (18:30 ~ 22:00)
  if (time >= 18 * 60 + 30 && time < 22 * 60) return "저녁 수업까지 왔네요. 여기까지 온 것도 이미 대단해요 👏";

  // 늦은 시간
  return "아직도 일 중이시네요… 오늘 하루 정말 고생 많았어요 🌙";
};
