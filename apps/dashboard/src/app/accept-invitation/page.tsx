"use client";

import { useEffect, useState } from "react";
import { AcceptInvitationForm } from "./accept-invitation-form";

export default function AcceptInvitationPage() {
  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  return <AcceptInvitationForm token={token} />;
}
