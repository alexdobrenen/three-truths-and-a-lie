export interface Article {
  title: string;
  url: string;
  source: string;
}

interface ArticleWithLie extends Article {
  isLie: boolean;
}

interface HeadlineRound {
  id: number;
  headlines: ArticleWithLie[];
}

interface HeadlinesData {
  rounds: HeadlineRound[];
}

let headlinesData: HeadlinesData | null = null;

async function loadHeadlines(): Promise<HeadlinesData> {
  if (headlinesData) {
    return headlinesData;
  }

  const baseUrl = import.meta.env.BASE_URL || '/';
  const headlinesUrl = `${baseUrl}headlines.json`;

  console.log('📰 Loading headlines from:', headlinesUrl);

  const response = await fetch(headlinesUrl);

  if (!response.ok) {
    throw new Error(`Failed to load headlines: ${response.status}`);
  }

  headlinesData = await response.json();
  console.log(`✅ Loaded ${headlinesData!.rounds.length} rounds of headlines`);

  return headlinesData!;
}

export async function fetchArticlesAndGenerateLie(usedRoundIds: number[] = []): Promise<{ articles: ArticleWithLie[], roundId: number }> {
  const data = await loadHeadlines();

  // Filter out rounds that have already been used
  const availableRounds = data.rounds.filter(round => !usedRoundIds.includes(round.id));

  if (availableRounds.length === 0) {
    throw new Error('No more unused rounds available. All rounds have been used.');
  }

  // Select a random round from the available ones
  const randomIndex = Math.floor(Math.random() * availableRounds.length);
  const round = availableRounds[randomIndex];

  console.log(`📰 Using round ${round.id} (${usedRoundIds.length} rounds already used globally)`);
  console.log(`📰 Headlines in order:`, round.headlines.map((h, i) => `${i + 1}. ${h.title.substring(0, 40)}... (${h.isLie ? 'LIE' : 'TRUE'})`));

  return {
    articles: round.headlines,
    roundId: round.id,
  };
}
