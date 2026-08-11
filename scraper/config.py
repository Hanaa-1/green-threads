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
    }
]