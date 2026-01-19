const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

export interface Article {
  title: string;
  url: string;
  source: string;
}

interface NewsWithLie {
  trueArticles: Article[];
  lieArticle: string;
}

export async function fetchArticlesAndGenerateLie(): Promise<NewsWithLie> {
  console.log('🤖 Gemini API key present:', !!GEMINI_API_KEY);

  if (!GEMINI_API_KEY) {
    console.warn('❌ Gemini API key not configured, using fallback');
    return {
      trueArticles: getMockArticles(),
      lieArticle: generateFallbackLie(),
    };
  }

  try {
    console.log('📰 Fetching news articles...');
    // Fetch real news articles
    const newsArticles = await fetchNewsArticles();
    console.log(`✅ Fetched ${newsArticles.length} news articles`);

    // Use Gemini REST API to select 3 articles and generate a fake one
    const prompt = `You are helping with a "Three Truths and a Lie" game about news headlines.

Here are ${newsArticles.length} real news headlines:
${newsArticles.map((article, i) => `${i + 1}. ${article.title}`).join('\n')}

Your tasks:
1. Select the 3 most interesting and diverse headlines from the list above
2. Generate 1 fake headline that sounds plausible but is clearly fake when you think about it

Requirements for the fake headline:
- Should be in a similar style to real news headlines
- Should be believable at first glance
- Should be absurd or impossible when examined closely
- Should be a complete sentence
- Should NOT be obviously satirical or jokey

Return your response in this EXACT JSON format (no additional text):
{
  "selectedIndices": [1, 3, 5],
  "fakeHeadline": "Your generated fake headline here"
}`;

    console.log('🤖 Calling Gemini API...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('❌ No text in Gemini response:', data);
      throw new Error('No text in Gemini response');
    }

    console.log('📝 Gemini response received');

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Could not parse Gemini response:', text);
      throw new Error('Could not parse Gemini response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log('✅ Generated fake headline:', parsed.fakeHeadline);

    // Get the selected articles
    const selectedArticles = parsed.selectedIndices
      .slice(0, 3)
      .map((index: number) => newsArticles[index - 1])
      .filter((article: Article | undefined) => article !== undefined);

    if (selectedArticles.length < 3) {
      throw new Error('Not enough articles selected');
    }

    return {
      trueArticles: selectedArticles,
      lieArticle: parsed.fakeHeadline,
    };
  } catch (error) {
    console.error('❌ Error with Gemini API:', error);
    console.warn('⚠️  Falling back to mock data');
    return {
      trueArticles: getMockArticles(),
      lieArticle: generateFallbackLie(),
    };
  }
}

async function fetchNewsArticles(): Promise<Article[]> {
  if (!NEWS_API_KEY) {
    console.warn('News API key not configured, using mock data');
    return getMockArticles();
  }

  try {
    // Get date from 7 days ago to get news from the past week
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fromDate = sevenDaysAgo.toISOString().split('T')[0];

    // Use 'everything' endpoint with English language filter and popular sources
    const response = await fetch(
      `${NEWS_API_URL}?q=*&language=en&from=${fromDate}&sortBy=popularity&pageSize=20&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ NewsAPI error:', response.status, errorData);
      throw new Error(`Failed to fetch articles: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'ok' || !data.articles || data.articles.length < 5) {
      console.error('❌ Insufficient articles:', data.articles?.length || 0);
      throw new Error('Insufficient articles returned');
    }

    console.log(`✅ NewsAPI returned ${data.articles.length} articles`);

    return data.articles
      .filter((article: any) =>
        article.title &&
        article.url &&
        !article.title.includes('[Removed]') &&
        article.title.length > 20 // Filter out very short titles
      )
      .slice(0, 15)
      .map((article: any) => ({
        title: article.title,
        url: article.url,
        source: article.source.name,
      }));
  } catch (error) {
    console.error('Error fetching news articles:', error);
    throw error; // Re-throw so the caller can use fallback
  }
}

// Legacy exports for backwards compatibility
export async function fetchTrueArticles(): Promise<Article[]> {
  const result = await fetchArticlesAndGenerateLie();
  return result.trueArticles;
}

export async function generateLieArticle(): Promise<string> {
  const result = await fetchArticlesAndGenerateLie();
  return result.lieArticle;
}

function generateFallbackLie(): string {
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
