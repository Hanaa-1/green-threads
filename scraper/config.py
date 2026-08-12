# scraper/config.py

# Strategic targets: Mission-driven brands with accessible, text-heavy sustainability pages
# that are less likely to trigger enterprise anti-bot firewalls.
BRANDS_TO_SCRAPE = [
    {
        "name": "Pact",
        "url": "https://wearpact.com/sustainability",
        "alternatives": ["Organic Basics", "Kotn", "Tentree"]
    },
    {
        "name": "Allbirds",
        "url": "https://www.allbirds.com/pages/sustainable-practices",
        "alternatives": ["Veja", "Rothy's", "Nisolo"]
    },
    {
        "name": "Tentree",
        "url": "https://www.tentree.com/pages/sustainability",
        "alternatives": ["Pact", "Patagonia", "United By Blue"]
    },
     {
        "name": "Everlane",
        "url": "https://www.everlane.com/about",
        "alternatives": ["Kotn", "Reformation", "Pact"]
    },
    {
        "name": "Reformation",
        "url": "https://www.thereformation.com/pages/sustainability",
        "alternatives": ["Everlane", "Eileen Fisher", "Amour Vert"]
    },
    {
        "name": "Kotn",
        "url": "https://kotn.com/pages/our-impact",
        "alternatives": ["Pact", "Organic Basics", "Tentree"]
    },
    {
        "name": "Nisolo",
        "url": "https://nisolo.com/pages/sustainability",
        "alternatives": ["Allbirds", "Veja", "Rothy's"]
    },
    {
        "name": "United By Blue",
        "url": "https://www.unitedbyblue.com/sustainability/",
        "alternatives": ["Tentree", "Patagonia", "Finisterre"]
    }
]