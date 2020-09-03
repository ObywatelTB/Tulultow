from mongoengine import *
import json
import turtle
import random
import datetime
from collections import namedtuple

class Struct:
    def __init__(self, **entries):
        self.__dict__.update(entries)


connect("z")


def column(matrix, i):
    return [row[i] for row in matrix]


class Users (DynamicDocument):
    _id = ObjectIdField()
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
            "_id": self._id,
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


class Galleries (DynamicDocument):
    _id = ObjectIdField()
    categories = ListField()
    rooms = ListField()
    owner = ObjectIdField()
    createdAt = DateField()
    updatedAt = DateField()

    def json(self):
        user_dict = {
            "_id": self._id,
            "categories": self.city,
            "rooms": self.country,
            "owner": self.owner,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
        return json.dumps(user_dict)

    meta = {
        "indexes": ["email"]
    }

#tworzenie bazy urzytkonwnikow
def createUserAndGalleriesDatabase():
    for x in range(50):
        user1 = Users(
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

    userList_local = Users.objects()

    for x in range(50):
        gal1 = Galleries(
            owner=userList_local[x]._id,
            createdAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764),
            updatedAt=datetime.datetime(2020, 2, 2, 6, 35, 6, 764)
         ).save()
    galleriesList_local = Galleries.objects()
    return[userList_local, galleriesList_local]


def createLinksBetweenUsers(userList_local):
    for x in range(50):
        tabTemp = []
        for y in range(50):
            if userList_local[x].email != userList_local[y].email:
                a = random.randint(0, 15)
                if a == 0:
                    print(x)
                    userTemp = userList_local[x]
                    userTemp.favourite_galleries.append({"points": random.randint(1, 10), "user": userList_local[y]._id})
                    userTemp.save()


def createListOfRecommendedForGivenUser_Recursion(john):

    listToShowToJohn = []
    listToShowToJohnTemp = []

    def geLikedPoints(favourite_galleriesOfUser, i):
        if (i < 1):
            return 1
        else:
            counter = 0
            for galleriesC in favourite_galleriesOfUser:
                s = Struct(**galleriesC)
                if s.user not in listToShowToJohnTemp:
                    listToShowToJohn.append([s.user, s.points])
                    listToShowToJohnTemp.append(s.user)
                else:
                    for n, j in enumerate(listToShowToJohn):
                        if j[0] == s.user:
                            listToShowToJohn[n] = [s.user, j[1] + s.points]

                uj = Users.objects(_id=s.user).get()
                likedGalleriesOfUserFriends = uj.favourite_galleries
                geLikedPoints(likedGalleriesOfUserFriends, i - 1)
                counter = counter + 1

    geLikedPoints(john.favourite_galleries, 3)

    listToShowToJohn.sort(key=lambda x: x[1], reverse=True)

    top5 = listToShowToJohn[:5]

    i = 1
    while len(top5) < 4:
        top5.append([userList[i]._id, 0])
        i += 1

    return top5




def createRecommendedForAllUsers():
    for x in range(50):
        userTemp2 = userList[x]
        print(x)
        tp = createListOfRecommendedForGivenUser_Recursion(userTemp2)

        listToShowToJohnWithGalleries = []
        userTemp2.recommended_galleries = listToShowToJohnWithGalleries

        tabOb = column(tp, 0)
        tabVal = column(tp, 1)

        for i, element in enumerate(tp):
            gal = Galleries.objects(owner=tabOb[i]).get()
            userTemp2.recommended_galleries.append({"points": tabVal[i], "gallery": gal._id})
            Users.objects(_id=userList[x]._id).update(set__recommended_galleries=userTemp2.recommended_galleries)



def calibrationForGivenUsers(john, johnFriend):
    wagaTemp=0.1
    for user2 in johnFriend.favourite_galleries:
        for user3 in john.favourite_galleries:
            s1 = Struct(**user2)
            s2 = Struct(**user3)
            if s1 == s2:
                waga=waga+0.1

    return wagaTemp




def createFinalList_Recursion(john):

    listToShowToJohn = []
    listToShowToJohnTemp = []

    def geLikedPoints(favourite_galleriesOfUser, i):
        if (i < 1):
            return 1
        else:
            counter = 0
            for galleriesC in favourite_galleriesOfUser:
                s = Struct(**galleriesC)
                pointCalc= s.points * calibrationForGivenUsers(john,  Users.objects(_id=s.user).get())*i
                if s.user not in listToShowToJohnTemp:
                    listToShowToJohn.append([s.user, pointCalc])
                    listToShowToJohnTemp.append(s.user)
                else:
                    for n, j in enumerate(listToShowToJohn):
                        if j[0] == s.user:
                            listToShowToJohn[n] = [s.user, j[1] + pointCalc]

                uj = Users.objects(_id=s.user).get()
                likedGalleriesOfUserFriends = uj.favourite_galleries
                geLikedPoints(likedGalleriesOfUserFriends, i - 1)
                counter = counter + 1

    geLikedPoints(john.favourite_galleries, 3)

    listToShowToJohn.sort(key=lambda x: x[1], reverse=True)

    top5 = listToShowToJohn[:5]

    i = 1
    while len(top5) < 4:
        top5.append([userList[i]._id, 0])
        i += 1

    return top5


def createFinalList(john):
    tp = createFinalList_Recursion(john)
    john.recommended_galleries = []
    for i, element in enumerate(tp):
        gal = Galleries.objects(owner=column(tp, 0)[i]).get()
        john.recommended_galleries.append({"points": column(tp, 1)[i], "gallery": gal._id})
        Users.objects(_id=john._id).update(set__recommended_galleries=john.recommended_galleries)


createUserAndGalleriesDatabase()

userList = Users.objects()
galleriesList = Galleries.objects()


createLinksBetweenUsers(userList)

#Inicjalizacja dla wszystkich użytkowników
#createRecommendedForAllUsers()

#kalibracja i propozycja
createFinalList(userList[0])







