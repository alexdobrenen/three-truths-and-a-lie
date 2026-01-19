const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

export interface Article {
  title: string;
  url: string;
  source: string;
}

export async function fetchTrueArticles(): Promise<Article[]> {
  if (!NEWS_API_KEY) {
    console.warn('News API key not configured, using mock data');
    return getMockArticles();
  }

  try {
    const response = await fetch(
      `${NEWS_API_URL}?country=us&pageSize=10&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }

    const data = await response.json();

    if (data.status !== 'ok' || !data.articles || data.articles.length < 3) {
      throw new Error('Insufficient articles returned');
    }

    return data.articles
      .filter((article: any) => article.title && article.url)
      .slice(0, 3)
      .map((article: any) => ({
        title: article.title,
        url: article.url,
        source: article.source.name,
      }));
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return getMockArticles();
  }
}

export function generateLieArticle(): string {
  const lieTemplates = [
    'Scientists Discover That Trees Can Now Walk at Night, Local Parks on High Alert',
    'Breaking: International Space Station Accidentally Left in Uber, NASA Scrambles to Retrieve',
    'Study Finds That Cats Have Been Secretly Running the Internet All Along',
    'New Research Shows That Pizza Officially Recognized as a Vegetable by UN',
    'Archaeologists Unearth Ancient Smartphone Dating Back to 3000 BC',
    'World\'s First Flying Car Recalled After Accidentally Flying to Mars',
    'Breaking News: Time Travel Invented Yesterday, Announced Last Week',
    'Scientists Prove That Monday Was Actually Created by a Computer Bug',
    'New Study: Coffee Found to Be 98% Water, 2% Existential Dread',
    'Researchers Discover That Procrastination Actually Speeds Up Time',
  ];

  return lieTemplates[Math.floor(Math.random() * lieTemplates.length)];
}

function getMockArticles(): Article[] {
  return [
    {
      title: 'Global Climate Summit Reaches Historic Agreement on Carbon Emissions',
      url: 'https://example.com/climate-summit',
      source: 'Mock News Network',
    },
    {
      title: 'Tech Giant Announces Revolutionary Quantum Computing Breakthrough',
      url: 'https://example.com/quantum-computing',
      source: 'Mock Tech Today',
    },
    {
      title: 'New Medical Treatment Shows Promise in Clinical Trials',
      url: 'https://example.com/medical-treatment',
      source: 'Mock Health Journal',
    },
  ];
}
