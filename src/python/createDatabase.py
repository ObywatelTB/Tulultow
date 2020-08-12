from mongoengine import *
import json
import turtle
import random

connect("tulultow-api-test")

class User (Document):
    email = StringField(unique=True, required=True)
    name = StringField()
    age = IntField()
    city = StringField()
    country = StringField()
    def json(self):
        user_dict = {
            "email": self.email,
            "name": self.name,
            "age": self.age,
            "city": self.city,
            "country": self.country
        }
        return json.dumps(user_dict)

    meta = {
        "indexes": ["email"]
    }



class Likes(DynamicDocument):
    author = ReferenceField(User)
    receivingUser = ReferenceField(User)
    valueInt = IntField(required=True)

    def json(self):
        likes_dict = {
            "author": self.author,
            "receivingUser": self.receivingUser,
            "valueInt": self.valueInt
        }
        return json.dumps(likes_dict)

#tworzenie bazy urzytkonwnikow
for x in range(200):
    user1 = User(
        email="user "+str(x),
        name="user "+str(x),
        age=25,
        city="Krakow",
        country="Russia"
    ).save()

userList = User.objects()

#tworzenie połączen pomiędzy uzytkownikami
for x in range(100):
    for y in range(100):
        if userList[x].email != userList[y].email:
            a = random.randint(0,30)
            if a == 0:
                print(x)
                ll1 = Likes(author=userList[x], receivingUser=userList[y], valueInt=random.randint(1, 10)).save()