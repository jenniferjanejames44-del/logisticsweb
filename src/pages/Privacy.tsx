import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LiveChat from "@/components/LiveChat";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-primary mb-3">{title}</h2>
    <div className="text-foreground/80 leading-7 space-y-3 text-[15px]">{children}</div>
  </section>
);

const Privacy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="bg-background">
        <div className="bg-primary text-white py-16">
          <div className="section-container">
            <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
            <p className="mt-3 text-white/70">RAC Logistics Ltd — Last updated: 2026</p>
          </div>
        </div>
        <article className="section-container py-12 max-w-4xl">
          <Section title="1. Introduction and Commitment to Privacy">
            <p>RAC Logistics Ltd ("RAC Logistics", "we", "our", or "us") is deeply committed to protecting the privacy and security of your personal information. This Privacy Policy outlines how we collect, use, process, store, and disclose your personal information when you access or use our website, applications, and Services. We comply with applicable data protection laws in the Federal Republic of Nigeria and international best practices. By using our Services, you consent to the data practices described in this policy.</p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong>a. Information You Provide Directly:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Identity Data:</strong> Name, title, date of birth, gender.</li>
              <li><strong>Contact Data:</strong> Email, postal, shipping, billing addresses, telephone numbers.</li>
              <li><strong>Account Data:</strong> Username, password, security questions and answers.</li>
              <li><strong>Financial Data:</strong> Bank details, payment card details (processed securely by third-party processors), billing history.</li>
              <li><strong>Shipment Data:</strong> Goods description, value, weight, dimensions, sender/recipient info, customs declarations, tracking info.</li>
              <li><strong>Communication Data:</strong> Content of communications with us.</li>
              <li><strong>Shop-for-Me Data:</strong> Product preferences, purchase requests, vendor details.</li>
            </ul>
            <p><strong>b. Information Collected Automatically:</strong> IP address, browser type, time zone, operating system, usage data, and cookie data.</p>
            <p><strong>c. Information from Third Parties:</strong> Information from shipping carriers, customs brokers, payment processors, and analytics providers.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>To Provide and Manage Services:</strong> Processing shipments, customs clearance, account management, payments, and Shop-for-Me purchases.</li>
              <li><strong>To Improve and Personalize Services:</strong> Analyzing usage patterns and developing new features.</li>
              <li><strong>For Communication:</strong> Service updates, tracking notifications, and (with consent) marketing communications.</li>
              <li><strong>For Security and Fraud Prevention:</strong> Detecting and preventing fraudulent activities.</li>
              <li><strong>To Comply with Legal Obligations:</strong> Customs, tax, AML, and other applicable laws.</li>
              <li><strong>For Business Operations:</strong> Internal record-keeping, auditing, and enforcing our Terms.</li>
            </ul>
          </Section>

          <Section title="4. Data Sharing and Disclosure">
            <p>We do not sell your personal data. We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Service Providers:</strong> Shipping carriers, customs brokers, warehousing partners, payment processors, IT services, and marketing agencies.</li>
              <li><strong>Customs and Regulatory Authorities:</strong> As required by law for clearance and compliance.</li>
              <li><strong>Legal Compliance:</strong> When required by law, court order, or to protect our rights.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.</li>
              <li><strong>Affiliates:</strong> For business and operational purposes.</li>
              <li><strong>International Data Transfers:</strong> With appropriate safeguards in place.</li>
            </ul>
          </Section>

          <Section title="5. Data Security">
            <p>We implement robust technical and organizational measures including SSL/TLS encryption, access controls, firewalls, intrusion detection systems, regular security audits, and data minimization. While we strive to protect your information, no method of transmission over the internet is 100% secure.</p>
          </Section>

          <Section title="6. Cookies and Tracking Technologies">
            <p>Our website uses cookies and similar tracking technologies to enhance your experience and analyze performance. We use strictly necessary, analytical/performance, functionality, and targeting/advertising cookies. You can modify your browser settings to decline cookies, though this may affect website functionality.</p>
          </Section>

          <Section title="7. Data Retention">
            <p>We retain personal information only for as long as necessary to fulfill the purposes for which it was collected, or as required by legal, accounting, or reporting obligations. Upon expiry, data is securely deleted, anonymized, or aggregated.</p>
          </Section>

          <Section title="8. Your Data Protection Rights">
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Right to Access:</strong> Request a copy of your personal data.</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate data.</li>
              <li><strong>Right to Erasure:</strong> Request deletion under certain circumstances.</li>
              <li><strong>Right to Restriction of Processing.</strong></li>
              <li><strong>Right to Object to Processing,</strong> particularly for direct marketing.</li>
              <li><strong>Right to Data Portability.</strong></li>
              <li><strong>Right to Withdraw Consent</strong> at any time.</li>
              <li><strong>Right to Lodge a Complaint</strong> with the relevant data protection authority.</li>
            </ul>
          </Section>

          <Section title="9. Third-Party Links">
            <p>Our website may contain links to external sites. We have no control over, and assume no responsibility for, the content or privacy practices of third-party sites.</p>
          </Section>

          <Section title="10. Policy Updates">
            <p>This Privacy Policy may be updated periodically. Changes are effective upon posting on our website. Continued use of our Services after changes constitutes acceptance of the revised policy.</p>
          </Section>

          <Section title="11. Contact Information">
            <p>For any questions or to exercise your data protection rights, please contact our Data Protection team at <a href="mailto:info@raclogistic.com" className="text-accent font-semibold">info@raclogistic.com</a>.</p>
          </Section>
        </article>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Privacy;