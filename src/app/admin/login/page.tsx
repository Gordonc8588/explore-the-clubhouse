"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, Lock, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/admin");
        router.refresh(); // Refresh to pick up the new cookie
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Title Area */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold text-bark">
            Admin Login
          </h1>
          <p className="mt-2 font-body text-stone">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)] sm:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="font-body text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block font-body text-sm font-medium text-stone"
              >
                Email address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-pebble" />
                </div>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  {...register("email")}
                  className={`block w-full rounded-lg border bg-white py-3 pl-12 pr-4 font-body text-bark placeholder:text-pebble focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30 ${
                    errors.email ? "border-red-500" : "border-stone/30"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 font-body text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block font-body text-sm font-medium text-stone"
              >
                Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-pebble" />
                </div>
                <input
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  {...register("password")}
                  className={`block w-full rounded-lg border bg-white py-3 pl-12 pr-4 font-body text-bark placeholder:text-pebble focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30 ${
                    errors.password ? "border-red-500" : "border-stone/30"
                  }`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 font-body text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-forest px-6 py-3 font-display font-semibold text-white transition-colors hover:bg-meadow focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center font-body text-sm text-stone">
          <a
            href="/"
            className="font-medium text-forest transition-colors hover:text-meadow"
          >
            Back to main site
          </a>
        </p>
      </div>
    </div>
  );
}
