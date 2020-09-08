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
galleriesList = Galleries.objects()

user0=Users.objects.get(email=sys.argv[1])
#user0=Users.objects.get(email="Username@gmail.com")

#print(user0.name)






def Recursion(john, callibrationBool):
    listToShowToJohn = []
    listToShowToJohnTemp = []

    def geLikedPoints(favourite_galleriesOfUser, i, callibrationBool2):
        if (i < 1):
            return 1
        else:
            counter = 0
            for galleriesC in favourite_galleriesOfUser:
                s = Struct(**galleriesC)
                gal = Galleries.objects(_id=s.gallery).first()
                galOwner = Users.objects(_id=gal.owner).first()
                if callibrationBool2 == 1:
                    pointCalc = s.points * calibrationForGivenUsers(john, galOwner) * i
                else:
                    pointCalc = s.points

                if gal not in listToShowToJohnTemp:
                    listToShowToJohn.append([s.gallery, pointCalc])
                    listToShowToJohnTemp.append(s.gallery)
                else:
                    for n, j in enumerate(listToShowToJohn):
                        if j[0] == gal:
                            listToShowToJohn[n] = [s.gallery, j[1] + pointCalc]

                likedGalleriesOfUserFriends = galOwner.favourite_galleries
                geLikedPoints(likedGalleriesOfUserFriends, i - 1, callibrationBool2)
                counter = counter + 1

    geLikedPoints(john.favourite_galleries, 3, callibrationBool)

    listToShowToJohn.sort(key=lambda x: x[1], reverse=True)

    top20 = listToShowToJohn[:20]

    i = 1
    while len(top20) < 20:
        top20.append([galleriesList[i]._id, 0])
        i += 1

    return top20








def createListOfRecommendedForGivenUser_Recursion(john):
    userTemp2 = john
    tp = Recursion(userTemp2, 0)

    listToShowToJohnWithGalleries = []
    userTemp2.recommended_galleries = listToShowToJohnWithGalleries

    tabOb = column(tp, 0)
    tabVal = column(tp, 1)

    for i, element in enumerate(tp):
        userTemp2.recommended_galleries.append({"points": tabVal[i], "gallery": tabOb[i]})
        Users.objects(_id=john._id).update(set__recommended_galleries=userTemp2.recommended_galleries)




def calibrationForGivenUsers(john, johnFriend):
    wagaTemp=0.1
    for user2 in johnFriend.favourite_galleries:
        for user3 in john.favourite_galleries:
            s1 = Struct(**user2)
            s2 = Struct(**user3)
            if s1 == s2:
                waga=waga+0.1

    return wagaTemp





def createFinalList(john):
    tp = Recursion(john, 1)

    for i, element in enumerate(tp):
        john.recommended_galleries.append({"points": column(tp, 1)[i], "gallery": column(tp, 0)[i]})
        Users.objects(_id=john._id).update(set__recommended_galleries=john.recommended_galleries)

#Inicjalizacja dla wszystkich użytkowników
createListOfRecommendedForGivenUser_Recursion(user0)

#kalibracja i propozycja
createFinalList(user0)

