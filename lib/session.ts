import { getServerSession as nextAuthGetServerSession } from "next-auth";
import { cache } from "react";
import { authOptions } from "@/lib/auth";

/**
 * React.cache() deduplicates this call within a single server request/render.
 * Multiple server actions invoked in parallel will share one session lookup
 * instead of each making a separate DB/cookie round-trip.
 */
export const getSession = cache(() => nextAuthGetServerSession(authOptions));
