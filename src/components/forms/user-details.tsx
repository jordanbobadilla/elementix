"use client";

import {
  AuthUserWithAgencySidebarOptionsAndSubAccounts,
  UserWithPermissionsAndSubAccounts,
} from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { SubAccount, User } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import {
  changeUserPermissions,
  getAuthUserDetails,
  getUserPermissions,
  saveActivityLogsNotification,
  updateUser,
} from "@/lib/queries";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import FileUpload from "../global/file-upload";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import Loading from "../global/loading";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { da } from "date-fns/locale";
import { v4 } from "uuid";

type Props = {
  id: string | null;
  type: "agency" | "subaccount";
  userData?: Partial<User>;
  subAccounts?: SubAccount[];
};

const UserDetails = ({ id, type, userData, subAccounts }: Props) => {
  const [subAccountPermissions, setSubAccountPermissions] =
    useState<UserWithPermissionsAndSubAccounts>(null);
  const { data, setClose } = useModal();
  const [roleState, setRoleState] = useState("");
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [authUserData, setAuthUserData] =
    useState<AuthUserWithAgencySidebarOptionsAndSubAccounts>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (data.user) {
      const fetchDetails = async () => {
        const response = await getAuthUserDetails();
        if (response) setAuthUserData(response);
      };
      fetchDetails();
    }
  }, [data]);

  const userDataSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    avatarUrl: z.string(),
    role: z.enum([
      "AGENCY_OWNER",
      "AGENCY_ADMIN",
      "SUBACCOUNT_USER",
      "SUBACCOUNT_GUEST",
    ]),
  });

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: "onChange",
    defaultValues: {
      name: userData ? userData.name : data?.user?.name,
      email: userData ? userData.email : data?.user?.email,
      avatarUrl: userData ? userData.avatarUrl : data?.user?.avatarUrl,
      role: userData ? userData.role : data?.user?.role,
    },
  });

  useEffect(() => {
    if (!data.user) return;
    const getPermissions = async () => {
      if (!data.user) return;
      const permission = await getUserPermissions(data.user.id);
      setSubAccountPermissions(permission);
    };
    getPermissions();
  }, [data, form]);

  useEffect(() => {
    if (data.user) {
      form.reset(data.user);
    }
    if (userData) {
      form.reset(userData);
    }
  }, [userData, data, form]);

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    if (!id) return;
    if (userData || data?.user) {
      const updatedUser = await updateUser(values);
      authUserData?.Agency?.SubAccounts.filter((subAccount) =>
        authUserData.Permissions.find(
          (permission) =>
            permission.subAccountId === subAccount.id && permission.access
        )
      ).forEach(async (subAccount) => {
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Updated ${userData?.name} information`,
          subaccountId: subAccount.id,
        });
      });

      if (updatedUser) {
        toast({
          title: "Success",
          description: "Update User Information",
        });
        setClose();
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Oppse!",
          description: "Could not update user information",
        });
      }
    } else {
      console.log("Error could not submit");
    }
  };

  const onChangePermission = async (
    subAccountId: string,
    value: boolean,
    permissionId: string | undefined
  ) => {
    if (!data.user?.email) {
      return;
    }

    setLoadingPermissions(true);

    const response = await changeUserPermissions(
      permissionId ? permissionId : v4(),
      data.user.email,
      subAccountId,
      value
    );

    if (type === "agency") {
      await saveActivityLogsNotification({
        agencyId: authUserData?.Agency?.id,
        description: `Gave ${userData?.name} access to | ${
          subAccountPermissions?.Permissions.find(
            (p) => p.subAccountId === subAccountId
          )?.SubAccount.name
        } `,
        subaccountId: subAccountPermissions?.Permissions.find(
          (p) => p.subAccountId === subAccountId
        )?.SubAccount.id,
      });
    }

    if (response) {
      toast({
        title: "Success",
        description: "The request was successfull",
      });
      if (subAccountPermissions) {
        subAccountPermissions.Permissions.find((permission) => {
          if (permission.subAccountId === subAccountId) {
            return { ...permission, access: !permission.access };
          }
          return permission;
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Failed",
        description: "Could not update permissions",
      });
    }
    router.refresh();
    setLoadingPermissions(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>Add or update your information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile picture</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="avatar"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User full name</FormLabel>
                  <FormControl>
                    <Input required placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={
                        userData?.role === "AGENCY_OWNER" ||
                        form.formState.isSubmitting
                      }
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User Role</FormLabel>
                  <Select
                    disabled={field.value === "AGENCY_OWNER"}
                    onValueChange={(value) => {
                      if (
                        value === "SUBACCOUNT_GUEST" ||
                        value === "SUBACCOUNT_USER"
                      ) {
                        setRoleState(
                          "You need to have sub accounts permissions to assign Subaccount access to team members."
                        );
                      } else {
                        setRoleState("");
                      }
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                      {(data?.user?.role === "AGENCY_OWNER" ||
                        userData?.role === "AGENCY_OWNER") && (
                        <SelectItem value="AGENCY_OWNER">
                          Agency Owner
                        </SelectItem>
                      )}
                      <SelectItem value="SUBACCOUNT_USER">
                        Sub Account User
                      </SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">
                        Sub Account Guest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground">{roleState}</p>
                </FormItem>
              )}
            />
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Loading /> : "Save User Details"}
            </Button>
            {authUserData?.role === "AGENCY_OWNER" && (
              <div>
                <Separator className="my-4" />
                <FormLabel>User Permissions</FormLabel>
                <FormDescription className="mb-4">
                  You can give Sub Account access to team members by turning on
                  access control for each Sub Account. This is only visible to
                  agency owners
                </FormDescription>
                <div className="flex flex-col gap-4">
                  {subAccounts?.map((subaccount) => {
                    const subAccountPermissionsDetails =
                      subAccountPermissions?.Permissions.find(
                        (permission) =>
                          permission.subAccountId === subaccount.id
                      );
                    return (
                      <div
                        key={subaccount.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p>{subaccount.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermissions}
                          checked={subAccountPermissionsDetails?.access}
                          onCheckedChange={(permission) =>
                            onChangePermission(
                              subaccount.id,
                              permission,
                              subAccountPermissionsDetails?.id
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
