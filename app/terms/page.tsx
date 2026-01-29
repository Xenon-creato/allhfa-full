export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-200">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-6">
          Terms of Service
        </h1>

        <div className="space-y-4 text-zinc-400 leading-relaxed">
          <p>
            By using this website, you agree to these Terms of Service. If you
            do not agree with them, please do not use the platform.
          </p>

          <p>
            The service provides AI-based image generation through a credit
            system. Credits are consumed when generating images.
          </p>

          <p>
            Payments are processed by third-party providers. All purchases
            are final and non-refundable.
          </p>

          <p>
            You are responsible for how you use generated content and agree
            not to use the service for illegal or harmful purposes.
          </p>
        </div>
      </div>
    </main>
  );
}
