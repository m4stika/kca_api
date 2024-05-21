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

export class UserValidation {
  static readonly REGISTER = z.object({
    username: z.string().max(50).min(1),
    password: z.string().max(50).min(1),
    name: z.string().max(100).min(1),
    email: z.string().max(50).min(1),
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
  email: string;
  name: string;
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
