import "next-auth";

declare module "next-auth" {
  interface User {
    workspaceId?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      workspaceId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    workspaceId: string;
  }
}
