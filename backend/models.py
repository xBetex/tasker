from sqlalchemy import Column, Integer, String, ForeignKey, Enum, create_engine
from sqlalchemy.orm import relationship, declarative_base
import enum

Base = declarative_base()

class TaskStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in progress"
    COMPLETED = "completed"
    AWAITING_CLIENT = "awaiting client"

class TaskPriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Client(Base):
    __tablename__ = "clients"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    company = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    tasks = relationship("Task", back_populates="client", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    client_id = Column(String, ForeignKey("clients.id"))
    date = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    sla_date = Column(String, nullable=True)  # Data limite do SLA
    completion_date = Column(String, nullable=True)  # Data de conclusão real
    
    client = relationship("Client", back_populates="tasks") 