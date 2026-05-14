from apscheduler.schedulers.blocking import BlockingScheduler
from data_generator import generate_data

scheduler = BlockingScheduler()

# run every 5 minutes
scheduler.add_job(generate_data, 'interval', minutes=5)

print("🚀 Scheduler started... Generating data every 5 minutes")

scheduler.start()
