import { SignUp } from '@clerk/nextjs';

export const metadata = {
  title: 'Sign Up - CSMS',
  description: 'Create your CSMS account'
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-gray-100 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
        {/* Left Branding Panel */}
        <div className="hidden lg:flex flex-col gap-8 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-3 rounded-2xl shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 leading-none">CSMS</h1>
              <p className="text-xs font-semibold tracking-wider uppercase text-gray-500">Supply Platform</p>
            </div>
          </div>
          <h2 className="text-4xl font-black text-gray-900 leading-tight">Create Account</h2>
          <p className="text-gray-600 text-lg font-medium leading-relaxed">
            Join the platform for a smarter, faster, and more transparent construction material supply workflow.
          </p>
          <ul className="space-y-3 text-sm font-medium text-gray-600">
            <li className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-700 font-bold flex items-center justify-center text-xs">✓</span> 
              Secure authentication with Clerk
            </li>
            <li className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-700 font-bold flex items-center justify-center text-xs">✓</span> 
              Access order tracking & analytics
            </li>
            <li className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-700 font-bold flex items-center justify-center text-xs">✓</span> 
              Real-time inventory management
            </li>
          </ul>
        </div>

        {/* Right - Clerk Sign Up */}
        <div className="flex items-center justify-center">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-white shadow-xl rounded-3xl border border-gray-100",
                headerTitle: "text-3xl font-black text-gray-900",
                headerSubtitle: "text-gray-600 font-medium",
                socialButtonsBlockButton: "border-2 border-gray-200 hover:border-blue-500 rounded-2xl font-semibold",
                formButtonPrimary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl font-bold py-4",
                formFieldInput: "border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20",
                footerActionLink: "text-blue-600 font-semibold hover:underline"
              }
            }}
            routing="path"
            path="/signup"
            signInUrl="/login"
            afterSignUpUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
