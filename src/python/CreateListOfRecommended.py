import math
import json
import sys
import os
os.environ["SETTINGS_MODULE"] = 'settings'
from mongoengine import *
from python_settings import settings

sys.path.append(settings.SECRET_KEY)



print("a")

connect("tulultow-api")

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

john=Users.objects.get(email=sys.argv[1])
#john=Users.objects.get(email="Username@gmail.com")

print(john.name)

listToShowToJohn = []
listToShowToJohnTemp = []


tempTabWithIndexes = []
tempTabWithPoints = []

def geLikedPoints(favourite_galleriesOfUser, i):
    if(i < 1):
        return 1
    else:
        counter = 0
        for galleries in favourite_galleriesOfUser:
            tempTabWithIndexes.append(galleries[0].name[5:])
            if galleries[0] not in listToShowToJohnTemp:
                listToShowToJohn.append([galleries[0], galleries[1]])
                listToShowToJohnTemp.append(galleries[0])
            else:
                for n, j in enumerate(listToShowToJohn):
                    if j[0] == galleries[0]:
                        listToShowToJohn[n] = [galleries[0], j[1]+galleries[1]]

            likedGalleriesOfUserFriends = galleries[0].favourite_galleries
            geLikedPoints(likedGalleriesOfUserFriends, i-1)
            counter = counter+1


geLikedPoints(john.favourite_galleries, 3)


listToShowToJohn.sort(key=lambda x:x[1],reverse=True)


top5 = listToShowToJohn[:5]

i=1
while len(top5)<4:
    top5.append([userList[i], 0])
    i += 1

listToShowToJohnWithGalleries = []
john.recommended_galleries = listToShowToJohnWithGalleries

tabOb=column(top5,0)
tabVal=column(top5,1)
for i, element in enumerate(top5):
    gal = Galleries.objects.get(owner=tabOb[i]._id)
    john.recommended_galleries.append({"points": tabVal[i], "gallery": gal._id})




#john.recommended_galleries = listToShowToJohnWithGalleries
#john.update()



for i in listToShowToJohn:
    print(i[0].name + ' ' + str(i[1]))


	