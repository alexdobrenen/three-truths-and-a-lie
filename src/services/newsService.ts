export interface Article {
  title: string;
  url: string;
  source: string;
}

interface NewsWithLie {
  trueArticles: Article[];
  lieArticle: string;
  roundId: number;
}

interface HeadlineRound {
  id: number;
  trueHeadlines: {
    title: string;
    url: string;
    source: string;
  }[];
  fakeHeadline: {
    title: string;
    source: string;
  };
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

export async function fetchArticlesAndGenerateLie(usedRoundIds: number[] = []): Promise<NewsWithLie> {
  const data = await loadHeadlines();

  // Filter out rounds that have already been used in this game
  const availableRounds = data.rounds.filter(round => !usedRoundIds.includes(round.id));

  if (availableRounds.length === 0) {
    throw new Error('No more unused rounds available. All rounds have been used in this game.');
  }

  // Select a random round from the available ones
  const randomIndex = Math.floor(Math.random() * availableRounds.length);
  const round = availableRounds[randomIndex];

  console.log(`📰 Using round ${round.id} (${usedRoundIds.length} rounds already used)`);

  const trueArticles: Article[] = round.trueHeadlines.map((headline) => ({
    title: headline.title,
    url: headline.url,
    source: headline.source,
  }));

  return {
    trueArticles,
    lieArticle: round.fakeHeadline.title,
    roundId: round.id,
  };
}
