"use client";
import { useAppSelector } from "@/app/store/hooks";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import maskGroup from "../../../../public/images/maskGroup.webp";
import Image from "next/image";
import wellcomeMessageImg from "../../../../public/images/wellcomeMessage.webp";
import QualityLawyers from "@/app/components/QualityLawyers";
export default function AboutSection() {
  const role = useAppSelector((state) => state.user.user?.role);
  console.log("role is about us page", role);

  const aboutTexts: Record<string, string> = {
    "Super Admin":
      "Oversee the entire platform with complete control, managing firms, users, and operations.",
    "Firm Admin":
      "Manage your firm's lawyers, clients, and cases with ease and efficiency.",
    Lawyer:
      "Deliver excellent legal services while keeping case details organized and up to date.",
    Assistant:
      "Support lawyers and administrators by managing schedules, documents, and client communication.",
  };

  return (
    <>
      <Header />
      <section className="text-[#3A3A38]">
        <div className="container">
          <div className="my-[70px] flex justify-between items-center gap-8">
            <h2 className="text-7xl font-semibold  pr-8 border-r-2 border-gray-300">
              About Us
            </h2>
            <p className="w-[700px] text-base pl-8">
              {role ? aboutTexts[role] : "Welcome to our platform."}
            </p>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="pr-8 border-r-2 border-gray-300 ">
              <p className="mb-2">About Us</p>
              <h2 className="text-5xl font-semibold">
                Helping to overcome and ease the legal burden
              </h2>
            </span>
            <Image
              className="max-w-[500px] min-h-[500px]"
              src={maskGroup}
              alt="about us mask group"
            />
          </div>
          <div className="max-w-[1000px] m-auto pt-[60px] pb-[100px]">
            <p className="text-center">
              Our platform is designed to simplify legal operations and enhance
              collaboration across firms. We provide intuitive tools for
              managing clients, cases, and team members efficiently, helping
              everyone—from administrators to lawyers—work smarter and deliver
              better results. By centralizing information and streamlining
              workflows, we make it easier to focus on what matters most:
              serving clients and achieving successful outcomes. Our commitment
              is to provide a reliable, secure, and user-friendly system that
              grows with your firm.
            </p>
          </div>
        </div>
      </section>
      {/* our partnes swiper must add */}

      <section className="text-[#3A3A38]">
        <div className="container">
          <div className="flex items-center justify-between gap-x-[50px] w-full">
            <Image
              className="min-w-[350px] min-h-[300px] object-contain"
              src={wellcomeMessageImg}
              alt="welcome image"
            />
            <span>
              <p className="mb-2">Welcome Message</p>
              <h2 className="text-5xl font-semibold">
                Hello People, Welcome To Northman
              </h2>
            </span>
          </div>

          <div className="mt-[60px] text-base leading-relaxed">
            <p className="mb-4">
              At Northman, we are dedicated to providing exceptional legal
              support and solutions for all your needs. Our platform connects
              clients with top-notch legal professionals, making it easier than
              ever to manage cases, access resources, and stay informed. We
              believe in a client- first approach to ensure efficiency,
              transparency, and trust.
            </p>
            <p>
              Our mission is to simplify the legal process and empower both
              clients and legal teams with modern tools and reliable guidance.
              Whether you are a firm, lawyer, or assistant, Northman offers a
              seamless experience designed to save time, reduce stress, and
              achieve better outcomes in every legal matter.
            </p>
          </div>
        </div>
      </section>
      <QualityLawyers />
      <Footer />
    </>
  );
}
