'use client';

import React from 'react';
import { useUser } from '@gitroom/frontend/components/layout/user.context';

// The only identity signal in the reduced settings page was the logout button,
// so there was no way to tell which account you were signed in as — awkward with
// the throwaway QA logins in circulation. Read-only: changing the email is not
// something this build supports.
const AccountComponent = () => {
  const user = useUser();

  if (!user?.email) {
    return null;
  }

  return (
    <div className="my-[16px] mt-[16px] bg-surface border border-line rounded-card p-[20px] flex flex-col gap-[8px]">
      <div className="mt-[4px] text-ink">Account</div>
      <div className="text-inkSecondary">{user.email}</div>
    </div>
  );
};

export default AccountComponent;
