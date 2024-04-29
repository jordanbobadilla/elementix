import { getAuthUserDetails } from "@/lib/queries";
import React from "react";
import MenuOptions from "./menu-options";

type Props = {
  id: string;
  type: "agency" | "subaccount";
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();
  if (!user) {
    return null;
  }

  if (!user.Agency) {
    return;
  }

  const details =
    type === "agency"
      ? user?.Agency
      : user?.Agency.SubAccounts.find((subaccount) => subaccount.id === id);
  const isWhiteLabeledAgency = user.Agency.whiteLabel;
  if (!details) {
    return;
  }

  let sideBarLogo = user.Agency.agencyLogo || "/assets/elementix-logo.svg";

  if (!isWhiteLabeledAgency) {
    if (type === "subaccount") {
      sideBarLogo =
        user?.Agency.SubAccounts.find((subaccount) => subaccount.id === id)
          ?.subAccountLogo || user.Agency.agencyLogo;
    }
  }

  const sideBarOptions =
    type === "agency"
      ? user.Agency.SidebarOptions || []
      : user.Agency.SubAccounts.find((subaccount) => subaccount.id === id)
          ?.SidebarOptions || [];

  const subaccounts = user.Agency.SubAccounts.filter((subaccount) =>
    user.Permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access
    )
  );

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOptions={sideBarOptions}
        user={user}
        subAccounts={subaccounts}
      />
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOptions={sideBarOptions}
        user={user}
        subAccounts={subaccounts}
      />
    </>
  );
};

export default Sidebar;
