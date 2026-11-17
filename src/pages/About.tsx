import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";

const POINTS = [
  { title: "Free for students", body: "No subscription and no payment details. Create an account and you're in." },
  { title: "Verified students only", body: "Every member confirms they're a student, so offers stay meant for students." },
  { title: "More than discounts", body: "Deals on everyday spending, plus experiences, perks and events to share with friends." },
];

/** About StudentX, with how it works below. */
const About = () => (
  <div className="flex min-h-screen w-full flex-col items-center bg-white">
    <Header />

    <div className="w-full bg-linear-to-r from-blue-900 to-black pb-14 pt-28 text-white">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <Badge className="mb-4 bg-indigo-900 hover:bg-indigo-900">About StudentX</Badge>
        <h1 className="text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">Made for student life</h1>
        <p className="mt-5 text-lg leading-relaxed text-blue-100">
          StudentX brings students the best of their city: discounts from brands they already use, experiences worth
          leaving the hostel for, and perks that make a student budget go further. All in one place, all for students.
        </p>
      </div>
    </div>

    <main className="w-full flex-grow">
      <section className="container mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {POINTS.map((point) => (
            <div key={point.title} className="rounded-[22px] border border-[#ead8e0] bg-white p-6">
              <h2 className="text-lg font-extrabold tracking-[-0.02em] text-text-primary">{point.title}</h2>
              <p className="mt-2 leading-relaxed text-text-secondary">{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      <HowItWorks />
    </main>

    <Footer />
  </div>
);

export default About;
