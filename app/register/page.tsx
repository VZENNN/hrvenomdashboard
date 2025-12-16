export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="bg-white p-8 rounded-lg shadow-md w-[380px]">
        <h1 className="text-2xl font-bold mb-1">Create HR Account</h1>
        <p className="text-gray-500 mb-6">
          Only admin can create new account
        </p>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border px-3 py-2 rounded mb-4"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2 rounded mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 rounded mb-6"
        />

        <button className="w-full bg-black text-white py-2 rounded">
          Create Account
        </button>
      </form>
    </div>
  );
}
