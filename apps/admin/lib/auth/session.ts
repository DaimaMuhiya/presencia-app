import type { ApiUserPublic } from "@/types/api/user";

export type BrowserSessionView = {
  user: ApiUserPublic;
};

export type LoginChallengeView = {
  challenge_id: string;
};

export type OtpVerifySuccessView = {
  user: ApiUserPublic;
  expiresIn: number;
};