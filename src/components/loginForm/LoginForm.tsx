/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSignInMutation } from "@/redux/api/auth/authApi";
import { setUser } from "@/redux/features/user/userSlice"; // ← Correct path
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import * as z from "zod";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

// ================== ZOD SCHEMA ==================
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

// ================== INPUT COMPONENT ==================
type InputProps = {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  showToggle?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

const InputField = ({
  id,
  label,
  type = "text",
  placeholder,
  error,
  icon,
  showToggle,
  ...rest
}: InputProps) => {
  const [show, setShow] = useState(false);

  const inputType =
    showToggle && type === "password" ? (show ? "text" : "password") : type;

  return (
    <div className="w-full space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}

        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2.5 rounded-lg border outline-none transition-all bg-white
            ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}
            focus:ring-2 focus:border-transparent`}
          {...rest}
        />

        {showToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

// ================== MAIN SIGN IN COMPONENT ==================
export default function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [signIn, { isLoading }] = useSignInMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const onSubmit = async (data: FormValues) => {
    try {
      const response = await signIn(data).unwrap();

      console.log("Login Response:", response);

      // Dispatch to Redux
      dispatch(
        setUser({
          user: response.result.user,
          token: response.result.token,
        }),
      );

      Cookies.set("accessToken", response.result.token);

      toast.success("Login successful! Welcome back.");
      router.push("/");
    } catch (error: any) {
      toast.error(error?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className=" flex items-center justify-center px-4 bg-[url('/p-bg.png')] bg-cover  bg-no-repeat min-h-screen">
      <div className="w-full max-w-[500px] bg-[#591012] p-8 rounded-2xl shadow-lg  ">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">
          Welcome Back
        </h1>
        <p className="text-white text-center mb-8">Sign in to continue</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <InputField
            id="email"
            label="Email Address"
            type="email"
            placeholder="player1@gmail.com"
            icon={<Mail size={18} />}
            {...register("email")}
            error={errors.email?.message}
          />

          {/* Password Field */}
          <InputField
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={<Lock size={18} />}
            showToggle
            {...register("password")}
            error={errors.password?.message}
          />

          {/* Forgot Password */}
          {/* <div className="text-right">
            <Link
              href="/forget-password"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl text-white font-semibold 
    flex items-center justify-center gap-2 transition-all duration-300
    ${
      isLoading
        ? "bg-[#590D13]/70 cursor-not-allowed"
        : "bg-[#36070c] hover:bg-[#4a0a10] active:scale-[0.985]"
    }`}
          >
            {isLoading && (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isLoading ? "Signing you in..." : "Sign In"}
          </button>
        </form>

        {/* Sign Up Link */}
        {/* <div className="text-center mt-8 text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            href="/signUp"
            className="text-blue-600 font-semibold hover:underline"
          >
            Create an account
          </Link>
        </div> */}
      </div>
    </div>
  );
}
