import pandas as pd
import numpy as np
from datetime import datetime
import os
import random

FILE_PATH = "data/data.csv"

stores = ['Reliance Fresh', 'Big Bazaar', 'DMart', 'More Supermarket', 'Spencers', 'Nilgiris', 'Food Bazaar', 'Vijay Sales']
products = ['Rice', 'Wheat Flour', 'Sugar', 'Tea', 'Coffee', 'Milk', 'Bread', 'Butter', 'Cheese', 'Chicken', 'Fish', 'Vegetables', 'Fruits', 'Soap', 'Shampoo', 'Toothpaste']

def generate_data():
    timestamp = datetime.now()

    store = random.choice(stores)
    product = random.choice(products)

    base_sales = np.random.randint(50, 150)

    hour = timestamp.hour
    if 18 <= hour <= 22:
        base_sales += np.random.randint(20, 50)

    sales = base_sales + np.random.randint(-10, 10)
    price = np.random.uniform(10, 100)

    new_data = pd.DataFrame({
        "timestamp": [timestamp],
        "store_id": [store],
        "product_id": [product],
        "sales": [sales],
        "price": [round(price, 2)]
    })

    if os.path.exists(FILE_PATH):
        new_data.to_csv(FILE_PATH, mode='a', header=False, index=False)
    else:
        new_data.to_csv(FILE_PATH, index=False)

    print(f"{timestamp} | {store} | {product} | {sales}")

if __name__ == "__main__":
    generate_data()
