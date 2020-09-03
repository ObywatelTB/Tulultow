import math
import json
import sys
import os
os.environ["SETTINGS_MODULE"] = 'settings'
from mongoengine import *
from python_settings import settings

sys.path.append(settings.SECRET_KEY)

connect("tulultow-api")

class Struct:
    def __init__(self, **entries):
        self.__dict__.update(entries)



def column(matrix, i):
    return [row[i] for row in matrix]

class Users (DynamicDocument):
    _id = ObjectIdField()
    email = StringField(unique=True, required=True)
    password = StringField()
    administrator = BooleanField()
    name = StringField()
    date_of_birth = DateField()
    city = StringField()
    country = StringField()
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
            "date_of_birth": self.date_of_birth,
            "administrator": self.administrator,
            "email": self.email,
            "password": self.password,
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

userList = Users.objects()
galleries = Galleries.objects()

user0=Users.objects.get(email=sys.argv[1])
#user0=Users.objects.get(email="Username@gmail.com")

#print(user0.name)


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

    listToShowToJohnWithGalleries = []
    john.recommended_galleries = listToShowToJohnWithGalleries

    tabOb = column(top5, 0)
    tabVal = column(top5, 1)

    for i, element in enumerate(top5):
        gal = Galleries.objects(owner=tabOb[i]).get()
        john.recommended_galleries.append({"points": tabVal[i], "gallery": gal._id})
        Users.objects(_id=john._id).update(set__recommended_galleries=john.recommended_galleries)






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








#Inicjalizacja dla wszystkich użytkowników
createListOfRecommendedForGivenUser_Recursion(user0)

#kalibracja i propozycja
createFinalList(user0)


