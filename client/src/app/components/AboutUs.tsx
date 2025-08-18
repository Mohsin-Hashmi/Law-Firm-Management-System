import Image from "next/image";
import maskGroup from "../../../public/images/maskGroup.webp";
export default function AboutUs() {
  return (
    <>
      <section className="text-[#3A3A38]">
        <div className="container">
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
    </>
  );
}
