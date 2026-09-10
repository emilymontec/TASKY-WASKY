import { serve } from "inngest/next";
import { inngest } from "@/lib/jobs/client";
import { syncUserData } from "@/lib/jobs/sync";
import { generateUserInsights } from "@/lib/jobs/insights";
import { generateWrappedReport } from "@/lib/jobs/wrapped";
import { purgePrivateRepoData } from "@/lib/jobs/purge-private-repos";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncUserData, generateUserInsights, generateWrappedReport, purgePrivateRepoData]
});
