"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { messaging } from "@/lib/firebase";
import { useUserLoginMutation } from "@/redux/api/registerApi";
import {
  useGetMyProfileQuery,
  useLazyGetMyProfileQuery,
} from "@/redux/api/userApi";
import { setUser } from "@/redux/features/user/userSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getToken, Messaging } from "firebase/messaging";
import Cookies from "js-cookie";
import { Bell, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const ensureFirebaseMessagingServiceWorker = async () => {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    { scope: "/" },
  );

  await navigator.serviceWorker.ready;
  return registration;
};

const requestPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    try {
      if (!messaging) {
        throw new Error(
          "Firebase Messaging is not available in this browser/context",
        );
      }

      const serviceWorkerRegistration =
        await ensureFirebaseMessagingServiceWorker();

      const token = await getToken(messaging as Messaging, {
        vapidKey:
          "BB1PX6pQC8_xasY8--bagFVCPXe-0yeyhuVG9C5_QxO7mo9ImFHdXZSIgJezqEs2eVpGLef-dFtpWvPGhmD9S0M",
        ...(serviceWorkerRegistration
          ? { serviceWorkerRegistration }
          : undefined),
      });
      return token;
    } catch (err) {
      console.error("Error getting FCM token:", err);
      throw err;
    }
  } else {
    throw new Error("Notification permission denied");
  }
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [, setNotificationEnabled] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(" ");
  const [, setNotificationStatus] = useState<
    "pending" | "granted" | "denied" | "skipped"
  >("pending");
  const dispatch = useDispatch();
  const router = useRouter();

  const [loginUserFn, { isLoading }] = useUserLoginMutation();
  const [getMyProfile] = useLazyGetMyProfileQuery();
  const { data: myProfileData } = useGetMyProfileQuery({});
  const profileData = myProfileData?.result;
  console.log("myprofile", profileData);

  const isIOS = () =>
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const isNotificationSupported = () =>
    typeof window !== "undefined" && "Notification" in window;

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/");
    }
  }, []);

  useEffect(() => {
    if (isIOS()) {
      setNotificationModalVisible(false);
      return;
    }

    if (!isNotificationSupported()) return;

    if (Notification.permission === "default") {
      setNotificationModalVisible(true);
      setNotificationStatus("pending");
    } else if (Notification.permission === "granted") {
      setNotificationEnabled(true);
      setNotificationStatus("granted");
      getFcmToken();
    } else {
      setNotificationStatus("denied");
    }
  }, []);

  const getFcmToken = async () => {
    try {
      if (!messaging) return null;

      const serviceWorkerRegistration =
        await ensureFirebaseMessagingServiceWorker();

      const token = await getToken(messaging as Messaging, {
        vapidKey:
          "BB1PX6pQC8_xasY8--bagFVCPXe-0yeyhuVG9C5_QxO7mo9ImFHdXZSIgJezqEs2eVpGLef-dFtpWvPGhmD9S0M",
        ...(serviceWorkerRegistration
          ? { serviceWorkerRegistration }
          : undefined),
      });
      setFcmToken(token);
      return token;
    } catch (err) {
      console.error("Error getting FCM token:", err);
      setFcmToken("");
      return null;
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const token = await requestPermission();
      if (token) {
        setNotificationEnabled(true);
        setFcmToken(token);
        Cookies.set("fcmToken", token);
        setNotificationStatus("granted");
        toast.success("Notifications enabled successfully!");
      }
    } catch (err) {
      console.error("Failed to enable notifications:", err);
      setFcmToken(null);
      setNotificationStatus("denied");
      toast.error(
        "Failed to enable notifications. Please check your browser settings.",
      );
    } finally {
      setNotificationModalVisible(false);
    }
  };

  const handleSkipNotifications = () => {
    setNotificationModalVisible(false);
    setFcmToken(null);
    setNotificationStatus("skipped");
    toast.info("You will not get notify for any notification");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await loginUserFn({
        email: email,
        password: password,
        fcmToken: fcmToken || "",
      }).unwrap();

      if (response?.success) {
        Cookies.set("accessToken", response?.result?.token);
        toast.success("Login successfully");
        console.log("login response", response);
        dispatch(
          setUser({
            user: response.result.user,
            token: response.result.token,
          }),
        );

        router.push("/");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Login Failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    localStorage.setItem("googleSignIn", "true");

    try {
      await signIn("google", {
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      console.error("Google login error:", err);
      toast.error("Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const isAnyLoading = isLoggingIn || googleLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-4 font-serif">
      {/* Premium Background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,#8B1A00,transparent_60%),radial-gradient(ellipse_at_bottom,#0A0000,#000)]" />
      
      {/* Notification Modal - Responsive Design */}
      <Dialog open={notificationModalVisible} onOpenChange={(open) => !open && handleSkipNotifications()}>
        <DialogContent className="bg-[#1A0500] border border-amber-500/30 text-white w-[95vw] max-w-[500px] p-0 overflow-hidden [&>button]:text-amber-100/60 [&>button]:hover:text-amber-100 rounded-2xl mx-auto">
          <DialogHeader className="p-4 sm:p-6 border-b border-amber-500/20">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 flex-shrink-0" />
              <span className="text-amber-100 font-normal">Enable Notifications</span>
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 sm:p-6">
            <p className="text-amber-100/80 mb-4 text-sm sm:text-base">
              Stay updated with important alerts and messages by enabling
              notifications.
            </p>
            
            {/* Info Box */}
            <div className="flex flex-col sm:flex-row items-start gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-md mb-4">
              <Bell className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-400 mb-2">
                  What to expect:
                </p>
                <ul className="text-xs sm:text-sm text-amber-100/80 list-disc pl-4 space-y-1.5">
                  <li>Important account notifications</li>
                </ul>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-amber-100/50 italic">
              You will not be notified if you skip this step.
            </p>
          </div>

          <DialogFooter className="p-4 sm:p-6 border-t border-amber-500/20 bg-[#1A0500] flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkipNotifications}
              disabled={isAnyLoading}
              className="border-amber-500/30 text-amber-100 hover:bg-amber-500/20 hover:text-amber-100 bg-transparent m-0 w-full sm:w-auto order-2 sm:order-1"
            >
              Skip for Now
            </Button>
            <Button
              type="button"
              onClick={handleEnableNotifications}
              className="bg-gradient-to-r from-yellow-400 to-orange-600 text-black border border-black hover:from-yellow-300 hover:to-orange-500 m-0 w-full sm:w-auto order-1 sm:order-2"
              disabled={isAnyLoading}
            >
              Enable Notifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gradient blur background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-[150px] opacity-40" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-2xl bg-[#1A0500]/80 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-amber-100 mb-6">
          Log In
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Address */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-amber-100"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-xl border-amber-500/30 bg-black/50 px-4 placeholder:text-amber-100/40 text-white"
              disabled={isAnyLoading}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-amber-100"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="• • • • • •"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl border-amber-500/30 bg-black/50 px-4 pr-12 placeholder:text-amber-100/40 text-white"
                disabled={isAnyLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-100/40 hover:text-amber-100/60 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isAnyLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              href="/reset-password"
              className="text-sm font-medium text-amber-100 hover:text-amber-100/60 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => isAnyLoading && e.preventDefault()}
            >
              Forgot password?
            </Link>
          </div>

          {/* Log In Button */}
          <Button
            type="submit"
            disabled={isAnyLoading}
            className="w-full h-12 bg-gradient-to-r from-yellow-400 to-orange-600 hover:from-yellow-300 hover:to-orange-500 text-white font-medium rounded-full text-base shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-500/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#1A0500]/80 backdrop-blur-xl border border-amber-500/30 px-4 text-amber-100/60">
                Or login with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl bg-[#1A0500]/80 backdrop-blur-xl border border-amber-500/30 hover:bg-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleGoogleLogin}
              disabled={isAnyLoading}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium text-amber-100">
                    Connecting to Google...
                  </span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-amber-100">
                    Continue with Google
                  </span>
                </>
              )}
            </Button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-amber-100/60">
            Have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-amber-400 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => isAnyLoading && e.preventDefault()}
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}