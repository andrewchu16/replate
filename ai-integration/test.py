from tgtg import TgtgClient
import os
from dotenv import load_dotenv
import json
from datetime import datetime
from time import sleep

load_dotenv()

TGTG_CLIENT_ID = {
    "access_token": os.getenv('TGTG_ACCESS_TOKEN'),
    "refresh_token": os.getenv('TGTG_REFRESH_TOKEN'),
    "cookie": os.getenv('TGTG_COOKIE')}

def save_items_to_json(items, filename=None):
    # Create data directory if it doesn't exist
    data_dir = "data"
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    
    # Generate filename with timestamp if not provided
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"tgtg_items_{timestamp}.json"
    
    filepath = os.path.join(data_dir, filename)
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
        print(f"Items saved successfully to {filepath}")
        return filepath
    except Exception as e:
        print(f"Error saving items to JSON: {e}")
        return None

# Initialize client
client = TgtgClient(
    access_token=TGTG_CLIENT_ID["access_token"],
    refresh_token=TGTG_CLIENT_ID["refresh_token"],
    cookie=TGTG_CLIENT_ID["cookie"]
)

client.get_credentials()

# Fetch items once
items = client.get_items(
    favorites_only=False,
    latitude=43.656997372,
    longitude=-79.390331772,
    radius=10,
)

# Save items to JSON file
saved_filepath = save_items_to_json(items)

# Pretty print the items (optional)
print("\nFetched items:")
print(json.dumps(items, indent=2))