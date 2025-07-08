
import { dataSourcesFormatted } from "@/components/ai/data/tourismSources";

/**
 * Get the data source name in Portuguese
 */
export function getSourceName(source: string): string {
  return dataSourcesFormatted[source as keyof typeof dataSourcesFormatted] || source;
}
