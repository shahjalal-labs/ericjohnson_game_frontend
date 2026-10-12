"use client";

import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="">
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 360px)" }}> {children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
