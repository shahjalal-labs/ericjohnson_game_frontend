"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import ReduxProvider from "@/redux/Provider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ReduxProvider>{children}</ReduxProvider>
    </SessionProvider>
  );
};

export default Providers;