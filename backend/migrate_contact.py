"""Add contact_messages table"""
from app import create_app
from app.extensions import db
from app.models import ContactMessage

app = create_app()
with app.app_context():
    db.create_all()
    print("contact_messages table created (or already exists).")
