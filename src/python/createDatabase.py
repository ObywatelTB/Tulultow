from mongoengine import *
import json
import turtle
import random
import datetime

connect("z")


class User (DynamicDocument):
    city = StringField()
    country = StringField()
    name = StringField()
    email = StringField(unique=True, required=True)
    password = StringField()
    administrator = BooleanField()
    date_of_birth = DateField()
    favourite_galleries = ListField()
    recommended_galleries = ListField()
    tokens = ListField()
    createdAt = DateField()
    updatedAt = DateField()

    def json(self):
        user_dict = {
            "city": self.city,
            "country": self.country,
            "name": self.name,
            "email": self.email,
            "administrator": self.administrator,
            "password": self.email,
            "date_of_birth": self.date_of_birth,
            "favourite_galleries": self.favourite_galleries,
            "recommended_galleries": self.recommended_galleries,
            "tokens": self.tokens,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
        return json.dumps(user_dict)

    meta = {
        "indexes": ["email"]
    }


#tworzenie bazy urzytkonwnikow
for x in range(50):
     user1 = User(
        city="Krakow",
        country="Russia",
        administrator=False,
        date_of_birth=datetime.datetime(2020, 2, 2, 6, 35, 6, 764),
        name="user " + str(x),
        email="user "+str(x),
        password="a",
        createdAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764),
        updatedAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764)
    ).save()

userList = User.objects()



#tworzenie połączen pomiędzy urzytkownikami
for x in range(50):
    tabTemp = []
    for y in range(50):
        if userList[x].email != userList[y].email:
            a = random.randint(0,15)
            if a == 0:
                print(x)
                userTemp = userList[x]
                tabTemp1 = [userList[y], random.randint(1, 10)]
                tabTemp.append(tabTemp1)
                userTemp.favourite_galleries = tabTemp
                userTemp.save()
