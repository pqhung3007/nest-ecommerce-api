export type JwtPayload = {
  sub: string;
  email: string;
  workspaceId: string;
  type: 'access';
};
