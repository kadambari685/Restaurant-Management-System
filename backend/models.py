from sqlalchemy import Column, Integer, String, Float
from database import Base

class Menu(Base):
    __tablename__ = "menu"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)
    desc = Column(String)
    category = Column(String)

    price = Column(String)

    tag = Column(String)

    img = Column(String)

    rating = Column(Float)

    time = Column(String)

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    date = Column(String)
    time = Column(String)
    occasion = Column(String)
    party_size = Column(Integer)
    seating = Column(String)