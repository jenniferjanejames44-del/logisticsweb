import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-primary mb-3">{title}</h2>
    <div className="text-foreground/80 leading-7 space-y-3 text-[15px]">{children}</div>
  </section>
);

const Terms = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="bg-background">
        <div className="bg-primary text-white pt-[100px] pb-12 sm:pt-[112px] sm:pb-14 lg:pt-[128px] lg:pb-16">
          <div className="section-container">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">Terms and Conditions</h1>
            <p className="mt-3 text-sm sm:text-base text-white/70">RAC Logistics Ltd — Last updated: 2026</p>
          </div>
        </div>
        <article className="section-container py-12 max-w-4xl">
          <Section title="1. Introduction and Acceptance of Terms">
            <p>Welcome to the official website and digital platforms of RAC Logistics Ltd ("RAC Logistics", "we", "our", or "us"). These Terms and Conditions ("Terms") govern your access to and use of our website, applications, and all services provided by RAC Logistics (collectively, "Services"). By accessing, browsing, registering for an account, or otherwise using our website or Services, you acknowledge that you have read, understood, and agree to be legally bound by these Terms, our Privacy Policy, and any other policies or guidelines referenced herein. If you do not agree with any part of these Terms, you must immediately cease all use of our website and Services. These Terms constitute a legally binding agreement between you and RAC Logistics Ltd.</p>
          </Section>

          <Section title="2. Services Provided">
            <p>RAC Logistics provides a comprehensive range of international and domestic logistics, freight forwarding, and supply chain management services, which may include, but are not limited to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Importation of goods into Nigeria, including customs clearance facilitation.</li>
              <li>Exportation of goods from Nigeria to various international destinations.</li>
              <li>Specialized vehicle importation services (Auto Import).</li>
              <li>"Shop-for-Me" procurement services, acting as a purchasing agent on your behalf.</li>
              <li>General freight forwarding, shipping, and cargo transportation by air, sea, and land.</li>
              <li>Warehousing, consolidation, and distribution services.</li>
              <li>Logistics consulting and advisory services.</li>
            </ul>
            <p>All Services are subject to these Terms, availability, applicable international and domestic shipping regulations, customs laws, and any specific service agreements or quotes provided by RAC Logistics. The list above is illustrative and not exhaustive; RAC Logistics reserves the right to introduce, modify, or discontinue any Service at its sole discretion.</p>
          </Section>

          <Section title="3. Account Registration and Security">
            <p>To access certain features of our website and utilize our Services, you may be required to create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate, current, and complete information during registration and keep it updated.</li>
              <li>Maintain the confidentiality of your account credentials and be solely responsible for all activities under your account.</li>
              <li>Notify RAC Logistics immediately of any unauthorized use of your account or breach of security.</li>
            </ul>
            <p>RAC Logistics reserves the right to refuse registration, suspend, or terminate any account, without prior notice, if information is false or there is a breach of these Terms.</p>
          </Section>

          <Section title="4. Shipping, Delivery, and Risk of Loss">
            <p>Delivery timelines are estimates only and not guaranteed. Actual delivery times are influenced by carrier performance, customs processing, destination regulations, weather and force majeure events, accuracy of customer information, and packaging quality.</p>
            <p>RAC Logistics shall not be liable for delays, losses, or damages arising from estimated timelines not being met. Risk of loss passes to the customer upon tender to the designated carrier or upon delivery, whichever occurs first.</p>
          </Section>

          <Section title="5. Prohibited and Restricted Items">
            <p>Customers are strictly prohibited from shipping items that are illegal, dangerous, or restricted, including: illegal drugs, weapons and ammunition, hazardous materials, counterfeit goods, live animals or human remains without arrangement, pornographic materials, undeclared currency or precious metals, and any items deemed prohibited by relevant authorities.</p>
            <p>RAC Logistics may inspect any shipment without prior notice and may refuse, return, dispose of, or hand over prohibited items to authorities. The customer indemnifies RAC Logistics against any resulting fines, penalties, or legal consequences.</p>
          </Section>

          <Section title="6. Customs, Duties, and Taxes">
            <p>The customer is solely responsible for the accuracy of customs documentation and for the payment of all import duties, tariffs, taxes (including VAT), customs fees, storage charges, and any other charges levied by customs or governmental bodies. RAC Logistics may assist as a courtesy but does not guarantee customs clearance.</p>
          </Section>

          <Section title="7. Payments and Financial Obligations">
            <p>Payment for Services may be required in full before shipment processing or delivery. All prices are subject to change without notice. In the event of non-payment, RAC Logistics may suspend Services, exercise a general lien on goods, charge interest at 1.5% per month (or the maximum rate permitted by law), recover collection costs, and dispose of goods subject to lien after reasonable notice.</p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>RAC Logistics acts as a freight forwarder and logistics provider, not as a common carrier. Our liability for loss, damage, or delay is strictly limited.</p>
            <p>RAC Logistics shall not be liable for indirect, incidental, special, consequential, punitive, or exemplary damages, including lost profits or business interruption. Maximum aggregate liability is limited to the lesser of the declared value, actual value of the goods at time of shipment, or USD 100.00 per shipment unless otherwise agreed in writing.</p>
          </Section>

          <Section title="9. User Conduct">
            <p>You agree not to use the Services for any unlawful purpose, to infringe intellectual property rights, to upload harmful content, to engage in data scraping, to reverse engineer the platform, to introduce malicious software, or to impersonate any person or entity.</p>
          </Section>

          <Section title="10. Intellectual Property Rights">
            <p>All content on the RAC Logistics website—including text, graphics, logos, icons, images, software, and compilations—is the exclusive property of RAC Logistics Ltd or its licensors and is protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable license to access the Services for personal and business use.</p>
          </Section>

          <Section title="11. Changes to Terms and Policies">
            <p>RAC Logistics may update these Terms at any time. Changes are effective upon posting. Your continued use of the Services constitutes acceptance of the revised Terms.</p>
          </Section>

          <Section title="12. Governing Law and Jurisdiction">
            <p>These Terms are governed by the laws of the Federal Republic of Nigeria. The courts of the Federal Republic of Nigeria shall have exclusive jurisdiction over any dispute arising from these Terms.</p>
          </Section>

          <Section title="13. Indemnification">
            <p>You agree to indemnify and hold harmless RAC Logistics Ltd, its affiliates, officers, and employees from any claims, damages, losses, or expenses arising from your violation of these Terms, your use of the Services, shipment of prohibited items, or your negligence or willful misconduct.</p>
          </Section>

          <Section title="14. Force Majeure">
            <p>RAC Logistics shall not be liable for any failure or delay caused by circumstances beyond its reasonable control, including acts of God, war, terrorism, riots, fire, floods, pandemics, strikes, or shortages of fuel, energy, labor, or materials.</p>
          </Section>

          <Section title="15. Severability">
            <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
          </Section>

          <Section title="16. Disclaimer of Warranties">
            <p>The Services are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. RAC Logistics disclaims all warranties of merchantability, non-infringement, and fitness for a particular purpose.</p>
          </Section>

          <Section title="17. Dispute Resolution">
            <p>Parties agree to first attempt amicable resolution through good-faith negotiations. If unresolved within thirty (30) days, parties may consider mediation before pursuing legal remedies in the courts of the Federal Republic of Nigeria.</p>
          </Section>

          <Section title="18. Contact Information">
            <p>For any questions or notices regarding these Terms, please contact us at <a href="mailto:info@raclogistic.com" className="text-accent font-semibold">info@raclogistic.com</a>.</p>
          </Section>
        </article>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Terms;