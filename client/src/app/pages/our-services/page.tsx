"use client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useAppSelector } from "@/app/store/hooks";
export default function OurServices() {
  const role = useAppSelector((state) => state.user.user?.role);

  const serviceText: Record<string, string> = {
    "Super Admin":
      "As a Super Admin, you hold full oversight and control over the entire platform. Manage multiple law firms, monitor performance, ensure data security, and maintain compliance across the system. Your role is pivotal in configuring platform settings, assigning roles, and ensuring smooth collaboration between firms and their teams.",

    "Firm Admin":
      "As a Firm Admin, you are responsible for managing your firm's lawyers, assistants, and clients. Oversee case assignments, track progress, and ensure that your firm delivers high-quality legal services. From scheduling to document management, you have the tools to maintain operational efficiency and client satisfaction.",

    Lawyer:
      "As a Lawyer, you focus on delivering top-notch legal services while the platform keeps your cases organized. Easily access case files, manage deadlines, collaborate with your team, and communicate effectively with clients—all in one secure environment designed to support your legal expertise.",

    Assistant:
      "As an Assistant, you play a vital role in supporting lawyers and administrators. Manage schedules, prepare documents, and handle client communication to ensure that the legal team operates efficiently. Your work keeps the firm's operations smooth and clients well-informed.",
  };
  return (
    <>
      <Header />
      <section className="text-[#3A3A38]">
        <div className="container">
          <div className="my-[70px] flex justify-between items-center gap-8">
            <h2 className="text-7xl font-semibold  pr-8 border-r-2 border-gray-300">
              Services
            </h2>
            <p className="w-[700px] text-base pl-8">
              {role ? serviceText[role] : "Welcome to our platform."}
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
