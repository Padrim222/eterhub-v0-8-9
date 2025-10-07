import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { LiquidButton } from "@/components/ui/button";

interface AuthFormProps {
  isSignUp: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn: () => void;
  onResetPassword: () => void;
  onToggleMode: () => void;
  loading?: boolean;
}

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-primary/70 focus-within:bg-primary/10">
    {children}
  </div>
);

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

export const AuthForm = ({ 
  isSignUp, 
  onSubmit, 
  onGoogleSignIn, 
  onResetPassword, 
  onToggleMode,
  loading = false 
}: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md">
      <form className="space-y-4 md:space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="text-xs md:text-sm font-medium text-muted-foreground">
            Endereço de Email
          </label>
          <GlassInputWrapper>
            <input 
              name="email" 
              type="email" 
              placeholder="Digite seu endereço de email" 
              className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none" 
              required
              disabled={loading}
            />
          </GlassInputWrapper>
        </div>

        <div>
          <label className="text-xs md:text-sm font-medium text-muted-foreground">
            Senha
          </label>
          <GlassInputWrapper>
            <div className="relative">
              <input 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Digite sua senha" 
                className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none" 
                required
                disabled={loading}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-3 flex items-center"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                ) : (
                  <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </button>
            </div>
          </GlassInputWrapper>
        </div>

        {!isSignUp && (
          <div className="flex items-center justify-between text-xs md:text-sm">
            <label className="flex items-center gap-2 md:gap-3 cursor-pointer">
              <input type="checkbox" name="rememberMe" className="h-4 w-4 rounded border-border" />
              <span className="text-foreground/90">Manter-me conectado</span>
            </label>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onResetPassword(); }} 
              className="hover:underline text-primary transition-colors whitespace-nowrap"
            >
              Redefinir senha
            </a>
          </div>
        )}

        <LiquidButton 
          type="submit" 
          className="w-full"
          size="lg"
          disabled={loading}
        >
          {loading ? "Aguarde..." : (isSignUp ? "Criar Conta" : "Entrar")}
        </LiquidButton>
      </form>

      <div className="relative flex items-center justify-center my-6">
        <span className="w-full border-t border-border"></span>
        <span className="px-4 text-sm text-muted-foreground bg-background absolute">
          Ou continue com
        </span>
      </div>

      <button 
        onClick={onGoogleSignIn} 
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-3 md:py-4 text-sm md:text-base hover:bg-secondary transition-colors disabled:opacity-50"
      >
        <GoogleIcon />
        Continuar com Google
      </button>

      <p className="text-center text-xs md:text-sm text-muted-foreground mt-6">
        {isSignUp ? "Já tem uma conta?" : "Novo em nossa plataforma?"}{' '}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onToggleMode(); }} 
          className="text-primary hover:underline transition-colors"
        >
          {isSignUp ? "Fazer Login" : "Criar Conta"}
        </a>
      </p>
    </div>
  );
};
