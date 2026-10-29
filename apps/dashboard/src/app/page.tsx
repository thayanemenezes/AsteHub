import { redirect } from "next/navigation";

export default function HomePage() {
  redirect(`${process.env.GITHUB_PAGES_BASE_PATH ?? ""}/login`);
}
