import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoginPageProps {
  searchParams?: {
    error?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const errorMessage = searchParams?.error ?? "";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-[#3596F2] text-white p-12">
        <div className="max-w-lg text-center space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tight">DojoFlow</h1>
          <p className="text-xl opacity-90">
            The ultimate CRM for Code Ninjas franchises. Streamline your pipeline, manage students, and grow your dojo.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-12 opacity-80 text-sm">
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="font-bold text-lg mb-1">Lead</div>
              <div>Pipeline</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="font-bold text-lg mb-1">Tour</div>
              <div>Scheduling</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="font-bold text-lg mb-1">Follow-up</div>
              <div>Actions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="mx-auto mb-4 h-12 w-12 bg-[#3596F2] rounded-xl flex items-center justify-center text-white font-bold text-2xl">
              CN
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back, Sensei</CardTitle>
            <CardDescription>Enter your credentials to access the dojo.</CardDescription>
          </CardHeader>
          <form action={login}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  role="alert"
                >
                  {decodeURIComponent(errorMessage)}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="sensei@codeninjas.com" 
                  required 
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-[#3596F2] hover:underline">Forgot password?</a>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  className={`h-11 ${errorMessage ? "border-red-300 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!errorMessage}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Button className="w-full h-11 text-base bg-[#3596F2] hover:bg-[#2d82d6]" type="submit">
                Sign In
              </Button>
            </CardFooter>
          </form>
          <div className="px-8 pb-8 text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </div>
        </Card>
      </div>
    </div>
  );
}
