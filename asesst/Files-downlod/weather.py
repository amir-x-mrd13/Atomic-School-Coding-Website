
import requests as re

city = input("Your city: ")

url = f"https://wttr.in/{city}?format=j1"

response = re.get(url, timeout=10)
    
    # بررسی اینکه آیا درخواست موفق بوده یا نه
if response.status_code == 200:
    data = response.json()
        
    # گرفتن دما
    temp = data["current_condition"][0]["temp_C"]
    print(f"دمای هوای {city} در حال حاضر {temp} درجه سانتی‌گراد است.")
    
else:
    print("مشکلی در اتصال به اینترنت پیش آمد")

