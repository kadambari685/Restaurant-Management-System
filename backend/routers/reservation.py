from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Reservation
from schemas import ReservationCreate

router = APIRouter()


@router.post("/reservation")
def create_reservation(
    reservation: ReservationCreate,
    db: Session = Depends(get_db)
):
    new_reservation = Reservation(
        name=reservation.name,
        email=reservation.email,
        phone=reservation.phone,
        date=reservation.date,
        time=reservation.time,
        occasion=reservation.occasion,
        party_size=reservation.party_size,
        seating=reservation.seating,
    )

    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)

    return new_reservation


@router.get("/reservation")
def get_reservations(db: Session = Depends(get_db)):
    return db.query(Reservation).all()