import Link from "next/link";
export default function QualityLawyers() {
  return (
    <>
      <section className="bg-[#1E2E45] my-[150px]">
        <div className="container">
          <div className="text-center py-[45px]  text-[#FFFFFF]">
            <h2 className="text-[45px] font-semibold">
              We Help You With Quality Legal Lawyer
            </h2>
            <p className="text-sm mt-[20px]">
              Our platform simplifies the way law firms operate by centralizing
              client records, case management, scheduling, and billing in one
              secure space. Designed for both solo lawyers and large firms, it
              helps you stay organized, save time, and focus on delivering
              exceptional legal services to your clients.
            </p>
            <Link
              href=""
              className="py-[10px] px-[64px] bg-[#9A9162] hover:bg-[#857c54] mt-[50px] inline-block rounded-md font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
      ;
    </>
  );
}
