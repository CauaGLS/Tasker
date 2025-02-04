import Logo from "@/public/logo.svg";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <Image src={Logo} alt="Logo" width={42} height={42} />
        </div>
        <div className="flex flex-col gap-6">
          {children}
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
            Ao continuar, você concorda com nossos <a href="#">Termos de Serviço</a> e{" "}
            <a href="#">Política de Privacidade</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
