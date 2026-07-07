from pydantic import BaseModel

class MenuCreate(BaseModel):
    name: str
    desc: str
    category: str
    price: str
    tag: str
    img: str
    rating: float
    time: str


class MenuResponse(MenuCreate):
    id: int

    class Config:
        from_attributes = True

class ReservationCreate(BaseModel):
    name: str
    email: str
    phone: str
    date: str
    time: str
    occasion: str
    party_size: int
    seating: str


class ReservationResponse(ReservationCreate):
    id: int

    class Config:
        from_attributes = True