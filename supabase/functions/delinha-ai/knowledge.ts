
// Knowledge processing utilities
import { KnowledgeItem } from "./types.ts";

/**
 * Process and filter the knowledge base to find the most relevant and recent information
 */
export function processKnowledgeBase(knowledgeBase: any[]): KnowledgeItem[] {
  if (!knowledgeBase || knowledgeBase.length === 0) {
    return [];
  }
  
  // Group items by title to find the most recent
  const groupedItems: Record<string, any[]> = {};
  
  knowledgeBase.forEach(item => {
    if (!groupedItems[item.title]) {
      groupedItems[item.title] = [];
    }
    groupedItems[item.title].push(item);
  });
  
  // Select only the most recent item from each group
  const latestItems: KnowledgeItem[] = [];
  
  Object.values(groupedItems).forEach((items: any[]) => {
    // Sort by update date (most recent first)
    const sortedItems = items.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
    
    // Add only the most recent item
    if (sortedItems.length > 0) {
      latestItems.push(sortedItems[0]);
    }
  });
  
  console.log(`Processed ${latestItems.length} most recent items from knowledge base`);
  return latestItems;
}

/**
 * Format the knowledge base content for the AI prompt
 */
export function formatKnowledgeContent(items: KnowledgeItem[]): string {
  return items
    .map(item => `Informação sobre ${item.title}: ${item.content}\n`)
    .join("\n");
}
