import { signIn, setSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Input, Button, Card, Label } from "@/components/ui";

export default function LoginPage() {
  async function action(formData: FormData) {
    "use server";
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");
    const user = await signIn(username, password);
    if (!user) redirect("/login?error=1");
    setSession(user);
    redirect(user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Kirish</h1>
        <form action={action} className="space-y-3">
          <div>
            <Label>Login</Label>
            <Input name="username" required />
          </div>
          <div>
            <Label>Parol</Label>
            <Input name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">Kirish</Button>
          <p className="text-xs text-slate-400">
            Admin login/parol .env yoki Replit Secrets orqali beriladi.
          </p>
        </form>
      </Card>
    </div>
  );
}
