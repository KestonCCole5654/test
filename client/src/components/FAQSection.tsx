import React from 'react';

const faqs = [
  {
    q: 'What is SheetBills?',
    a: 'SheetBills is a lightweight invoicing software that connects directly to your Google Sheets. It lets you create, manage, and store invoices while offering powerful CRUD (Create, Read, Update, Delete) operations on your invoice data — all seamlessly synced to your Google Sheets.',
  },
  {
    q: 'Do I need any special software to use SheetBills?',
    a: 'No! SheetBills runs entirely in your web browser and integrates with your Google account. All you need is internet access and a Google Sheets account.',
  },
  {
    q: 'How does SheetBills store invoice data?',
    a: 'Every invoice you create is saved directly into your connected Google Sheet. This gives you full control and visibility over your data — no hidden databases or third-party storage.',
  },
  {
    q: 'Can I generate and share invoices?',
    a: 'Yes! SheetBills allows you to generate print-ready invoices and create public invoice links you can share with clients, making it easy for them to view or download their invoice.',
  },
  {
    q: 'Can I update or delete existing invoices?',
    a: 'Absolutely. You can edit any invoice details or delete invoices you no longer need. All changes are instantly updated in your connected Google Sheet.',
  },
  {
    q: 'Is there a limit to how many invoices I can create?',
    a: 'No hard limits! As long as your Google Sheet can handle the data (Google Sheets typically supports up to 10 million cells), you can create as many invoices as you need.',
  },
  {
    q: 'Is my data safe?',
    a: 'SheetBills does not store your data on external servers. All your invoice data stays within your Google account, and we use secure API connections with your permission to manage the data.',
  },
  {
    q: 'Can I customize my invoice design?',
    a: 'Currently, SheetBills provides a clean, professional invoice template. We\'re actively working on adding customizable templates and branding options (like logos and color themes).',
  },
  {
    q: 'Do you offer support if I run into issues?',
    a: 'Yes! Our team is here to help. You can reach out via the Support section on our website or email us directly. We aim to respond within 24 hours.',
  },
  {
    q: 'What\'s coming next for SheetBills?',
    a: 'We\'re planning exciting features, including advanced analytics, tax calculations, multi-currency support, and integrations with other tools. Stay tuned!',
  },
];

const FAQSection = () => (
  <section className="py-16 md:py-24 px-4" id="faqs">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl text-[#2F303C] md:text-4xl font-normal text-center mb-12">
        Frequently Asked Questions
      </h2>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <details key={index} className="group text-[#2F303C] border-b border-gray-200 pb-4">
            <summary className="flex justify-between items-center cursor-pointer text-lg font-medium">
              <span>{faq.q}</span>
              <span className="text-green-800">+</span>
            </summary>
            <div className="mt-4 text-[#2F303C] font-sans font-medium text-lg">{faq.a}</div>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default FAQSection; 