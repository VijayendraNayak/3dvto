import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  // Retrieve the 'loggedin' cookie
  const verify = req.cookies.get("loggedin")?.value;
  const url = req.url;

  // Redirect to home page if not logged in and trying to access the dashboard
  if (!verify && url.includes('/profile')) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect to dashboard if logged in and accessing the home page
  if (verify && url === "http://localhost:3000/") {
    return NextResponse.redirect(new URL("/", req.url));
  }
}
