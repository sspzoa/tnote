interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

export const validatePassword = (password: string): PasswordValidationResult => {
  if (password.length < 8) {
    return { valid: false, error: "비밀번호는 최소 8자 이상이어야 합니다." };
  }

  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, error: "비밀번호에 영문자를 포함해야 합니다." };
  }

  if (!/\d/.test(password)) {
    return { valid: false, error: "비밀번호에 숫자를 포함해야 합니다." };
  }

  return { valid: true };
};
