from alembic import context

from app.db import database_url, engine
from app.models import Base


# Alembic은 운영 환경에서도 같은 마이그레이션 파일을 순서대로 적용한다.
if context.is_offline_mode():
    context.configure(url=database_url(), target_metadata=Base.metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()
else:
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)
        with context.begin_transaction():
            context.run_migrations()
