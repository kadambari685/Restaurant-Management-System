from fastapi import UploadFile, File
import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Menu
from schemas import MenuCreate

router = APIRouter()


# Create a new menu item
@router.post("/menu")
def create_menu(item: MenuCreate, db: Session = Depends(get_db)):
    menu = Menu(
        name=item.name,
        desc=item.desc,
        category=item.category,
        price=item.price,
        tag=item.tag,
        img=item.img,
        rating=item.rating,
        time=item.time,
    )

    db.add(menu)
    db.commit()
    db.refresh(menu)

    return menu


# Get all menu items
@router.get("/menu")
def get_menu(db: Session = Depends(get_db)):
    menu_items = db.query(Menu).all()
    return menu_items

@router.put("/menu/{menu_id}")
def update_menu(menu_id: int, item: MenuCreate, db: Session = Depends(get_db)):
    menu = db.query(Menu).filter(Menu.id == menu_id).first()

    if not menu:
        return {"message": "Menu item not found"}

    menu.name = item.name
    menu.desc = item.desc
    menu.category = item.category
    menu.price = item.price
    menu.tag = item.tag
    menu.img = item.img
    menu.rating = item.rating
    menu.time = item.time

    db.commit()
    db.refresh(menu)

    return menu

@router.delete("/menu/{menu_id}")
def delete_menu(menu_id: int, db: Session = Depends(get_db)):
    menu = db.query(Menu).filter(Menu.id == menu_id).first()

    if not menu:
        return {"message": "Menu item not found"}

    db.delete(menu)
    db.commit()

    return {"message": "Menu deleted successfully"}

@router.post("/upload-menu")
def upload_menu(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    df = pd.read_excel(file.file)

    db.query(Menu).delete()

    for _, row in df.iterrows():
        item = Menu(
            name=row["name"],
            desc=row["desc"],
            category=row["category"],
            price=row["price"],
            tag=row["tag"],
            img=row["img"],
            rating=row["rating"],
            time=row["time"],
        )

        db.add(item)

    db.commit()

    return {
        "message": "Menu uploaded successfully"
    }
from models import Menu, Reservation

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    return {
        "total_menu_items": db.query(Menu).count(),
        "total_reservations": db.query(Reservation).count(),
    }

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    return {
        "total_menu_items": db.query(Menu).count(),
        "total_reservations": db.query(Reservation).count()
    }
