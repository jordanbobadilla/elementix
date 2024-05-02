import AgencyDetails from "@/components/forms/agency-details";
import UserDetails from "@/components/forms/user-details";
import { db } from "@/lib/db";
import { getAgencyDetails } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

type Props = {
  params: { agencyId: string };
};

const SettingsPage = async ({ params }: Props) => {
  const authUser = await currentUser();

  const userDetails = await db.user.findUnique({
    where: {
      email: authUser?.emailAddresses[0].emailAddress,
    },
  });

  if (!userDetails) return null;
  const agencyDetails = await getAgencyDetails(params.agencyId)

  if (!agencyDetails) return null;
  const subAccounts = agencyDetails.SubAccounts

  return (
    <div className="flex lg:!flex-row flex-col gap-4">
      <AgencyDetails data={agencyDetails} />
      <UserDetails type="agency" id={params.agencyId} subAccounts={subAccounts} userData={userDetails}/>
    </div>
  );
};

export default SettingsPage;
