import { z } from "zod";

// 로그인 스키마
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type SignInInput = z.infer<typeof signInSchema>;

// 회원가입 스키마
export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  // confirmPassword는 클라이언트 폼에서만 필요할 수 있으니, 필요시 추가
  // confirmPassword: z.string().min(8),
});
export type SignUpInput = z.infer<typeof signUpSchema>;
