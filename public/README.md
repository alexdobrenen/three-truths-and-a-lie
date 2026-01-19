# Headlines Configuration

This directory contains `headlines.json`, which defines the headlines used in the game.

## Structure

The JSON file contains rounds of headlines. Each round has:
- **3 true headlines**: Real news headlines with title, URL, and source
- **1 fake headline**: A fake headline with title and source

## Format

```json
{
  "rounds": [
    {
      "id": 1,
      "trueHeadlines": [
        {
          "title": "Actual news headline here",
          "url": "https://example.com/article",
          "source": "News Source Name"
        },
        {
          "title": "Another real headline",
          "url": "https://example.com/article2",
          "source": "Another Source"
        },
        {
          "title": "Third real headline",
          "url": "https://example.com/article3",
          "source": "Third Source"
        }
      ],
      "fakeHeadline": {
        "title": "Your creative fake headline that sounds plausible",
        "source": "Fake News"
      }
    }
  ]
}
```

## Tips for Creating Headlines

### True Headlines
- Use real news from current events
- Include diverse topics (politics, tech, entertainment, science, sports)
- Make them interesting and engaging
- Provide actual URLs to the articles

### Fake Headlines
- Should sound believable at first glance
- Should be absurd or impossible when examined closely
- Keep them in the same style as real news headlines
- Avoid obvious jokes or satire

## Adding More Rounds

Simply add more round objects to the `rounds` array:

```json
{
  "rounds": [
    { "id": 1, ... },
    { "id": 2, ... },
    { "id": 3, ... }
  ]
}
```

The game will cycle through all available rounds automatically.

## Examples

**Good Fake Headlines:**
- "Scientists Discover That Trees Can Now Walk at Night, Local Parks on High Alert"
- "Breaking: International Space Station Accidentally Left in Uber, NASA Scrambles to Retrieve"
- "Study Finds That Cats Have Been Secretly Running the Internet All Along"

**Bad Fake Headlines:**
- "Aliens Land on Earth" (too obvious)
- "President Makes Statement" (too vague)
- "LOL Scientists Find Unicorns" (too silly)
