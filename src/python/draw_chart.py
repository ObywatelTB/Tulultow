import math
from mongoengine import *
import json
import turtle

import random

connect("z")

def column(matrix, i):
    return [row[i] for row in matrix]

win_width, win_height, bg_color = 2000, 2000, 'white'

turtle.setup()
turtle.screensize(win_width, win_height, bg_color)

class User (DynamicDocument):
    city = StringField()
    country = StringField()
    name = StringField()
    email = StringField(unique=True, required=True)
    password = StringField()
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
            "password": self.email,
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

userList = User.objects()



john = userList[0]
listToShowToJohn = []
listToShowToJohnTemp=[]

turtle.penup()
turtle.goto(0, 230)
turtle.write("John", move=False, align="left", font=("Arial", 8, "normal"))

pointLocat1=(0,230)
point2=(0,0)
numbtemp=3
tempTabWithIndexes = []
tempTabWithPoints = []


def geLikedPoints(favourite_galleriesOfUser, i, point1):
    if(i < 1):

        return 1
    else:
        licz=0
        for galleries in favourite_galleriesOfUser:
           # print( like.receiving.username)
            point2 = (point1[0] - (25 - 18 * licz) * i * i * i, point1[1] - 50 - (150 * licz * math.floor(i / 3)))
            turtle.goto(point1)
            turtle.pendown()
            turtle.goto(point2)
            turtle.penup()
            Pointddd=(point2[0] + 3, point2[1])
            turtle.goto(point2[0] + 3, point2[1])
            tempTabWithIndexes.append(galleries[0].name[5:])
            tempTabWithPoints.append(Pointddd)
            turtle.write(galleries[0].name[5:], move=False, align="left", font=("Arial", 8, "normal"))
            turtle.goto(point2[0] + 3, point2[1] - 10)
            turtle.write(galleries[1], move=False, align="left", font=("Arial", 8, "normal"))

            LikedGalleriesOfUserFriends = galleries[0].favourite_galleries
            pointaa = (point1[0] - (25-18*licz)*i*i*i,point1[1]-50-(150*licz*math.floor(i/3)))
            geLikedPoints(LikedGalleriesOfUserFriends, i-1, pointaa)
            licz = licz+1


geLikedPoints(john.favourite_galleries, 3, pointLocat1)


listToShowToJohn.sort(key=lambda x:x[1],reverse=True)


for i in listToShowToJohn:
    print(i[0].name + ' ' + str(i[1]))


'''value = int(input("Podaj jakąś liczbę: "))

licz2=0
turtle.colormode(255)
for i in tempTabWithIndexes:

    if int(i) == value:
        turtle.penup()
        turtle.pencolor(244, 28, 27)
        turtle.goto(tempTabWithPoints[licz2])
        turtle.write(value, move=False, align="left", font=("Arial", 8, "bold"))

    licz2=licz2+1'''



turtle.hideturtle()
turtle.exitonclick()


