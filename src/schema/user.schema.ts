import { Request } from 'express';
import { z } from 'zod';
import { Merge } from './helpers/merge.helper';

export interface AuthenticatedRequest extends Request {
  user?: UserResponse | null;
  cookies: {
    accessToken?: string;
    refreshToken?: string;
    authorized?: boolean;
    activeUser?: UserResponse;
  };
}
/*
export type UserRegisterRequest {
  username: string;
  password: string;
  email: string;
  name: string;
}

export type UserLoginRequest {
  username: string;
  password: string;
}
 */
const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);
export class UserValidation {
  static readonly REGISTER = z.object({
    username: z.string().max(50).min(3),
    password: z.string().max(50).min(6),
    // name: z.string().max(100).min(1),
    // email: z.string().max(50).min(1),
    memberId: z.string().max(50).min(4),
    NIK: z.string().max(30).min(9),
    phone: z.string().max(30).min(10).regex(phoneRegex, "invalid phone format")
  });

  static readonly LOGIN = z.object({
    username: z.string().max(50).min(1),
    password: z.string().max(50).min(1),
  });
}

export type UserRegisterRequest = z.infer<typeof UserValidation.REGISTER>;
export type UserLoginRequest = z.infer<typeof UserValidation.LOGIN>;
export type UserResponse = {
  username: string;
  memberId: string;
  NIK: string;
  phone: string;
  email?: string | null;
  name?: string | null;
  session: TSession;
  // Roles: Role[];
};
export type UserResponseJwt = Merge<
  UserResponse,
  {
    iat: number;
    exp: number;
  }
>;
export type UserWithToken = Merge<
  UserResponse,
  {
    accessToken?: string;
    refreshToken?: string;
  }
>;

export type TSession = {
  id: string;
  valid: boolean;
  // userAgent: string;
  username: string;
};
