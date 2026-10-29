from flask import Blueprint, request, jsonify
from app.models import Session, SessionPlayer, GameResult, User
from app.extensions import db
import datetime

game_bp = Blueprint('game', __name__)

# Helper to verify token (simplified for now, ideally use a decorator)
def get_user_from_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    
    try:
        token = auth_header.split(" ")[1]
        import jwt
        from config import Config
        data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        return User.query.get(data['user_id'])
    except:
        return None

@game_bp.route('/submit', methods=['POST'])
def submit_metrics():
    user = get_user_from_token(request)
    if not user:
        return jsonify({'message': 'Authentication required'}), 401

    data = request.get_json()
    session_id = data.get('session_id')
    metrics = data.get('metrics')

    if not session_id or not metrics:
        return jsonify({'message': 'Session ID and metrics required'}), 400

    # Verify session exists and user was part of it
    session = Session.query.get(session_id)
    if not session:
        return jsonify({'message': 'Session not found'}), 404
    
    player = SessionPlayer.query.filter_by(session_id=session_id, user_id=user.id).first()
    if not player:
        return jsonify({'message': 'User was not part of this session'}), 403

    # Store results
    result = GameResult(session_id=session_id, user_id=user.id, metrics=metrics)
    db.session.add(result)
    db.session.commit()

    return jsonify({'message': 'Metrics submitted successfully'}), 201
