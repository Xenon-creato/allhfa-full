export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-200">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-6">
          Privacy Policy
        </h1>

        <div className="space-y-4 text-zinc-400 leading-relaxed">
          <p>
            We collect only the data necessary to provide and improve the
            service. This may include account identifiers, usage data, and
            payment-related technical information.
          </p>

          <p>
            We do not sell personal data. Information is shared only with
            trusted service providers when required for platform
            functionality.
          </p>

          <p>
            We take reasonable measures to protect user data and maintain
            platform security.
          </p>
        </div>
      </div>
    </main>
  );
}
