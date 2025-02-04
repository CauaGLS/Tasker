import { User } from "better-auth";
import * as React from "react";

interface ForgotPasswordEmailProps {
  user: User;
  url: string;
  token: string;
}

export const ForgotPasswordEmail: React.FC<Readonly<ForgotPasswordEmailProps>> = ({ user, url, token }) => (
  <div>
    <h1>Redefinir senha</h1>
    <p>Clique no link abaixo para redefinir sua senha:</p>
    <a href={url}>Redefinir senha</a>
  </div>
);
