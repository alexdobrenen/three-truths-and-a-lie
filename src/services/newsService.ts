export interface Article {
  title: string;
  url: string;
  source: string;
}

interface NewsWithLie {
  trueArticles: Article[];
  lieArticle: string;
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
let currentRoundIndex = 0;

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

export async function fetchArticlesAndGenerateLie(): Promise<NewsWithLie> {
  const data = await loadHeadlines();

  // Get the next round (cycle through available rounds)
  const round = data.rounds[currentRoundIndex % data.rounds.length];
  currentRoundIndex++;

  console.log(`📰 Using round ${round.id}`);

  const trueArticles: Article[] = round.trueHeadlines.map((headline) => ({
    title: headline.title,
    url: headline.url,
    source: headline.source,
  }));

  return {
    trueArticles,
    lieArticle: round.fakeHeadline.title,
  };
}
