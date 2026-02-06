import json
import requests

SANITY_PROJECT_ID = "4ddas0r0"
SANITY_DATASET = "production"
SANITY_TOKEN = "skn36CVBszNNp1bvnZ9nmNls4EFqLTQHAC7wJpIb42BYnn47wgDZyrCajuQw3HY6qzYMkwwFbbI3k8oksCaPnECC8Cs7HO0hB7tNJVbjFu356SQdLTdYsLJnfzo0ts8YaWztukuNQsLf5rgzfATUSkUmAAsaykFVgXclhaZdJFuDtMnqpl33"
SANITY_VERSION = "2024-01-01"

headers = {
    "Authorization": f"Bearer {SANITY_TOKEN}",
    "Content-Type": "application/json"
}

from urllib.parse import quote

en_query = "*[_type == 'homepage' && language == 'en'][0]{techStack{items}}"
en_url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_VERSION}/data/query/{SANITY_DATASET}?query={quote(en_query)}"
en_resp = requests.get(en_url, headers=headers)
en_data = en_resp.json()
en_items = en_data["result"]["techStack"]["items"]

ar_query = "*[_type == 'homepage' && language == 'ar'][0]{techStack{items}}"
ar_url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_VERSION}/data/query/{SANITY_DATASET}?query={quote(ar_query)}"
ar_resp = requests.get(ar_url, headers=headers)
ar_data = ar_resp.json()
ar_items = ar_data["result"]["techStack"]["items"]

en_icon_map = {item["name"]: item["icon"] for item in en_items}

for ar_item in ar_items:
    ar_name = ar_item["name"]
    en_name_candidates = [k for k in en_icon_map.keys() if k.lower() in ar_name.lower() or ar_name.lower() in k.lower()]
    
    if not en_name_candidates:
        for en_name, icon in en_icon_map.items():
            if en_name.lower().replace(" ", "") == ar_name.lower().replace(" ", ""):
                ar_item["icon"] = icon
                break
    else:
        ar_item["icon"] = en_icon_map[en_name_candidates[0]]

icon_mapping = {
    "بايثون": "simple-icons:python",
    "ر": "simple-icons:r",
    "أوس": "simple-icons:amazonaws",
    "أزور": "simple-icons:microsoftazure",
    "Google Cloud Platform": "simple-icons:googlecloud",
    "ندفة الثلج": "simple-icons:snowflake",
    "طوب البيانات": "simple-icons:databricks",
    "لوحة": "simple-icons:tableau",
    "الطاقة بي": "simple-icons:powerbi",
    "الناظر": "simple-icons:looker",
    "قاعدة التعريف": "simple-icons:metabase",
    "أباتشي سوبرسيت": "simple-icons:apachesuperset",
    "dbt": "simple-icons:dbt",
    "تدفق الهواء": "simple-icons:apacheairflow",
    "شرارة": "simple-icons:apachespark",
    "كافكا": "simple-icons:apachekafka",
    "TensorFlow": "simple-icons:tensorflow",
    "باي تورش": "simple-icons:pytorch",
    "تعانق الوجه": "simple-icons:huggingface",
    "Scikit تعلم": "simple-icons:scikitlearn",
    "MLflow": "simple-icons:mlflow",
    "كوكب المشتري": "simple-icons:jupyter",
    "الباندا": "simple-icons:pandas",
    "NumPy": "simple-icons:numpy",
    "PostgreSQL": "simple-icons:postgresql",
    "MongoDB": "simple-icons:mongodb",
    "ريديس": "simple-icons:redis",
    "بحث مرن": "simple-icons:elasticsearch",
    "بوابة": "simple-icons:git",
    "عامل ميناء": "simple-icons:docker",
    "كوبيرنيتيس": "simple-icons:kubernetes",
    "جرافانا": "simple-icons:grafana",
    "بروميثيوس": "simple-icons:prometheus",
    "InfluxDB": "simple-icons:influxdb",
    "صرصورDB": "simple-icons:cockroachlabs",
    "كاساندرا": "simple-icons:apachecassandra",
    "قارورة": "simple-icons:flask"
}

for ar_item in ar_items:
    if "icon" not in ar_item or not ar_item["icon"]:
        ar_item["icon"] = icon_mapping.get(ar_item["name"], "simple-icons:python")

url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_VERSION}/data/mutate/{SANITY_DATASET}"
mutations = [{
    "patch": {
        "id": "36c1a7cc-9504-4705-837a-466eaab2a289-ar",
        "set": {
            "techStack.items": ar_items
        }
    }
}]

response = requests.post(url, json={"mutations": mutations}, headers=headers)
print(f"Status: {response.status_code}")
if response.status_code in [200, 201]:
    print("✓ Tech stack icons added successfully")
    print(f"Updated {len(ar_items)} items")
else:
    print("✗ Failed to update")
    print(response.text)
