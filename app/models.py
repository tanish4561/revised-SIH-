from app.extensions import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='player') # 'admin' or 'player'
    
    def __repr__(self):
        return f'<User {self.username}>'

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='CREATED') # CREATED, STARTED, COMPLETED
    config = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    players = db.relationship('SessionPlayer', backref='session', lazy=True)

class SessionPlayer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('session.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_role = db.Column(db.String(50), nullable=False) # 'Rescuer', 'ChemicalExpert'
    status = db.Column(db.String(20), default='PENDING') # PENDING, JOINED
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

class GameResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('session.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    metrics = db.Column(db.JSON, nullable=False)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

class PerformanceReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('session.id'), nullable=False)
    report_content = db.Column(db.Text, nullable=False) # The AI generated text
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
