import { redirect } from "next/navigation";

export default function HomePage() {
  const pagesBasePath = process.env.PAGES_BASE_PATH?.trim().replace(
    /^\/+|\/+$/g,
    "",
  );
  redirect(`${pagesBasePath ? `/${pagesBasePath}` : ""}/login`);
}
