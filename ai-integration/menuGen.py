from google import genai
from google.genai import types
import cohere
import re
from dotenv import load_dotenv
import os
from testData import restaurants
# from smallerData import lessRestaurants
import json
from pydantic import BaseModel
from aiRules import geminiRules, cohereRules
import time

class restaurantSchema(BaseModel):
    name: str
    price: float
    longitude: float
    latitude: float
    rating: float
    storeName: str
    imgUrl: str
    distance: float


def generateMeal(userPrompt: str, cohereFeedback: str, restaurantStr: str, preferences: str) -> str:
    try:
        geminiClient = genai.Client(api_key=os.getenv("GEMINI_KEY"))
        full_prompt = f"Rules:\n{geminiRules}\nUser Prompt:\n{userPrompt}\nFeedback:\n{cohereFeedback}\nRestaurants:\n{restaurantStr}\nPreferences:\n{preferences}"

        response = geminiClient.models.generate_content(
            model="gemini-2.0-flash",
            contents=full_prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=list[restaurantSchema],
            )
        )
        return response.text
    
    except Exception as e:
        if "RESOURCE_EXHAUSTED" in str(e):
            print("API rate limit reached. Waiting before retry...")
            time.sleep(60)  # Wait 60 seconds before retry
            raise  # Let retry decorator handle it
        raise


def validateMeal(userPrompt: str, geminiResponse, restaurantStr: str, preferences: str) -> dict:
    try:
        cohereClient = cohere.ClientV2(api_key=os.getenv("COHERE_KEY"))
        geminiResponseStr = json.dumps(geminiResponse)
        full_prompt = f"Rules:\n{cohereRules}\nUser Prompt:\n{userPrompt}\nGemini Response:\n{geminiResponseStr}\nRestaurants:\n{restaurantStr}\nPrefrences:\n{preferences}"

        response = cohereClient.chat(
            model="command-r7b-12-2024",
            messages=[{"role": "user", "content": full_prompt}]
        )
        cohereOutput = response.message.content[0].text
        # print("cohere output: ", cohereOutput)
        
        verified_match = re.search(r'VERIFIED=(\w+)', cohereOutput)
        feedback_match = re.search(r'FEEDBACK="?(.*?)"?$', cohereOutput, re.DOTALL | re.MULTILINE)
        
        isVerified = False
        cohereFeedback = ""
        
        if verified_match:
            isVerified = verified_match.group(1).upper() == "TRUE"
            
        if feedback_match:
            cohereFeedback = feedback_match.group(1).strip()
        
        # print(f"Parsed verification: {isVerified}")
        # print(f"Parsed feedback: {cohereFeedback}")

        return {"VERIFIED": isVerified, "FEEDBACK": cohereFeedback}

    except Exception as e:
        print(f"Error in validateMeal: {e}")
        return {"VERIFIED": False, "FEEDBACK": f"Error: {str(e)}"}
    

def main(prompt,preferences) -> str:
    load_dotenv()

    restaurantStr = json.dumps(restaurants)
    preferencesStr = json.dumps(preferences)
        
    gemRes = generateMeal(prompt, "", restaurantStr=restaurantStr,preferences=preferencesStr)
    print(gemRes)
    coRes = validateMeal(prompt, gemRes, restaurantStr=restaurantStr,preferences=preferencesStr)
    print(coRes)

    while not coRes["VERIFIED"]:
        gemRes = generateMeal(prompt, coRes["FEEDBACK"], restaurantStr,preferences=preferencesStr)
        print(gemRes)
        coRes = validateMeal(prompt, gemRes, restaurantStr,preferences=preferencesStr)
        print(coRes)
    
    return gemRes
        
            
if __name__ == "__main__":
    main(prompt="",preferences="")