from flask import Flask
from config import Config
from app.extensions import db, bcrypt
from flask_cors import CORS

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    CORS(app, resources={r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173"]
    }})

    db.init_app(app)
    bcrypt.init_app(app)

    from app.routes.auth import auth_bp
    from app.routes.sessions import sessions_bp
    from app.routes.game import game_bp
    from app.routes.dashboard import dashboard_bp, analytics_bp
    from app.routes.comparison import comparison_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(sessions_bp, url_prefix='/sessions')
    app.register_blueprint(game_bp, url_prefix='/game')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    app.register_blueprint(analytics_bp)
    app.register_blueprint(comparison_bp, url_prefix='/api/comparison')

    with app.app_context():
        db.create_all()

    @app.route('/')
    def hello():
        return 'Backend Alpha is running!'

    return app
