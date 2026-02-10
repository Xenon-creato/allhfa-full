export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-200">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-6">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-zinc-400 leading-relaxed">

          <p>
            This Privacy Policy explains how we collect, use, and protect your
            personal information when you use this website and its services.
          </p>

          <p>
            We collect only the information necessary to operate the platform.
            This may include account information such as email address or user ID,
            authentication data, usage data related to generated content, and
            technical information required for payment processing.
          </p>

          <p>
            Payments are processed by third-party providers, including LemonSquezzy,
            acting as Merchant of Record. We do not store full payment details such
            as credit card numbers on our servers.
          </p>

          <p>
            Personal data is used solely to provide and improve the service,
            process payments, prevent fraud, comply with legal obligations, and
            ensure platform security.
          </p>

          <p>
            We do not sell or rent personal data. Information may be shared only
            with trusted third-party service providers strictly as required for
            platform functionality (such as hosting, analytics, authentication,
            and payment processing).
          </p>

          <p>
            We take reasonable technical and organizational measures to protect
            user data against unauthorized access, loss, or misuse.
          </p>

          <p>
            You have the right to request access to, correction of, or deletion
            of your personal data, subject to applicable legal requirements.
          </p>

          <p>
            This Privacy Policy may be updated from time to time. Continued use of
            the service after changes are made constitutes acceptance of the
            updated policy.
          </p>

          <p>
            If you have any questions regarding this Privacy Policy or how your
            data is handled, please contact us via the information provided on
            this website.
          </p>

        </div>
      </div>
    </main>
  );
}
