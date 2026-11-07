from openai import OpenAI

# ۱. تنظیمات اتصال به OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="YOUR_API_KEY",
)

# ۲. انتخاب یک مدل جایگزین که در OpenRouter فعال است
MODEL_NAME = "deepseek/deepseek-chat"  # <--- این را تغییر دهید به:
# MODEL_NAME = "deepseek/deepseek-chat"
# یا
# MODEL_NAME = "google/gemini-2.0-flash-exp:free"

print("--- چت‌بات OpenRouter آماده است! (برای خروج 'exit' یا 'quit' را تایپ کنید) ---")

messages = [
    {
        "role": "system",
        "content": "You are a helpful and friendly AI assistant.",
    }
]

while True:
  user_input = input("\nشما: ")

  if user_input.lower() in ["exit", "quit"]:
    print("خداحافظ!")
    break

  messages.append({"role": "user", "content": user_input})

  try:
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
    )

    bot_reply = response.choices[0].message.content
    print(f"\nبات: {bot_reply}")

    messages.append({"role": "assistant", "content": bot_reply})

  except Exception as e:
    print(f"\nخطایی رخ داد: {e}")  