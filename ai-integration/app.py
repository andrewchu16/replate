from flask import Flask, request, jsonify
import menuGen 
import json

'''
endpoints:
one endpoint for ai
    verify data
    talk to tgtg api
    make meal plan
    
// Meal preferences for the user
export default interface Preferences {
  allergies: string[]; // ["gluten", "dairy", "soy", "peanuts", "tree nuts", "eggs", "fish", "shellfish", "mollusks", "crustaceans"]
  budget: number; // in dollars
  cuisine: string[]; // ["american", "asian", "mexican", "mediterranean", "italian", "french", "german", "spanish", "indian", "japanese", "korean", "thai", "vietnamese", "other"]
  dietaryRestrictions: string[]; // ["vegetarian", "vegan", "pescetarian", "flexitarian", "keto", "paleo", "primal", "whole30", "other"]
  mealDescription: string; // "I want a quick warm breakfast for tomorrow morning"
  latitude: number; // latitude of the user
  longitude: number; // longitude of the user
  maxDistance: number; // in kilometers
}    
'''


app = Flask(__name__)

@app.route("/getAiResponse", methods=["GET", "POST"])
def getAiResponse():
    # Available prompts: I want:
    # top 3 cheapest places to eat
    # top 3 nearest places to eat
    # top 3 chinese/italian/indian places to eat
    if request.method == "POST":
        data = request.get_json()
        prompt = data.get("prompt", "No prompt provided")
        preferences = data.get("preferences", "No preferences provided")
    else:
        preferences = request.args.get("preferences", "No preferences provided")

    preferencesStr = json.dumps(preferences)
    
    response = menuGen.main(prompt=prompt, preferences=preferencesStr)
    return response


if __name__ == "__main__":
    app.run(debug=True)


    