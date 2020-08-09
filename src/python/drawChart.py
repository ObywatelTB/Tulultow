import math
from mongoengine import *
import json
import turtle

import random

connect("tulultow-api-test")

win_width, win_height, bg_color = 2000, 2000, 'white'

turtle.setup()
turtle.screensize(win_width, win_height, bg_color)

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
    valueInt = IntField

    def json(self):
        likes_dict = {
            "author": self.author,
            "receivingUser": self.receivingUser,
            "valueInt": self.valueInt
        }
        return json.dumps(likes_dict)



userList = User.objects()



john = userList[0]
listToShowToJohn = []
listToShowToJohnTemp=[]

LikesOfJohn = Likes.objects(author=john)

turtle.penup()
turtle.goto(0, 230)
turtle.write("John", move=False, align="left", font=("Arial", 8, "normal"))

pointLocat1=(0,230)
point2=(0,0)
numbtemp=3
tempTabWithIndexes=[]
tempTabWithPoints=[]


def geLikedPoints(LikesOfUser, i, point1):
    if(i < 1):

        return 1
    else:
        licz=0
        for like in LikesOfUser:
           # print( like.receiving.username)
            point2 = (point1[0] - (25 - 18 * licz) * i * i * i, point1[1] - 50 - (150 * licz * math.floor(i / 3)))
            turtle.goto(point1)
            turtle.pendown()
            turtle.goto(point2)
            turtle.penup()
            Pointddd=(point2[0] + 3, point2[1])
            turtle.goto(point2[0] + 3, point2[1])
            tempTabWithIndexes.append(like.receivingUser.name[5:])
            tempTabWithPoints.append(Pointddd)
            turtle.write(like.receivingUser.name[5:], move=False, align="left", font=("Arial", 8, "normal"))
            turtle.goto(point2[0] + 3, point2[1] - 10)
            turtle.write(like.valueInt, move=False, align="left", font=("Arial", 8, "normal"))
            if like.receivingUser not in listToShowToJohnTemp:
                listToShowToJohn.append([like.receivingUser, like.valueInt])
                listToShowToJohnTemp.append(like.receivingUser)
            else:
                for n, j in enumerate(listToShowToJohn):
                    if j[0] == like.receivingUser:
                        listToShowToJohn[n] = [like.receivingUser, j[1]+like.valueInt]

            LikesOfUserFriends = Likes.objects(author=like.receivingUser)

            pointaa = (point1[0] - (25-18*licz)*i*i*i,point1[1]-50-(150*licz*math.floor(i/3)))
            geLikedPoints(LikesOfUserFriends, i-1, pointaa)
            licz=licz+1



geLikedPoints(LikesOfJohn, 3, pointLocat1)


listToShowToJohn.sort(key=lambda x:x[1],reverse=True)


for i in listToShowToJohn:
    print(i[0].name + ' ' + str(i[1]))


value = int(input("Podaj jakąś liczbę: "))

licz2=0
turtle.colormode(255)
for i in tempTabWithIndexes:

    if int(i) == value:
        turtle.penup()
        turtle.pencolor(244, 28, 27)
        turtle.goto(tempTabWithPoints[licz2])
        turtle.write(value, move=False, align="left", font=("Arial", 8, "bold"))

    licz2=licz2+1



turtle.hideturtle()
turtle.exitonclick()