import { Notification, Prisma, Role } from "@prisma/client";
import { getAuthUserDetails, getMedia, getUserPermissions, getUsersWithAgencySubAccountsPermissionsAndSidebarOptions } from "./queries";

export type NotificationWithUser =
  | ({
      User: {
        id: string;
        name: string;
        avatarUrl: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        role: Role;
        agencyId: string | null;
      };
    } & Notification)[]
  | undefined;

export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<
  typeof getUserPermissions
>;

export type AuthUserWithAgencySidebarOptionsAndSubAccounts = Prisma.PromiseReturnType<
  typeof getAuthUserDetails
>

export type UsersWithAgencySubAccountPermissionsAndSidebarOptions = Prisma.PromiseReturnType<
  typeof getUsersWithAgencySubAccountsPermissionsAndSidebarOptions
>

export type GetMediaFiles = Prisma.PromiseReturnType<
    typeof getMedia
>

export type CreateMediaType = Prisma.MediaCreateWithoutSubaccountInput
