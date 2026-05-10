from bs4 import BeautifulSoup
from pathlib import Path
import json

pages = {
    "thunder": "https://mixkit.co/free-sound-effects/thunder/",
    "impact": "https://mixkit.co/free-sound-effects/impact/",
    "crash": "https://mixkit.co/free-sound-effects/crash/",
    "magic": "https://mixkit.co/free-sound-effects/magic/",
}

results = []
for name in pages:
    html_path = Path(f"/tmp/mixkit-{name}.html")
    if not html_path.exists():
        continue
    soup = BeautifulSoup(html_path.read_text(errors="ignore"), "html.parser")
    for item in soup.select("div.item-grid-card, div.item-grid-sfx-preview, article, div[class*=item-grid]"):
        player = item.select_one("[data-audio-player-preview-url-value]")
        button = item.select_one("[data-download--button-modal-url-value]")
        if not player:
            continue
        title_el = item.select_one("h2, h3, a[class*=title], [class*=title]")
        text = " ".join(item.get_text(" ", strip=True).split())
        title = title_el.get_text(" ", strip=True) if title_el else text.split(" Download Free SFX")[0]
        results.append({
            "category": name,
            "title": title,
            "item_id": player.get("data-audio-player-item-id-value"),
            "preview_url": player.get("data-audio-player-preview-url-value"),
            "download_modal": button.get("data-download--button-modal-url-value") if button else None,
            "text": text[:240],
        })

seen = set()
unique = []
for row in results:
    key = row["item_id"]
    if key and key not in seen:
        seen.add(key)
        unique.append(row)

Path("/home/ubuntu/hippoquarium-soundboard/mixkit_candidates.json").write_text(json.dumps(unique, indent=2), encoding="utf-8")
for row in unique[:120]:
    print(f"{row['category']:8} {row['item_id']:>5} {row['title']} | {row['preview_url']} | {row['download_modal']}")
